import { mapUIState } from "@/components/custom/ui-mapper";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import { StreamProductsContainer } from "@/components/maven/exp-stream-products-container";
import { StreamProductDetails } from "@/components/maven/product-details";
import { ProductsContainer } from "@/components/maven/products-container";
import { ShinyText } from "@/components/maven/shining-glass";
import { UserInquiry } from "@/components/maven/user-inquiry";
import { toCoreMessage } from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { toolGetProductDetails } from "@/lib/agents/action/server-action/get-product-details";
import { toolProductsComparison } from "@/lib/agents/action/server-action/products-comparison";
import { toolSearchProduct } from "@/lib/agents/action/server-action/search-product";
import { root } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { productsSchema } from "@/lib/agents/schema/product";
import {
  searchProductSchema,
  getProductDetailsSchema,
  inquireUserSchema,
} from "@/lib/agents/schema/tool-parameters";
import {
  SYSTEM_INSTRUCT_CORE,
  SYSTEM_INSTRUCT_PRODUCTS,
  SYSTEM_INSTRUCT_INSIGHT,
} from "@/lib/agents/system-instructions";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { storeKeyValue, retrieveKeyValue } from "@/lib/service/store";
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
import {
  ProductsResponse,
  Product,
  ProductDetailsResponse,
  ProductsComparisonResponse,
} from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { processURLQuery } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { generateId, DeepPartial, streamObject, streamText } from "ai";
import {
  getMutableAIState,
  createStreamableValue,
  createStreamableUI,
  streamUI,
  createAI,
  getAIState,
} from "ai/rsc";
import { getServerSession } from "next-auth";
import { v4 } from "uuid";
import { z } from "zod";


async function sendMessage(
  payload: PayloadData,
  assignController?: AssignController
): Promise<SendMessageCallback> {
  'use server'

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
      // searchProduct: toolSearchProduct({ state: aiState, generation, ui }),
      getProductDetails: toolGetProductDetails({
        state: aiState,
        generation,
        ui,
      }),
      // productsComparison: toolProductsComparison({
      //   state: aiState,
      //   generation,
      //   ui,
      // }),
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



export async function testing(
  message: string
): Promise<TestingMessageCallback> {
  "use server";

  return {
    id: "",
    display: (
      <div>
        <p>This is a testing!</p>
      </div>
    ),
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
    testing,
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