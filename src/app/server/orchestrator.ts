import { models } from "@/lib/agents/models";
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
  let content = "";
  const streamableText = createStreamable<string>(writer, "");

  const result = streamText({
    model: models.orchestrator,
    messages: toModelMessages(compactToolResults(state.get().messages)),
    instructions: orchestratorInstruction(),
    tools: renderTools(toolset, show, generation),
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
    if (part.type !== "text-delta") continue;

    if (!content) show(ui("StreamAssistantMessage", { content: streamableText.value }));

    content += part.text;
    streamableText.update(content);
    generation.update({ process: "stream:generating", loading: true });
  }

  streamableText.done(content);

  // The tool drew the reply and saved its own messages.
  if (toolCalled) return;

  if (!content) {
    // The model call failed (quota, network, auth) after retries.
    logger.error("Orchestrator model call failed", { error: failure });
    failGeneration(generation, failure ?? "Empty orchestrator reply");
    show(
      ui("ErrorMessage", {
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
      "Orchestrator - Related"
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
