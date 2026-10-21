/**
 * The AI SDK UI replacement for the `@ai-sdk/rsc` primitives the tools used:
 * `ui()` describes a client component instead of creating a React element,
 * `createStreamable()` replaces `createStreamableValue()`, and `renderTools()`
 * runs render tools (`generate` generators) as AI SDK tools, writing each
 * yielded view into the reply's `data-view` part.
 */

import type { viewRegistry } from "@/components/custom/view-renderer";
import {
  MavenUIMessage,
  RenderTool,
  StreamableSink,
  StreamableValue,
  StreamGeneration,
  Streamed,
  ToolCallStatus,
  View,
  ViewNode,
} from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { generateId, Tool, UIMessageStreamWriter } from "ai";
import { ComponentProps } from "react";

export type MavenWriter = UIMessageStreamWriter<MavenUIMessage>;

type Registry = typeof viewRegistry;

/** Describes a registry component and its props for the client to render. */
export const ui = <K extends keyof Registry>(
  component: K,
  props: ComponentProps<Registry[K]>
): ViewNode => ({ component, props: props as Record<string, unknown> });

/** Flattens a view into the node list a `data-view` part carries. */
export const toNodes = (view: View): ViewNode[] =>
  ([view] as unknown[]).flat(Infinity).filter(Boolean) as ViewNode[];

const THROTTLE_MS = 50;

/**
 * A value streamed to the client as a `data-stream` part. Updates are
 * throttled because every write carries the whole value. Closing twice is a
 * no-op.
 */
export function createStreamable<T>(
  writer: MavenWriter,
  initial?: T
): StreamableValue<T> {
  const id = generateId();
  let latest = initial;
  let closed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const write = (status: Streamed<T>["status"]) =>
    writer.write({ type: "data-stream", id, data: { value: latest, status } });

  const close = (status: "done" | "error") => {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    write(status);
  };

  return {
    // The client resolves this reference to the `data-stream` part with this id.
    value: { $stream: id } as unknown as Streamed<T>,
    update: (value) => {
      if (closed) return;
      latest = value;
      timer ??= setTimeout(() => {
        timer = undefined;
        if (!closed) write("streaming");
      }, THROTTLE_MS);
    },
    done: (value) => {
      if (value !== undefined && !closed) latest = value;
      close("done");
    },
    error: () => close("error"),
  };
}

/**
 * Generation status sent as transient `data-generation` parts; the chat
 * panel shows its `process`. Updates after `done` are ignored.
 */
export function createGeneration(
  writer: MavenWriter
): StreamableSink<StreamGeneration> {
  let closed = false;
  const write = (data: StreamGeneration) => {
    if (!closed) writer.write({ type: "data-generation", data, transient: true });
  };

  return {
    update: write,
    done: (data) => {
      if (data) write(data);
      closed = true;
    },
    error: () => {
      closed = true;
    },
  };
}

/**
 * Turns render tools into AI SDK tools. Every view the tool yields or
 * returns replaces the reply's view through `show`, and the call itself is
 * reported as a `data-tool` part (name, input, status, duration) that the
 * client shows above the view.
 *
 * - An exception renders an error card and closes the generation instead of
 *   failing the whole reply.
 * - When the request is aborted the generator is stopped at its next yield.
 * - The reply has one view, so only the first call of a turn renders; a
 *   parallel second call is answered with "skipped".
 */
export function renderTools<T extends Record<string, RenderTool>>(
  toolset: T,
  {
    writer,
    show,
    generation,
  }: {
    writer: MavenWriter;
    show: (view: View) => void;
    generation: StreamableSink<StreamGeneration>;
  }
): Record<keyof T, Tool> {
  let claimed = false;

  return Object.fromEntries(
    Object.entries(toolset).map(([name, renderTool]) => [
      name,
      {
        description: renderTool.description,
        inputSchema: renderTool.inputSchema,
        execute: async (
          input: unknown,
          {
            toolCallId,
            abortSignal,
          }: { toolCallId: string; abortSignal?: AbortSignal }
        ) => {
          if (claimed) return "skipped: only one tool runs per turn";
          claimed = true;

          const started = Date.now();
          const report = (status: ToolCallStatus) =>
            writer.write({
              type: "data-tool",
              id: toolCallId,
              data: {
                name,
                input,
                status,
                durationMs:
                  status === "running" ? undefined : Date.now() - started,
              },
            });

          // Tools report handled failures (scrape, missing data) as an
          // ErrorMessage view rather than by throwing.
          let failed = false;
          const render = (view: View) => {
            const nodes = toNodes(view);
            failed = nodes.some((node) => node.component === "ErrorMessage");
            show(nodes);
          };

          report("running");

          try {
            const result = renderTool.generate?.(input, {
              toolName: name,
              toolCallId,
            });

            if (typeof (result as Generator)?.next === "function") {
              const it = result as AsyncGenerator<View, View, void>;
              for (let step = await it.next(); ; step = await it.next()) {
                render(await step.value);
                if (step.done) break;
                if (abortSignal?.aborted) {
                  await it.return(undefined);
                  break;
                }
              }
            } else {
              render(await (result as View | Promise<View>));
            }
          } catch (error) {
            if (abortSignal?.aborted) {
              report("stopped");
              return "aborted";
            }

            logger.error(`Tool ${name} failed`, { error });
            generation.done({
              process: "tool:fatal-error",
              loading: false,
              error: error instanceof Error ? error.message : String(error),
            });
            render(
              ui("ErrorMessage", {
                errorName: "Something went wrong",
                reason:
                  "This step failed before it could finish. Please try again; if it keeps failing, rephrase the request or try another product.",
                raw: { tool: name, error: String(error) },
              })
            );
          }

          report(abortSignal?.aborted ? "stopped" : failed ? "error" : "done");
          return "rendered";
        },
      } as Tool,
    ])
  ) as Record<keyof T, Tool>;
}
