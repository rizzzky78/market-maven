import { mapUIState } from "@/components/custom/ui-mapper";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import {
  ProductDetails,
  StreamProductDetails,
} from "@/components/maven/product-details";
import { ShinyText } from "@/components/maven/shining-glass";
import { toCoreMessage } from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { toolGetProductDetails } from "@/lib/agents/action/server-action/get-product-details";
import { toolInquireUser } from "@/lib/agents/action/server-action/inquire-user";
import { toolProductsComparison } from "@/lib/agents/action/server-action/products-comparison";
import { toolSearchProduct } from "@/lib/agents/action/server-action/search-product";
import { root } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { getProductDetailsSchema } from "@/lib/agents/schema/tool-parameters";
import { SYSTEM_INSTRUCT_CORE } from "@/lib/agents/system-instructions";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { storeKeyValue } from "@/lib/service/store";
import {
  PayloadData,
  AssignController,
  SendMessageCallback,
  UserContentMessage,
  MutableAIState,
  AIState,
  StreamGeneration,
  UIState,
  UseAction,
} from "@/lib/types/ai";
import { ProductDetailsResponse } from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { generateId, streamObject, streamText } from "ai";
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

async function sendMessage(
  payload: PayloadData,
  assignController?: AssignController
): Promise<SendMessageCallback> {
  "use server";

  const { textInput, attachProduct, productCompare, inquiryResponse } = payload;

  logger.info("Process on Server Action", { payload });

  const payloadUserMessage: UserContentMessage = {
    text_input: textInput ?? null,
    attach_product: attachProduct ?? null,
    product_compare: productCompare ?? null,
    inquiry_response: inquiryResponse ?? null,
  };

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

  // const generation = createStreamableValue<StreamGeneration>({
  //   process: "initial",
  //   loading: true,
  // });

  // const ui = createStreamableUI(<ShinyText text="Maven is thinking..." />);

  const streamableText = createStreamableValue<string>("");

  const textUi = <StreamAssistantMessage content={streamableText.value} />;

  const { value, stream } = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    system: SYSTEM_INSTRUCT_CORE,
    messages: toCoreMessage(state.get().messages),
    initial: <ShinyText text="Maven is thinking..." />,
    // text: async function* ({ content, done }) {
    //   if (done) {
    //     state.done({
    //       ...state.get(),
    //       messages: [
    //         ...state.get().messages,
    //         {
    //           id: generateId(),
    //           role: "assistant",
    //           content,
    //         },
    //       ],
    //     });

    //     // ui.done();
    //     streamableText.done();
    //     // generation.done({
    //     //   process: "done",
    //     //   loading: false,
    //     // });
    //   } else {
    //     streamableText.update(content);
    //     // generation.update({
    //     //   process: "generating",
    //     //   loading: true,
    //     // });
    //   }

    //   return textUi;
    // },
    tools: {
      getProductDetails: {
        description: root.GetProductDetailsDescription,
        parameters: getProductDetailsSchema,
        generate: async function* ({ query, link }) {
          yield <ShinyText text={`Getting data product for ${query}`} />;

          await new Promise((resolve) => setTimeout(resolve, 3000));

          const scrapeResult = await scrapeUrl({
            url: link,
            formats: ["markdown", "screenshot"],
            waitFor: 4000,
          });

          /** Handle if Scrape Operation is Error */
          if (!scrapeResult.success) {
            return (
              <ErrorMessage
                errorName="Scrape Operation Failed"
                reason="There was an error while scrapping the content from the firecrawl service."
                raw={{
                  payload: { query, link },
                  error: scrapeResult.error,
                  message: scrapeResult.message,
                }}
              />
            );
          }

          /** Handle if Scrape Operation is Success */
          if (scrapeResult.success && scrapeResult.markdown) {
            yield <ShinyText text="Found product details, please hang on..." />;

            await new Promise((resolve) => setTimeout(resolve, 3000));

            let finalizedObject: ProductDetailsResponse = {
              productDetails: {},
            };

            const payloadContent = JSON.stringify({
              prompt: root.ExtractionDetails,
              refference: { query, link },
              markdown: scrapeResult.markdown,
            });

            const streamableObject =
              createStreamableValue<Record<string, any>>();

            yield (
              <StreamProductDetails
                query={query}
                link={link}
                callId={finalizedObject.callId}
                content={streamableObject.value}
                screenshot={scrapeResult.screenshot}
              />
            );

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_DETAILS_EXTRACTOR,
              prompt: payloadContent,
              output: "no-schema",
              onFinish: async ({ object }) => {
                finalizedObject = {
                  callId: v4(),
                  screenshot: scrapeResult.screenshot,
                  productDetails: object as Record<string, any>,
                };
              },
            });

            for await (const objProduct of partialObjectStream) {
              finalizedObject = {
                productDetails: objProduct as Record<string, any>,
              };
              streamableObject.update(finalizedObject.productDetails);
            }

            streamableObject.done();

            // const stored = await storeKeyValue<ProductDetailsResponse>({
            //   key: finalizedObject.callId as string,
            //   metadata: {
            //     chatId: state.get().chatId,
            //     email: "",
            //   },
            //   value: finalizedObject,
            // });

            const streamableText = createStreamableValue<string>("");

            yield (
              <>
                <ProductDetails
                  content={{
                    success: true,
                    name: "getProductDetails",
                    args: { query, link },
                    data: {
                      insight: finalizedObject.productDetails,
                      screenshot: finalizedObject.screenshot as string,
                      callId: finalizedObject.callId as string,
                    },
                  }}
                />
                <StreamAssistantMessage content={streamableText.value} />
              </>
            );

            let finalizedText: string = "";

            const { textStream } = streamText({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_COMPARE_INSIGHT,
              prompt: JSON.stringify(finalizedObject.productDetails),
              onFinish: async ({ text }) => {
                finalizedText = text;
              },
            });

            for await (const text of textStream) {
              finalizedText += text;
              streamableText.update(finalizedText);
            }

            streamableText.done();

            const { mutate } = mutateTool({
              name: "getProductDetails",
              args: { link, query },
              result: finalizedObject,
              overrideAssistant: {
                content: finalizedText,
              },
            });

            state.done({
              ...state.get(),
              messages: [...state.get().messages, ...mutate],
            });
          }
        },
      },
    },
  });

  return {
    id: generateId(),
    display: value,
    // stream,
    // generation: generation.value,
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
    username: "anonymous@gmail.com",
    messages: [],
  },
  actions: {
    sendMessage,
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

code:

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
      inquireUser: toolInquireUser({
        state: aiState,
        generation,
        ui,
      }),

*/
