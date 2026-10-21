/**
 * Shared building blocks for the render tools and the orchestrator:
 * streaming model output into streamed `data-stream` values, the related-query
 * follow-up, persisting tool results and closing the generation status.
 */

import { models } from "@/lib/agents/models";
import { toPayloadRelatedMessage } from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import {
  PartialRelated,
  RelatedQuery,
  relatedQuerySchema,
} from "@/lib/agents/schema/related";
import { createToolDataEntry } from "@/lib/service/store";
import {
  AIState,
  MessageProperty,
  MutableAIState,
  MutationPayload,
  StreamableSink,
  ToolsetProps,
} from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import {
  InferGenerateOutput,
  InferStreamOutput,
  LanguageModel,
  Output,
  OutputInterface,
  streamText,
} from "ai";
import { ui } from "./stream-ui";

export type ErrorState = { isError: boolean; error: unknown };

/** Error state scoped to a single tool call. */
export const createErrorState = (): ErrorState => ({
  isError: false,
  error: null,
});

// Distributive, so the `prompt` / `messages` union of the options survives.
type StreamOptions = Parameters<typeof streamText>[0] extends infer O
  ? O extends unknown
    ? Omit<O, "output" | "onError">
    : never
  : never;

/**
 * Runs `streamText` with an `onError` that records the failure, and closes the
 * streamable after the stream ends: `done()` on success, `error()` on failure.
 */
async function pipe<T, R>(
  streamable: StreamableSink<T>,
  errorState: ErrorState,
  run: (onError: (event: { error: unknown }) => void) => Promise<R>
): Promise<R | undefined> {
  const failure = { failed: false, error: null as unknown };

  const result = await run(({ error }) => {
    failure.failed = true;
    failure.error = error;
  });

  if (failure.failed) {
    errorState.isError = true;
    errorState.error = failure.error;
    streamable.error(failure.error);
    return undefined;
  }

  streamable.done();
  return result;
}

/**
 * Streams model text into `streamable` and resolves with the full text
 * (empty string when the generation failed).
 */
export async function streamTextToValue(
  streamable: StreamableSink<string>,
  errorState: ErrorState,
  options: StreamOptions
): Promise<string> {
  const text = await pipe(streamable, errorState, async (onError) => {
    let text = "";
    for await (const delta of streamText({ ...options, onError }).textStream) {
      text += delta;
      streamable.update(text);
    }
    return text;
  });

  return text ?? "";
}

/**
 * Streams a structured output (`Output.object` / `Output.json`) into
 * `streamable` and resolves with the parsed final value, or `undefined` when
 * the generation or parsing failed. `select` maps each partial before update.
 */
export async function streamOutputToValue<
  OUTPUT extends OutputInterface,
  T = InferStreamOutput<OUTPUT>
>(
  streamable: StreamableSink<T>,
  errorState: ErrorState,
  {
    select,
    ...options
  }: StreamOptions & {
    output: OUTPUT;
    select?: (partial: InferStreamOutput<OUTPUT>) => T | undefined;
  }
): Promise<InferGenerateOutput<OUTPUT> | undefined> {
  return pipe(streamable, errorState, async (onError) => {
    const result = streamText({ ...options, onError });

    for await (const partial of result.partialOutputStream) {
      const value = select
        ? select(partial as InferStreamOutput<OUTPUT>)
        : (partial as T);
      if (value !== undefined) streamable.update(value);
    }

    return (await Promise.resolve(result.output).catch(
      () => undefined
    )) as InferGenerateOutput<OUTPUT> | undefined;
  });
}

/**
 * Crafts related follow-up queries from the latest conversation messages.
 */
export async function streamRelatedQuery(
  streamable: StreamableSink<PartialRelated>,
  errorState: ErrorState,
  messages: MessageProperty[],
  usageLabel: string,
  model: LanguageModel = models.light
): Promise<RelatedQuery | null> {
  const related = await streamOutputToValue(streamable, errorState, {
    model,
    instructions: await SYSTEM_INSTRUCTION.RELATED_QUERY_CRAFTER,
    prompt: JSON.stringify(toPayloadRelatedMessage(messages)),
    output: Output.object({ schema: relatedQuerySchema }),
    onEnd: ({ usage }) => logger.info(`Usage - ${usageLabel}`, { usage }),
  });

  return related ?? null;
}

/**
 * Appends the tool call to the AI state and stores the tool result entry.
 * Returns the appended messages.
 */
export async function commitToolResult<ARGS, DATA>(
  state: MutableAIState<AIState>,
  generation: ToolsetProps["generation"],
  key: string,
  payload: MutationPayload<ARGS, DATA>
): Promise<MessageProperty[]> {
  const { toolResult, mutate } = mutateTool(state, payload);

  generation.update({
    process: "database:save-state",
    loading: true,
  });

  await createToolDataEntry({
    key,
    chatId: state.get().chatId,
    owner: state.get().username,
    tool: toolResult,
  });

  return mutate;
}

/**
 * Closes the generation status of a tool call. Returns the error UI when the
 * call recorded a failure, otherwise `null`.
 */
export function finishGeneration(
  generation: ToolsetProps["generation"],
  errorState: ErrorState,
  payload: unknown
) {
  if (!errorState.isError) {
    generation.done({
      process: "tool:done",
      loading: false,
    });
    return null;
  }

  generation.done({
    process: "tool:fatal-error",
    loading: false,
    error: "LLM Generation Error",
  });

  return ui("ErrorMessage", {
    errorName: "LLM Error",
    reason: "There was an error on LLMs Agent generation, that's all we know :(",
    raw: { payload, error: errorState },
  });
}


/**
 * Ends the generation status with an error. A no-op when the tool already
 * closed it.
 */
export function failGeneration(
  generation: ToolsetProps["generation"],
  error: unknown
) {
  generation.done({
    process: "tool:fatal-error",
    loading: false,
    error: error instanceof Error ? error.message : String(error),
  });
}
