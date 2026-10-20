import { mapUIState } from "@/components/custom/ui-mapper";
import { AssistantMessage } from "@/components/maven/assistant-message";
import {
  RelatedMessage,
  StreamRelatedMessage,
} from "@/components/maven/related-message";
import { LoadingText } from "@/components/maven/shining-glass";
import {
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
import { google } from "@ai-sdk/google";
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
import { createErrorState, streamRelatedQuery } from "./server/workflow";
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

  const { value } = await streamUI({
    model: google('gemini-2.5-flash'),
    messages: toModelMessages(state.get().messages),
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
    tools: {
      recommendator: toolRecommendator({
        generation,
        state,
        requestOption,
      }),
      searchProduct: toolSearchProduct({
        generation,
        state,
        requestOption,
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
    },
  });

  return {
    source: "orchestrator",
    id: generateId(),
    display: value,
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
