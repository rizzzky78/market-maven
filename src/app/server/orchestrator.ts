import type { Models } from "@/lib/agents/models";
import {
  compactToolResults,
  toModelMessages,
  toUnifiedUserMessage,
} from "@/lib/agents/action/mutator/mutate-messages";
import { ensureChat } from "@/lib/agents/action/chat-service";
import { PartialRelated, RelatedQuery } from "@/lib/agents/schema/related";
import {
  AIState,
  ExtendedRequestOption,
  MutableAIState,
  PayloadData,
  ToolsetProps,
  ValueOrUpdater,
  View,
} from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { orchestratorInstruction } from "@/lib/agents/constant/md/orchestrator";
import { generateId, streamText } from "ai";
import { toolRecommendator } from "./tool-recommendator";
import { toolGetProductDetails } from "./tool-get-product-details";
import { toolSearchProduct } from "./tool-search-product";
import { toolProductComparison } from "./tool-products-comparison";
import { toolInquireUser } from "./tool-inquire-user";
import { toolWebResearch } from "./tool-web-research";
import { createErrorState, failGeneration, streamRelatedQuery } from "./workflow";
import {
  createGeneration,
  createStreamable,
  MavenWriter,
  renderTools,
  toNodes,
  ui,
} from "./stream-ui";

/**
 * Server-side AI state of one request. The route loads it from the database
 * and saves it once the reply is finished.
 */
export function createMutableState(initial: AIState): MutableAIState<AIState> {
  let current = initial;
  const update = (next: ValueOrUpdater<AIState>) => {
    current = typeof next === "function" ? next(current) : next;
  };

  return {
    get: () => current,
    update,
    done: (next) => {
      if (next) update(next);
    },
  };
}

type OrchestrateOptions = {
  writer: MavenWriter;
  state: MutableAIState<AIState>;
  payload: PayloadData;
  requestOption?: ExtendedRequestOption;
  /** The request's signal: aborted when the client stops the reply. */
  abortSignal?: AbortSignal;
  /** The models of this request (the user's own provider or the defaults) */
  models: Models;
};

/**
 * Answers one user message: either streams the orchestrator's text reply or
 * lets one of the render tools draw the reply. Everything shown is written to
 * a single `data-view` part that is replaced as the reply progresses.
 */
export async function orchestrate({
  writer,
  state,
  payload,
  requestOption,
  abortSignal,
  models,
}: OrchestrateOptions) {
  logger.info("Debug: payload orchestrator - agentic", {
    payload,
    requestOption,
  });

  const payloadUserMessage = toUnifiedUserMessage(payload);

  state.update({
    ...state.get(),
    messages: [
      ...state.get().messages,
      {
        id: generateId(),
        role: "user",
        content: JSON.stringify(payloadUserMessage),
      },
    ],
  });

  // Tool, object and markdown records reference the chat, so it must exist
  // before any tool runs.
  await ensureChat(state.get().chatId, state.get().username);

  const viewId = generateId();
  const show = (view: View) =>
    writer.write({ type: "data-view", id: viewId, data: toNodes(view) });

  const generation = createGeneration(writer);
  generation.update({ process: "stream:initial", loading: true });

  show(ui("LoadingText", { text: "Maven is thinking..." }));

  const props: ToolsetProps = {
    generation,
    state,
    requestOption,
    createStreamable: (initial) => createStreamable(writer, initial),
    abortSignal,
    models,
  };

  const toolset = {
    recommendator: toolRecommendator(props),
    searchProduct: toolSearchProduct({
      ...props,
      userMessage: payloadUserMessage,
    }),
    getProductDetails: toolGetProductDetails({
      ...props,
      userMessage: payloadUserMessage,
    }),
    productsComparison: toolProductComparison({
      ...props,
      userMessage: payloadUserMessage,
    }),
    inquireUser: toolInquireUser(props),
    webResearch: toolWebResearch(props),
  };

  let failure: unknown;
  let toolCalled = false;
  let toolRendered = false;
  let toolError: unknown;
  let content = "";
  const streamableText = createStreamable<string>(writer, "");

  const result = streamText({
    model: models.orchestrator,
    abortSignal,
    messages: toModelMessages(compactToolResults(state.get().messages)),
    instructions: orchestratorInstruction(),
    tools: renderTools(toolset, { writer, show, generation }),
    onEnd: ({ usage }) => {
      logger.info("Orchestrator Usage: first layer", { usage });
    },
    onError: ({ error }) => {
      failure = error;
    },
  });

  // Tools execute inside this stream, so it ends after their views are done.
  for await (const part of result.fullStream) {
    if (part.type === "tool-call") toolCalled = true;
    if (part.type === "tool-result" && part.output === "rendered")
      toolRendered = true;
    // Invalid input (failed schema validation) or an unknown tool name: the
    // tool never ran, so nothing replaced the "thinking" view.
    if (part.type === "tool-error") {
      toolCalled = true;
      toolError = part.error;
    }
    if (part.type !== "text-delta") continue;

    if (!content) show(ui("StreamAssistantMessage", { content: streamableText.value }));

    content += part.text;
    streamableText.update(content);
    generation.update({ process: "stream:generating", loading: true });
  }

  streamableText.done(content);

  // A stopped reply keeps only the user message.
  if (abortSignal?.aborted) return;

  if (toolCalled) {
    // The tool drew the reply and saved its own messages.
    if (toolRendered) return;

    logger.error("Orchestrator tool call failed", { error: toolError });
    failGeneration(generation, toolError ?? "Tool call failed");
    show(
      ui("ErrorMessage", {
        errorName: "Maven couldn't run that step",
        reason:
          "The assistant asked for a tool with input it couldn't use. Please try again, or rephrase the request more specifically.",
        raw: { error: String(toolError) },
      })
    );
    return;
  }

  if (!content) {
    // The model call failed (quota, network, auth) after retries.
    logger.error("Orchestrator model call failed", { error: failure });
    failGeneration(generation, failure ?? "Empty orchestrator reply");
    show(
      models.custom
        ? // The user's own provider: its error (bad key, unknown model) is theirs to fix.
          ui("ErrorMessage", {
            errorName: "Your AI provider returned an error",
            reason: `${failure instanceof Error ? failure.message : "The provider didn't respond."} Check the provider, API key and model in AI provider settings.`,
          })
        : ui("ErrorMessage", {
            errorName: "Maven is unavailable right now",
            reason:
              "The AI service didn't respond (it may be busy or rate-limited). Please try again in a moment.",
          })
    );
    return;
  }

  const textNode = ui("AssistantMessage", { content });
  let relatedObject: RelatedQuery | null = null;

  if (requestOption?.onRequest?.related) {
    const streamableRelated = createStreamable<PartialRelated>(writer);

    show([
      textNode,
      ui("StreamRelatedMessage", { content: streamableRelated.value }),
    ]);

    relatedObject = await streamRelatedQuery(
      streamableRelated,
      createErrorState(),
      state.get().messages,
      "Orchestrator - Related",
            models.light
    );
  }

  state.done({
    ...state.get(),
    messages: [
      ...state.get().messages,
      { id: generateId(), role: "assistant", content },
    ],
  });

  generation.done({ process: "stream:done", loading: false });

  show([
    textNode,
    requestOption?.onRequest?.related &&
      ui("RelatedMessage", { related: relatedObject }),
  ]);
}
