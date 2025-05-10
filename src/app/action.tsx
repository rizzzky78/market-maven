import { mapUIState } from "@/components/custom/ui-mapper";
import {
  AssistantMessage,
  StreamAssistantMessage,
} from "@/components/maven/assistant-message";
import {
  RelatedMessage,
  StreamRelatedMessage,
} from "@/components/maven/related-message";
import { LoadingText } from "@/components/maven/shining-glass";
import {
  toCoreMessage,
  toPayloadRelatedMessage,
  toUnifiedUserMessage,
} from "@/lib/agents/action/mutator/mutate-messages";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import {
  PartialRelated,
  RelatedQuery,
  relatedQuerySchema,
} from "@/lib/agents/schema/related";
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
import { generateId, streamObject } from "ai";
import {
  createAI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { toolRecommendator } from "./server/tool-recommendator";
import { toolGetProductDetails } from "./server/tool-get-product-details";
import { toolSearchProduct } from "./server/tool-search-product";
import { toolProductComparison } from "./server/tool-products-comparison";
import { toolInquireUser } from "./server/tool-inquire-user";

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

  const generation = createStreamableValue<StreamGeneration>({
    process: "initial",
    loading: true,
  });

  // eslint-disable-next-line prefer-const
  let errorState: { isError: boolean; error: unknown } = {
    isError: false,
    error: null,
  };

  const { value } = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    messages: toCoreMessage(state.get().messages),
    system: await SYSTEM_INSTRUCTION.CORE_ORCHESTRATOR,
    initial: <LoadingText text="Maven is thinking..." />,
    onFinish: ({ usage }) => {
      logger.info("Orchestrator Usage: first layer", { usage });
    },
    text: async function* ({ content, done }) {
      const streamableText = createStreamableValue<string>("");

      yield <StreamAssistantMessage content={streamableText.value} />;

      let relatedObject: RelatedQuery | null = null;
      let isFinished: boolean = false;

      if (done) {
        isFinished = true;
        streamableText.done(content);

        const textUiNode = <AssistantMessage content={content} />;

        if (requestOption?.onRequest?.related) {
          const streamableRelated = createStreamableValue<PartialRelated>();

          yield (
            <>
              {textUiNode}
              <StreamRelatedMessage content={streamableRelated.value} />
            </>
          );

          const payloadRelated = JSON.stringify(
            toPayloadRelatedMessage(state.get().messages)
          );

          const { partialObjectStream: relatedStream } = streamObject({
            model: google("gemini-2.0-flash-lite"),
            system: await SYSTEM_INSTRUCTION.RELATED_QUERY_CRAFTER,
            prompt: payloadRelated,
            schema: relatedQuerySchema,
            onFinish: async ({ object }) => {
              if (object) {
                relatedObject = object;
              }
              streamableRelated.done();
            },
            onError: ({ error }) => {
              streamableRelated.error(error);
            },
          });

          for await (const relatedChunk of relatedStream) {
            streamableRelated.update(relatedChunk);
          }
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
          process: "done",
          loading: false,
        });
      } else {
        streamableText.update(content);
        generation.update({
          process: "generating",
          loading: true,
        });
      }

      return (
        <>
          <AssistantMessage content={content} />
          {isFinished && requestOption?.onRequest?.related && (
            <RelatedMessage related={relatedObject} />
          )}
        </>
      );
    },
    tools: {
      recommendator: toolRecommendator({
        generation,
        errorState,
        state,
        requestOption,
      }),
      searchProduct: toolSearchProduct({
        generation,
        errorState,
        state,
        requestOption,
      }),
      getProductDetails: toolGetProductDetails({
        generation,
        errorState,
        state,
        requestOption,
        userMessage: payloadUserMessage,
      }),
      productsComparison: toolProductComparison({
        generation,
        errorState,
        state,
        requestOption,
        userMessage: payloadUserMessage,
      }),
      inquireUser: toolInquireUser({ generation, errorState, state }),
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
