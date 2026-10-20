import { models } from "@/lib/agents/models";
import { mapUIState } from "@/components/custom/ui-mapper";
import { AssistantMessage } from "@/components/maven/assistant-message";
import {
  RelatedMessage,
  StreamRelatedMessage,
} from "@/components/maven/related-message";
import { LoadingText } from "@/components/maven/shining-glass";
import {
  compactToolResults,
  toModelMessages,
  toUnifiedUserMessage,
} from "@/lib/agents/action/mutator/mutate-messages";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { ensureChat } from "@/lib/agents/action/chat-service";
import { PartialRelated, RelatedQuery } from "@/lib/agents/schema/related";
import {
  AIState,
  ExtendedRequestOption,
  MutableAIState,
  OrchestratorCallback,
  PayloadData,
  StreamGeneration,
  UIState,
  UseAction,
} from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { generateId } from "ai";
import {
  createAI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
  streamUI,
} from "@ai-sdk/rsc";
import { toolRecommendator } from "./server/tool-recommendator";
import { toolGetProductDetails } from "./server/tool-get-product-details";
import { toolSearchProduct } from "./server/tool-search-product";
import { toolProductComparison } from "./server/tool-products-comparison";
import { toolInquireUser } from "./server/tool-inquire-user";
import { toolWebResearch } from "./server/tool-web-research";
import {
  createErrorState,
  failGeneration,
  streamRelatedQuery,
  withToolErrorBoundary,
} from "./server/workflow";
import { ErrorMessage } from "@/components/maven/error-message";
import { orchestratorInstruction } from "@/lib/agents/constant/md/orchestrator";

const orchestrator = async (
  payload: PayloadData,
  requestOption?: ExtendedRequestOption
): Promise<OrchestratorCallback> => {
  "use server";

  logger.info("Debug: payload orchestrator - agentic", {
    payload,
    requestOption,
  });

  const payloadUserMessage = toUnifiedUserMessage(payload);

  const state: MutableAIState<AIState> = getMutableAIState<typeof AI>();

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

  const generation = createStreamableValue<StreamGeneration>({
    process: "stream:initial",
    loading: true,
  });

  const toolset = {
    recommendator: toolRecommendator({
      generation,
      state,
      requestOption,
    }),
    searchProduct: toolSearchProduct({
      generation,
      state,
      requestOption,
      userMessage: payloadUserMessage,
    }),
    getProductDetails: toolGetProductDetails({
      generation,
      state,
      requestOption,
      userMessage: payloadUserMessage,
    }),
    productsComparison: toolProductComparison({
      generation,
      state,
      requestOption,
      userMessage: payloadUserMessage,
    }),
    inquireUser: toolInquireUser({ generation, state }),
    webResearch: toolWebResearch({ generation, state, requestOption }),
  };

  const tools = Object.fromEntries(
    Object.entries(toolset).map(([name, tool]) => [
      name,
      withToolErrorBoundary(name, tool, generation),
    ])
  ) as typeof toolset;

  let response: Awaited<ReturnType<typeof streamUI>>;

  try {
    response = await streamUI({
      model: models.reasoning,
      messages: toModelMessages(compactToolResults(state.get().messages)),
      instructions: orchestratorInstruction(),
      initial: <LoadingText text="Maven is thinking..." />,
      onFinish: ({ usage }) => {
        logger.info("Orchestrator Usage: first layer", { usage });
      },
      text: async function* ({ content, done }) {
        const textUiNode = <AssistantMessage content={content} />;

        if (!done) {
          generation.update({
            process: "stream:generating",
            loading: true,
          });

          return textUiNode;
        }

        let relatedObject: RelatedQuery | null = null;

        if (requestOption?.onRequest?.related) {
          const streamableRelated = createStreamableValue<PartialRelated>();

          yield (
            <>
              {textUiNode}
              <StreamRelatedMessage content={streamableRelated.value} />
            </>
          );

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
            {
              id: generateId(),
              role: "assistant",
              content,
            },
          ],
        });

        generation.done({
          process: "stream:done",
          loading: false,
        });

        return (
          <>
            {textUiNode}
            {requestOption?.onRequest?.related && (
              <RelatedMessage related={relatedObject} />
            )}
          </>
        );
      },
      tools,
    });
  } catch (error) {
    // The first model call failed (quota, network, auth) after retries.
    logger.error("Orchestrator model call failed", { error });
    failGeneration(generation, error);
    state.done(state.get());

    return {
      source: "orchestrator",
      id: generateId(),
      display: (
        <ErrorMessage
          errorName="Maven is unavailable right now"
          reason="The AI service didn't respond (it may be busy or rate-limited). Please try again in a moment."
        />
      ),
      generation: generation.value,
    };
  }

  // streamUI renders from its own copy of the model stream; this copy is ours.
  // A mid-stream error errors the UI inside streamUI, so release the status
  // here too. Reading it also keeps the tee from buffering the whole stream.
  void (async () => {
    try {
      for await (const part of response.stream) {
        if (part.type === "error") failGeneration(generation, part.error);
      }
    } catch (error) {
      failGeneration(generation, error);
    }
  })();

  return {
    source: "orchestrator",
    id: generateId(),
    display: response.value,
    generation: generation.value,
  };
};

/**
 * AI Provider for: **StreamUI**
 *
 * @method StreamUI
 */
export const AI = createAI<AIState, UIState, UseAction>({
  initialUIState: [],
  actions: {
    orchestrator,
  },
  onSetAIState: async ({ state, done }) => {
    "use server";

    if (done) await saveAIState(state);
  },
  onGetUIState: async () => {
    "use server";

    const aiState = getAIState<typeof AI>();

    if (aiState) {
      const uiState = mapUIState(aiState);
      return uiState;
    } else {
      return;
    }
  },
});
