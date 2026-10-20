import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import {
  defaultSettingsMiddleware,
  LanguageModelMiddleware,
  wrapLanguageModel,
} from "ai";

const REASONING_MODEL = process.env.MAVEN_REASONING_MODEL || "gemini-2.5-flash";
const LIGHT_MODEL = process.env.MAVEN_LIGHT_MODEL || "gemini-2.5-flash-lite";

type StreamResult = Awaited<
  ReturnType<
    Parameters<NonNullable<LanguageModelMiddleware["wrapStream"]>>[0]["doStream"]
  >
>;
type StreamPart =
  StreamResult["stream"] extends ReadableStream<infer P> ? P : never;

const INTERRUPTED_NOTICE =
  "\n\n_The connection to the AI service dropped while answering, so this reply may be incomplete. Please ask again._";

/**
 * Turns a failure in the middle of a model stream into a normal ending.
 *
 * `streamUI` errors the whole rendered reply on an `error` part or a broken
 * stream. This ends the stream instead: with a short notice when the model was
 * writing text, or silently when a tool call already went out (the tool keeps
 * rendering). Tool input parts are dropped because `streamUI` only uses them to
 * flag a tool call, and a flagged call that never arrives leaves the reply
 * stuck on its loading state; the complete `tool-call` part sets the flag.
 */
export const recoverStreamErrors: LanguageModelMiddleware = {
  wrapStream: async ({ doStream }) => {
    const { stream, ...rest } = await doStream();
    const reader = stream.getReader();
    let toolCalled = false;

    const end = (
      controller: ReadableStreamDefaultController<StreamPart>,
      error: unknown
    ) => {
      logger.error("Model stream interrupted", { error });
      reader.cancel().catch(() => {});

      if (!toolCalled) {
        controller.enqueue({ type: "text-start", id: "interrupted" });
        controller.enqueue({
          type: "text-delta",
          id: "interrupted",
          delta: INTERRUPTED_NOTICE,
        });
        controller.enqueue({ type: "text-end", id: "interrupted" });
      }

      controller.enqueue({
        type: "finish",
        finishReason: { unified: "error", raw: undefined },
        usage: {
          inputTokens: {
            total: undefined,
            noCache: undefined,
            cacheRead: undefined,
            cacheWrite: undefined,
          },
          outputTokens: { total: undefined, text: undefined, reasoning: undefined },
        },
      });
      controller.close();
    };

    return {
      ...rest,
      stream: new ReadableStream<StreamPart>({
        async pull(controller) {
          try {
            // Loop past dropped parts: a pull that enqueues nothing is never
            // called again, which would stall the stream.
            while (true) {
              const { done, value } = await reader.read();
              if (done) return controller.close();

              if (value.type === "error") return end(controller, value.error);
              if (value.type.startsWith("tool-input-")) continue;
              if (value.type === "tool-call") toolCalled = true;

              return controller.enqueue(value);
            }
          } catch (error) {
            end(controller, error);
          }
        },
        cancel(reason) {
          return reader.cancel(reason);
        },
      }),
    };
  },
};

/**
 * Model tiers used across the agent pipeline. Pick by the job, not by habit:
 *
 * - `orchestrator`: `reasoning` plus stream-error recovery for `streamUI`.
 * - `reasoning`: routing, research and user-facing analysis (thinking on).
 * - `extract`: same model with thinking off, for turning scraped pages or
 *   search results into JSON/tables. The answer is in the input, so thinking
 *   only adds latency and cost.
 * - `light`: small follow-ups (related queries, inquiry options, chat title).
 *
 * Override the model ids with MAVEN_REASONING_MODEL / MAVEN_LIGHT_MODEL.
 */
export const models = {
  orchestrator: wrapLanguageModel({
    model: google(REASONING_MODEL),
    middleware: recoverStreamErrors,
  }),
  reasoning: google(REASONING_MODEL),
  extract: wrapLanguageModel({
    model: google(REASONING_MODEL),
    middleware: defaultSettingsMiddleware({
      settings: {
        providerOptions: {
          google: { thinkingConfig: { thinkingBudget: 0 } },
        },
      },
    }),
  }),
  light: google(LIGHT_MODEL),
};
