import { mapUIState } from "@/components/custom/ui-mapper";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ShinyText } from "@/components/maven/shining-glass";
import { UserInquiry } from "@/components/maven/user-inquiry";
import { toCoreMessage } from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { toolGetProductDetails } from "@/lib/agents/action/server-action/get-product-details";
import { toolProductsComparison } from "@/lib/agents/action/server-action/products-comparison";
import { toolSearchProduct } from "@/lib/agents/action/server-action/search-product";
import { inquireUserSchema } from "@/lib/agents/schema/tool-parameters";
import { SYSTEM_INSTRUCT_CORE } from "@/lib/agents/system-instructions";
import {
  PayloadData,
  AssignController,
  SendMessageCallback,
  UserContentMessage,
  MutableAIState,
  AIState,
  StreamGeneration,
  TestingMessageCallback,
  UIState,
  UseAction,
} from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { generateId } from "ai";
import {
  getMutableAIState,
  createStreamableValue,
  createStreamableUI,
  streamUI,
  createAI,
  getAIState,
} from "ai/rsc";
import { getServerSession } from "next-auth";

async function sendMessage(
  payload: PayloadData,
  assignController?: AssignController
): Promise<SendMessageCallback> {
  "use server";

  const { textInput, attachProduct, inquiryResponse } = payload;

  logger.info("Process on Server Action", { payload });

  const payloadUserMessage: UserContentMessage = {
    text_input: textInput ?? null,
    attach_product: attachProduct ?? null,
    inquiry_response: inquiryResponse ?? null,
  };

  const aiState: MutableAIState<AIState> = getMutableAIState<typeof AI>();

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
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

  const ui = createStreamableUI(<ShinyText text="Maven is thinking..." />);

  const streamableText = createStreamableValue<string>("");

  const textUi = <StreamAssistantMessage content={streamableText.value} />;

  const { value, stream } = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    system: SYSTEM_INSTRUCT_CORE,
    messages: toCoreMessage(aiState.get().messages),
    initial: <ShinyText text="Maven is thinking..." />,
    text: async function* ({ content, done }) {
      if (done) {
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: generateId(),
              role: "assistant",
              content,
            },
          ],
        });

        ui.done();
        streamableText.done();
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

      return textUi;
    },
    tools: {
      searchProduct: toolSearchProduct({ state: aiState, generation, ui }),
      getProductDetails: toolGetProductDetails({
        state: aiState,
        generation,
        ui,
      }),
      productsComparison: toolProductsComparison({
        state: aiState,
        generation,
        ui,
      }),
      inquireUser: {
        description: `Inquire the user is provided prompt or information are not enough`,
        parameters: inquireUserSchema,
        generate: async function* (inquiry) {
          logger.info("Using inquireUser tool");

          generation.update({
            process: "generating",
            loading: true,
          });

          const callId = generateId();
          ui.update(<ShinyText key={callId} text="Creating an Inquiry" />);

          yield ui.value;

          await new Promise((resolve) => setTimeout(resolve, 3000));

          ui.update(<UserInquiry inquiry={inquiry} />);

          const { mutate } = mutateTool({
            name: "inquireUser",
            args: { inquiry },
            result: { data: "no-result" },
            overrideAssistant: {
              content: `Inquiry have been provided, please fill them in accordingly.`,
            },
          });

          aiState.done({
            ...aiState.get(),
            messages: [...aiState.get().messages, ...mutate],
          });

          ui.done();

          logger.info("Done using inquireUser tool");

          generation.done({
            process: "done",
            loading: false,
          });

          return ui.value;
        },
      },
    },
  });

  return {
    id: generateId(),
    display: value,
    stream,
    generation: generation.value,
  };
}

/**
 * AI Provider for: **StreamUI**
 *
 * @method StreamUI
 */
export const AI = createAI<AIState, UIState, UseAction>({
  initialUIState: [],
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  actions: {
    sendMessage,
  },
  onSetAIState: async ({ state, done }) => {
    "use server";

    if (done) {
      const session = await getServerSession();
      await saveAIState(state, session);
    }
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

/*

# Agent Tools
- search product { query }
- get product details { query, link }
- products comparison { compare: { title, callId }[] }

# Root Agent `orchestrator()`, contain tools:
- inquire user
- search product

# Sub Level-1 Agent `extractor()`, contain tools:
- get product details

# Sub Leval-2 Agent `comparator()`, contain tools:
- products comparison

*/
