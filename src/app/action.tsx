import { mapUIState } from "@/components/custom/ui-mapper";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import { ProductComparison } from "@/components/maven/product-comparison";
import {
  ProductDetails,
  StreamProductDetails,
} from "@/components/maven/product-details";
import {
  ProductSearch,
  StreamProductSearch,
} from "@/components/maven/product-search";
import { LoadingText } from "@/components/maven/shining-glass";
import {
  toCoreMessage,
  toUnifiedUserMessage,
} from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { productsSchema } from "@/lib/agents/schema/product";
import {
  getProductDetailsSchema,
  productsComparionSchema,
  searchProductSchema,
} from "@/lib/agents/schema/tool-parameters";
import {
  SYSTEM_INSTRUCT_INSIGHT,
  SYSTEM_INSTRUCT_PRODUCTS,
} from "@/lib/agents/system-instructions";
import { SYSTEM_INSTRUCT_CORE } from "@/lib/agents/system-instructions/core";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { retrieveKeyValue, storeKeyValue } from "@/lib/service/store";
import {
  AIState,
  MutableAIState,
  PayloadData,
  StreamGeneration,
  TestingMessageCallback,
  UIState,
  UseAction,
} from "@/lib/types/ai";
import {
  Product,
  ProductDetailsResponse,
  ProductsComparisonResponse,
  ProductsResponse,
} from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { processURLQuery } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { DeepPartial, generateId, streamObject, streamText } from "ai";
import {
  createAI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { v4 } from "uuid";

const testing = async (
  payload: PayloadData
): Promise<TestingMessageCallback> => {
  "use server";

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

  const streamableText = createStreamableValue<string>("");

  const textUi = <StreamAssistantMessage content={streamableText.value} />;

  const { value } = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    system: SYSTEM_INSTRUCT_CORE,
    messages: toCoreMessage(state.get().messages),
    initial: <LoadingText text="Maven is thinking..." />,
    text: async function* ({ content, done }) {
      if (done) {
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
      searchProduct: {
        description: TEMPLATE.SearchProductDescription,
        parameters: searchProductSchema,
        generate: async function* ({ query }) {
          logger.info("Using searchProduct tool", {
            progress: "initial",
            request: { query },
          });

          generation.update({
            process: "generating",
            loading: true,
          });

          yield <LoadingText text={`Searching for ${query}`} />;

          const scrapeContent = await scrapeUrl({
            url: processURLQuery(query),
            formats: ["markdown", "screenshot"],
            waitFor: 4000,
          });

          if (
            scrapeContent.success &&
            scrapeContent.markdown &&
            scrapeContent.screenshot
          ) {
            generation.update({
              process: "api_success",
              loading: true,
            });

            const finalizedProductSearch: ProductsResponse = {
              callId: v4(),
              screenshot: scrapeContent.screenshot,
              data: [],
            };

            yield (
              <LoadingText text="Found products, proceed to data extraction..." />
            );

            await new Promise((resolve) => setTimeout(resolve, 3000));

            yield (
              <LoadingText text="Extracting products data from raw data..." />
            );

            const payload = JSON.stringify({
              objective: TEMPLATE.ExtractionOjective,
              markdown: scrapeContent.markdown,
            });

            const streamableProducts =
              createStreamableValue<DeepPartial<Product[]>>();

            yield (
              <StreamProductSearch
                query={query}
                screenshot={scrapeContent.screenshot}
                products={streamableProducts.value}
              />
            );

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCT_PRODUCTS,
              prompt: payload,
              schema: productsSchema,
              onFinish: async ({ object }) => {
                if (object) {
                  finalizedProductSearch.data = object.data;
                }

                streamableProducts.done();
              },
            });

            for await (const chunk of partialObjectStream) {
              if (chunk.data) {
                streamableProducts.update(chunk.data);
              }
            }

            await storeKeyValue<ProductsResponse>({
              key: finalizedProductSearch.callId,
              value: finalizedProductSearch,
              metadata: {
                chatId: state.get().chatId,
                email: state.get().username,
              },
            });

            const streamableText = createStreamableValue<string>("");

            yield (
              <>
                <ProductSearch
                  content={{
                    success: true,
                    name: "searchProduct",
                    args: { query },
                    data: finalizedProductSearch,
                  }}
                  isFinished={true}
                />
                <StreamAssistantMessage content={streamableText.value} />
              </>
            );

            let finalizedText: string = "";

            const { textStream } = streamText({
              model: groq("llama-3.3-70b-versatile"),
              system: SYSTEM_INSTRUCT_INSIGHT,
              prompt: JSON.stringify(finalizedProductSearch),
              onFinish: ({ text }) => {
                finalizedText = text;
                streamableText.done();

                generation.done({
                  process: "done",
                  loading: false,
                });
              },
            });

            for await (const texts of textStream) {
              finalizedText += texts;
              streamableText.update(finalizedText);
            }

            const { mutate } = mutateTool({
              name: "searchProduct",
              args: { query },
              result: finalizedProductSearch,
              overrideAssistant: {
                content: finalizedText,
              },
            });

            state.done({
              ...state.get(),
              messages: [...state.get().messages, ...mutate],
            });

            logger.info("Done using searchProduct tool", {
              progress: "finish",
              request: { query },
            });
          } else if (!scrapeContent.success) {
            generation.done({
              process: "api_error",
              loading: false,
              error: scrapeContent.message,
            });

            return (
              <ErrorMessage
                errorName="Scrape Operation Failed"
                reason="There was an error while scrapping the content from the firecrawl service."
                raw={{
                  payload: { query },
                  error: scrapeContent.error,
                  message: scrapeContent.message,
                }}
              />
            );
          }
        },
      },
      /** GAP */
      getProductDetails: {
        description: TEMPLATE.GetProductDetailsDescription,
        parameters: getProductDetailsSchema,
        generate: async function* ({ query, link }) {
          logger.info("Using getProductDetails tool", {
            progress: "initial",
            request: { query, link },
          });

          generation.update({
            process: "generating",
            loading: true,
          });

          yield <LoadingText text={`Getting data product for ${query}`} />;

          await new Promise((resolve) => setTimeout(resolve, 3000));

          const scrapeContent = await scrapeUrl({
            url: link,
            formats: ["markdown", "screenshot"],
            waitFor: 4000,
          });

          if (
            scrapeContent.success &&
            scrapeContent.markdown &&
            scrapeContent.screenshot
          ) {
            generation.update({
              process: "api_success",
              loading: true,
            });

            yield (
              <LoadingText text="Found product details, please hang on..." />
            );

            await new Promise((resolve) => setTimeout(resolve, 3000));

            const finalizedObject: ProductDetailsResponse = {
              callId: v4(),
              screenshot: scrapeContent.screenshot,
              productDetails: {},
            };

            const payloadContent = JSON.stringify({
              prompt: TEMPLATE.ExtractionDetails,
              refference: { query, link },
              markdown: scrapeContent.markdown,
            });

            const streamableObject =
              createStreamableValue<Record<string, any>>();

            yield (
              <StreamProductDetails
                query={query}
                link={link}
                callId={finalizedObject.callId}
                content={streamableObject.value}
                screenshot={scrapeContent.screenshot}
              />
            );

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_DETAILS_EXTRACTOR,
              prompt: payloadContent,
              output: "no-schema",
              onFinish: async ({ object }) => {
                if (object) {
                  finalizedObject.productDetails = object as Record<
                    string,
                    any
                  >;
                }

                streamableObject.done();
              },
            });

            for await (const objProduct of partialObjectStream) {
              streamableObject.update(objProduct as Record<string, any>);
            }

            await storeKeyValue<ProductDetailsResponse>({
              key: finalizedObject.callId,
              value: finalizedObject,
              metadata: {
                chatId: state.get().chatId,
                email: state.get().username,
              },
            });

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
                      callId: finalizedObject.callId!,
                      screenshot: finalizedObject.screenshot!,
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

                streamableText.done();
                generation.done({
                  process: "done",
                  loading: false,
                });
              },
            });

            for await (const text of textStream) {
              finalizedText += text;
              streamableText.update(finalizedText);
            }

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

            logger.info("Done using getProductDetails tool", {
              progress: "finish",
              request: { query, link },
            });
          } else if (!scrapeContent.success) {
            generation.done({
              process: "api_error",
              loading: false,
            });

            return (
              <ErrorMessage
                errorName="Scrape Operation Failed"
                reason="There was an error while scrapping the content from the firecrawl service."
                raw={{
                  payload: { query, link },
                  error: scrapeContent.error,
                  message: scrapeContent.message,
                }}
              />
            );
          }
        },
      },
      /** GAP */
      productsComparison: {
        description: TEMPLATE.PRODUCTS_COMPARISON_DESCRIPTION,
        parameters: productsComparionSchema,
        generate: async function* ({ compare }) {
          try {
            logger.info("Using productsComparison tool");

            generation.update({
              process: "generating",
              loading: true,
            });

            yield <LoadingText text="Getting given products data..." />;

            const resulted = await Promise.all(
              compare.map((v) =>
                retrieveKeyValue<ProductDetailsResponse>({ key: v.callId })
              )
            );

            const previousProductsData = resulted.filter((v) => v !== null);

            if (previousProductsData.length === 0) {
              generation.done({
                process: "database_error",
                loading: false,
              });

              return (
                <ErrorMessage
                  errorName="Scrape Operation Failed"
                  reason="There was an error while scrapping the content from the firecrawl service."
                  raw={{
                    payload: { compare },
                    resulted: null,
                  }}
                />
              );
            }

            yield <LoadingText text="Found previous products data" />;

            await new Promise((resolve) => setTimeout(resolve, 3000));

            const finalizedCompare: ProductsComparisonResponse = {
              callId: v4(),
              productImages: previousProductsData.map(
                (v) => v.value.screenshot
              ),
              comparison: {},
            };

            yield <LoadingText text="Generating comparison..." />;

            await new Promise((resolve) => setTimeout(resolve, 3000));

            const streamableObject =
              createStreamableValue<Record<string, any>>();

            // append stream-ui here

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_COMPARE_EXTRACTOR,
              prompt: JSON.stringify(previousProductsData),
              output: "no-schema",
              onFinish: async ({ object }) => {
                finalizedCompare.comparison = object as Record<string, any>;
                streamableObject.done();
              },
            });

            for await (const chunk of partialObjectStream) {
              streamableObject.update(chunk as Record<string, any>);
            }

            await storeKeyValue<ProductsComparisonResponse>({
              key: finalizedCompare.callId,
              value: finalizedCompare,
              metadata: {
                chatId: state.get().chatId,
                email: state.get().username,
              },
            });

            const streamableText = createStreamableValue<string>("");

            yield (
              <>
                <ProductComparison
                  content={{
                    success: true,
                    name: "productsComparison",
                    args: { compare },
                    data: finalizedCompare,
                  }}
                />
                <StreamAssistantMessage content={streamableText.value} />
              </>
            );

            let finalizedText = "";

            const { textStream } = streamText({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_COMPARE_INSIGHT,
              prompt: JSON.stringify(finalizedCompare.comparison),
              onFinish: async ({ text }) => {
                finalizedText = text;
                streamableText.done();
              },
            });

            for await (const text of textStream) {
              finalizedText += text;
              streamableText.update(finalizedText);
            }

            const { mutate } = mutateTool({
              name: "productsComparison",
              args: { compare },
              result: finalizedCompare,
              overrideAssistant: {
                content: finalizedText,
              },
            });

            state.done({
              ...state.get(),
              messages: [...state.get().messages, ...mutate],
            });

            logger.info("Done using productsComparison tool", {
              progress: "finish",
              request: { compare },
            });
          } catch (error) {
            generation.update({
              process: "fatal_error",
              loading: false,
            });

            return (
              <ErrorMessage
                errorName="Unknown Error"
                reason="There was an error while scrapping the content from the firecrawl service."
                raw={{
                  payload: { compare },
                  error:
                    error instanceof Error ? error.message : "Unkown Error",
                }}
              />
            );
          }
        },
      },
    },
  });

  return {
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
    // orchestrator,
    testing,
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
