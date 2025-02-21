import { mapUIState } from "@/components/custom/ui-mapper";
import {
  AssistantMessage,
  StreamAssistantMessage,
} from "@/components/maven/assistant-message";
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
import {
  RelatedMessage,
  StreamRelatedMessage,
} from "@/components/maven/related-message";
import { LoadingText } from "@/components/maven/shining-glass";
import { UserInquiry } from "@/components/maven/user-inquiry";
import { InquirySkeleton } from "@/components/maven/user-inquiry-skeleton";
import {
  toCoreMessage,
  toPayloadRelatedMessage,
  toUnifiedUserMessage,
} from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { Inquiry } from "@/lib/agents/schema/inquiry";
import { productsSchema } from "@/lib/agents/schema/product";
import {
  PartialRelated,
  RelatedQuery,
  relatedQuerySchema,
} from "@/lib/agents/schema/related";
import {
  getProductDetailsSchema,
  inputInquirySchema,
  inquireUserSchema,
  productsComparionSchema,
  searchProductSchema,
} from "@/lib/agents/schema/tool-parameters";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { externalTavilySearch } from "@/lib/agents/tools/api/tavily";
import { handleScrapingWithCache } from "@/lib/service/cache-store";
import {
  createMarkdownEntry,
  createObjectEntry,
  createToolDataEntry,
  getObjectEntry,
} from "@/lib/service/store";
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
import {
  Product,
  ProductDetailsResponse,
  ProductsComparisonResponse,
  ProductsResponse,
} from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { processURLQuery } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import {
  DeepPartial,
  generateId,
  generateObject,
  streamObject,
  streamText,
} from "ai";
import {
  createAI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { v4 } from "uuid";

const orchestrator = async (
  payload: PayloadData,
  requestOption?: ExtendedRequestOption
): Promise<OrchestratorCallback> => {
  "use server";

  logger.info("Debug: payload orchestrator", { payload });

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

  let errorState: { isError: boolean; error: unknown } = {
    isError: false,
    error: null,
  };

  const { value } = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    system: SYSTEM_INSTRUCTION.CORE_ORCHESTRATOR,
    messages: toCoreMessage(state.get().messages),
    initial: <LoadingText text="Maven is thinking..." />,
    onFinish: ({ usage }) => {
      logger.info("Orchestrator Usage: first layer", { usage });
      /** Keep close this stream even textUI is not depleted to prevent hanging */
      streamableText.done();
    },
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
          const toolRequestId = v4();

          logger.info("Using searchProduct tool", {
            progress: "initial",
            request: { query },
          });

          generation.update({
            process: "generating",
            loading: true,
          });

          yield <LoadingText text={`Searching for ${query}`} />;

          const {
            cached,
            response: { data: scrapeContent },
          } = await handleScrapingWithCache(
            { query, key: toolRequestId },
            async (payload) => {
              return await scrapeUrl({
                url: processURLQuery(payload),
                formats: ["markdown", "screenshot"],
                waitFor: 4000,
              });
            }
          );

          if (cached) {
            yield (
              <LoadingText
                text={`The query is cached!. Proceed to do data extraction`}
              />
            );

            await new Promise((resolve) => setTimeout(resolve, 3000));
          }

          if (
            scrapeContent.success &&
            scrapeContent.markdown &&
            scrapeContent.screenshot
          ) {
            generation.update({
              process: "api_success",
              loading: true,
            });

            yield <LoadingText text="Found products, saving the state..." />;

            const finalizedProductSearch: ProductsResponse = {
              callId: toolRequestId,
              screenshot: scrapeContent.screenshot,
              data: [],
            };

            await createMarkdownEntry({
              key: finalizedProductSearch.callId,
              chatId: state.get().chatId,
              owner: state.get().username,
              type: "product-search",
              markdown: scrapeContent.markdown,
            });

            yield <LoadingText text="Proceed to data extraction..." />;

            const payload = JSON.stringify({
              objective: TEMPLATE.ExtractionOjective,
              markdown: scrapeContent.markdown,
            });

            const streamableProducts =
              createStreamableValue<DeepPartial<Product[]>>();

            yield (
              <StreamProductSearch
                query={query}
                callId={finalizedProductSearch.callId}
                screenshot={scrapeContent.screenshot}
                products={streamableProducts.value}
              />
            );

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_SEARCH_EXTRACTOR,
              prompt: payload,
              schema: productsSchema,
              onFinish: async ({ object }) => {
                if (object) {
                  finalizedProductSearch.data = object.data;
                }

                streamableProducts.done();

                await createObjectEntry({
                  key: finalizedProductSearch.callId,
                  chatId: state.get().chatId,
                  owner: state.get().username,
                  type: "searchProduct",
                  object: finalizedProductSearch,
                });
              },
              onError: ({ error }) => {
                streamableProducts.error(error);
                errorState = {
                  isError: true,
                  error,
                };
              },
            });

            for await (const chunk of partialObjectStream) {
              if (chunk.data) {
                streamableProducts.update(chunk.data);
              }
            }

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
              model: google("gemini-2.0-pro-exp-02-05"),
              system: SYSTEM_INSTRUCTION.PRODUCT_SEARCH_INSIGHT,
              prompt: JSON.stringify(finalizedProductSearch.data),
              onFinish: ({ text }) => {
                finalizedText = text;
                streamableText.done();

                generation.done({
                  process: "done",
                  loading: false,
                });
              },
              onError: ({ error }) => {
                streamableText.error(error);
                errorState = {
                  isError: true,
                  error,
                };
              },
            });

            for await (const texts of textStream) {
              finalizedText += texts;
              streamableText.update(finalizedText);
            }

            const searchProductUiNode = (
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
                <AssistantMessage content={finalizedText} />
              </>
            );

            const { toolResult, mutate } = mutateTool(state, {
              name: "searchProduct",
              args: { query },
              result: finalizedProductSearch,
              overrideAssistant: {
                content: finalizedText,
              },
            });

            await createToolDataEntry({
              key: finalizedProductSearch.callId,
              chatId: state.get().chatId,
              owner: state.get().username,
              tool: toolResult,
            });

            logger.info("Done using searchProduct tool", {
              progress: "finish",
              request: { query },
            });

            let relatedObject: RelatedQuery | null = null;

            const streamableRelated = createStreamableValue<PartialRelated>();

            if (requestOption?.onRequest?.related) {
              yield (
                <>
                  {searchProductUiNode}
                  <StreamRelatedMessage content={streamableRelated.value} />
                </>
              );
            }

            const payloadRelated = JSON.stringify(
              toPayloadRelatedMessage([...state.get().messages, ...mutate])
            );

            const { partialObjectStream: relatedStream } = streamObject({
              model: google("gemini-2.0-pro-exp-02-05"),
              system: SYSTEM_INSTRUCTION.RELATED_QUERY_CRAFTER,
              prompt: payloadRelated,
              schema: relatedQuerySchema,
              onFinish: async ({ object }) => {
                if (object) {
                  relatedObject = object;
                }
                streamableRelated.done();
              },
              onError: ({ error }) => {
                streamableRelated.done();
                errorState = {
                  isError: true,
                  error,
                };
              },
            });

            for await (const relatedChunk of relatedStream) {
              streamableRelated.update(relatedChunk);
            }

            if (errorState.isError) {
              generation.done({
                process: "fatal_error",
                loading: false,
                error: "LLM Generation Error",
              });

              return (
                <ErrorMessage
                  errorName="LLM Error"
                  reason="There was an error on LLMs Agent generation, that's all we know :("
                  raw={{
                    payload: { query },
                    error: errorState,
                  }}
                />
              );
            }

            return (
              <>
                {searchProductUiNode}
                {requestOption?.onRequest?.related && (
                  <RelatedMessage related={relatedObject} />
                )}
              </>
            );
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
          const toolRequestId = v4();

          yield <LoadingText text={`Getting data product for ${query}`} />;

          logger.info("Using getProductDetails tool", {
            progress: "initial",
            request: { query, link },
          });

          generation.update({
            process: "generating",
            loading: true,
          });

          await new Promise((resolve) => setTimeout(resolve, 3000));

          const {
            cached,
            response: { data: scrapeContent },
          } = await handleScrapingWithCache(
            { query: link, key: toolRequestId },
            async (payload) => {
              return await scrapeUrl({
                url: payload,
                formats: ["markdown", "screenshot"],
                waitFor: 4000,
              });
            }
          );

          if (cached) {
            yield (
              <LoadingText
                text={`The query is cached!. Proceed to do data extraction`}
              />
            );

            await new Promise((resolve) => setTimeout(resolve, 3000));
          }

          yield <LoadingText text={`Performing caching the query...`} />;

          await new Promise((resolve) => setTimeout(resolve, 2000));

          if (
            scrapeContent.success &&
            scrapeContent.markdown &&
            scrapeContent.screenshot
          ) {
            const finalizedObject: ProductDetailsResponse = {
              callId: toolRequestId,
              screenshot: scrapeContent.screenshot,
              productDetails: {},
            };

            generation.update({
              process: "api_success",
              loading: true,
            });

            yield (
              <LoadingText text="Raw data retrieved, saving the state data..." />
            );

            await createMarkdownEntry({
              key: finalizedObject.callId,
              chatId: state.get().chatId,
              owner: state.get().username,
              type: "product-details",
              markdown: scrapeContent.markdown,
            });

            yield (
              <LoadingText text="Proceed to data extraction, please hang on..." />
            );

            if (requestOption?.onRequest?.search) {
              yield (
                <LoadingText text="Perform search to get additonal information..." />
              );
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }

            const externalData = await externalTavilySearch(
              requestOption?.onRequest?.search ?? false,
              {
                query,
              }
            );

            if (requestOption?.onRequest?.search && externalData.data?.answer) {
              yield (
                <LoadingText
                  text={`Retrieved addional information, thought for ${externalData.data.responseTime} seconds`}
                />
              );
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }

            const payloadContent = JSON.stringify({
              refference: { query, link },
              markdown: scrapeContent.markdown,
              externalData: externalData.data?.answer ?? null,
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

                await createObjectEntry({
                  key: finalizedObject.callId,
                  chatId: state.get().chatId,
                  owner: state.get().username,
                  type: "getProductDetails",
                  object: finalizedObject,
                });
              },
              onError: ({ error }) => {
                streamableObject.error(error);
                errorState = {
                  isError: true,
                  error,
                };
              },
            });

            for await (const objProduct of partialObjectStream) {
              streamableObject.update(objProduct as Record<string, any>);
            }

            const streamableText = createStreamableValue<string>("");

            yield (
              <>
                <ProductDetails
                  content={{
                    success: true,
                    name: "getProductDetails",
                    args: { query, link },
                    data: {
                      productDetails: finalizedObject.productDetails,
                      callId: finalizedObject.callId!,
                      screenshot: finalizedObject.screenshot!,
                    },
                  }}
                />
                <StreamAssistantMessage content={streamableText.value} />
              </>
            );

            const payloadInsight = {
              prompt:
                payloadUserMessage.text_input ?? "no-instructions-from-user",
              data: finalizedObject.productDetails,
              externalData: externalData.data,
            };

            let finalizedText: string = "";

            const { textStream } = streamText({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_DETAILS_INSIGHT,
              prompt: JSON.stringify(payloadInsight),
              onFinish: async ({ text }) => {
                finalizedText = text;

                streamableText.done();
                generation.done({
                  process: "done",
                  loading: false,
                });
              },
              onError: ({ error }) => {
                streamableText.error(error);
                errorState = {
                  isError: true,
                  error,
                };
              },
            });

            for await (const text of textStream) {
              finalizedText += text;
              streamableText.update(finalizedText);
            }

            const getProductDetailsUiNode = (
              <>
                <ProductDetails
                  content={{
                    success: true,
                    name: "getProductDetails",
                    args: { query, link },
                    data: {
                      productDetails: finalizedObject.productDetails,
                      callId: finalizedObject.callId!,
                      screenshot: finalizedObject.screenshot!,
                    },
                  }}
                />
                <AssistantMessage content={finalizedText} />
              </>
            );

            const { toolResult, mutate } = mutateTool(state, {
              name: "getProductDetails",
              args: { link, query },
              result: finalizedObject,
              overrideAssistant: {
                content: finalizedText,
              },
            });

            await createToolDataEntry({
              key: finalizedObject.callId,
              chatId: state.get().chatId,
              owner: state.get().username,
              tool: toolResult,
            });

            logger.info("Done using getProductDetails tool", {
              progress: "finish",
              request: { query, link },
            });

            let relatedObject: RelatedQuery | null = null;

            const streamableRelated = createStreamableValue<PartialRelated>();

            if (requestOption?.onRequest?.related) {
              yield (
                <>
                  {getProductDetailsUiNode}
                  <StreamRelatedMessage content={streamableRelated.value} />
                </>
              );
            }

            const payloadRelated = JSON.stringify(
              toPayloadRelatedMessage([...state.get().messages, ...mutate])
            );

            const { partialObjectStream: relatedStream } = streamObject({
              model: google("gemini-2.0-pro-exp-02-05"),
              system: SYSTEM_INSTRUCTION.RELATED_QUERY_CRAFTER,
              prompt: payloadRelated,
              schema: relatedQuerySchema,
              onFinish: async ({ object }) => {
                if (object) {
                  relatedObject = object;
                }
                streamableRelated.done();
              },
              onError: ({ error }) => {
                streamableRelated.done();
                errorState = {
                  isError: true,
                  error,
                };
              },
            });

            for await (const relatedChunk of relatedStream) {
              streamableRelated.update(relatedChunk);
            }

            if (errorState.isError) {
              generation.done({
                process: "fatal_error",
                loading: false,
                error: "LLM Generation Error",
              });

              return (
                <ErrorMessage
                  errorName="LLM Error"
                  reason="There was an error on LLMs Agent generation, that's all we know :("
                  raw={{
                    payload: { query, link },
                    error: errorState,
                  }}
                />
              );
            }

            return (
              <>
                {getProductDetailsUiNode}
                {requestOption?.onRequest?.related && (
                  <RelatedMessage related={relatedObject} />
                )}
              </>
            );
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
                getObjectEntry<ProductDetailsResponse>(v.callId)
              )
            );

            const previousProductsData = resulted.filter((v) => v !== null);

            if (previousProductsData.length === 0) {
              const getKeys = compare.map((v) => v.callId).join(", ");

              generation.done({
                process: "database_error",
                loading: false,
                error: `Error cannot access data with keys: [${getKeys}]`,
              });

              return (
                <ErrorMessage
                  errorName="Database Error"
                  reason="There was an error while getting the content from the database."
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
                (v) => v.object.screenshot
              ),
              comparison: {},
            };

            yield <LoadingText text="Generating comparison..." />;

            await new Promise((resolve) => setTimeout(resolve, 3000));

            const streamableObject =
              createStreamableValue<Record<string, any>>();

            const payloadPrevProductsData = previousProductsData.map(
              (v) => v.object.productDetails
            );

            // append stream-ui here

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_COMPARE_EXTRACTOR,
              prompt: JSON.stringify(payloadPrevProductsData),
              output: "no-schema",
              onFinish: async ({ object }) => {
                finalizedCompare.comparison = object as Record<string, any>;
                streamableObject.done();

                await createObjectEntry({
                  key: finalizedCompare.callId,
                  chatId: state.get().chatId,
                  owner: state.get().username,
                  type: "productsComparison",
                  object: finalizedCompare,
                });
              },
              onError: ({ error }) => {
                streamableObject.error(error);
                errorState = {
                  isError: true,
                  error,
                };
              },
            });

            for await (const chunk of partialObjectStream) {
              streamableObject.update(chunk as Record<string, any>);
            }

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

            const payloadComparisonInsight = {
              prompt:
                payloadUserMessage.text_input ?? "no-instructions-from-user",
              data: finalizedCompare.comparison,
            };

            let finalizedText = "";

            const { textStream } = streamText({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_COMPARE_INSIGHT,
              prompt: JSON.stringify(payloadComparisonInsight),
              onFinish: async ({ text }) => {
                finalizedText = text;
                streamableText.done();
                generation.done({
                  process: "done",
                  loading: false,
                });
              },
              onError: ({ error }) => {
                streamableText.error(error);
                errorState = {
                  isError: true,
                  error,
                };
              },
            });

            for await (const text of textStream) {
              finalizedText += text;
              streamableText.update(finalizedText);
            }

            const productsComparisonUiNode = (
              <>
                <ProductComparison
                  content={{
                    success: true,
                    name: "productsComparison",
                    args: { compare },
                    data: finalizedCompare,
                  }}
                />
                <AssistantMessage content={finalizedText} />
              </>
            );

            const { toolResult, mutate } = mutateTool(state, {
              name: "productsComparison",
              args: { compare },
              result: finalizedCompare,
              overrideAssistant: {
                content: finalizedText,
              },
            });

            await createToolDataEntry({
              key: finalizedCompare.callId,
              chatId: state.get().chatId,
              owner: state.get().username,
              tool: toolResult,
            });

            logger.info("Done using productsComparison tool", {
              progress: "finish",
              request: { compare },
            });

            let relatedObject: RelatedQuery | null = null;

            const streamableRelated = createStreamableValue<PartialRelated>();

            if (requestOption?.onRequest?.related) {
              yield (
                <>
                  {productsComparisonUiNode}
                  <StreamRelatedMessage content={streamableRelated.value} />
                </>
              );
            }

            const payloadRelated = JSON.stringify(
              toPayloadRelatedMessage([...state.get().messages, ...mutate])
            );

            const { partialObjectStream: relatedStream } = streamObject({
              model: google("gemini-2.0-pro-exp-02-05"),
              system: SYSTEM_INSTRUCTION.RELATED_QUERY_CRAFTER,
              prompt: payloadRelated,
              schema: relatedQuerySchema,
              onFinish: async ({ object }) => {
                if (object) {
                  relatedObject = object;
                }
                streamableRelated.done();
              },
              onError: ({ error }) => {
                streamableRelated.done();
                errorState = {
                  isError: true,
                  error,
                };
              },
            });

            for await (const relatedChunk of relatedStream) {
              streamableRelated.update(relatedChunk);
            }

            if (errorState.isError) {
              generation.done({
                process: "fatal_error",
                loading: false,
                error: "LLM Generation Error",
              });

              return (
                <ErrorMessage
                  errorName="LLM Error"
                  reason="There was an error on LLMs Agent generation, that's all we know :("
                  raw={{
                    payload: { compare },
                    error: errorState,
                  }}
                />
              );
            }

            return (
              <>
                {productsComparisonUiNode}
                {requestOption?.onRequest?.related && (
                  <RelatedMessage related={relatedObject} />
                )}
              </>
            );
          } catch (error) {
            generation.done({
              process: "fatal_error",
              loading: false,
            });

            return (
              <ErrorMessage
                errorName="Unknown Error"
                reason="There was an error while comparing data products, this error occur from internal server"
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
      /** GAP */
      inquireUser: {
        description: TEMPLATE.INQUIRE_USER_DESCIRPTION,
        parameters: inputInquirySchema,
        generate: async function* (inquiryProp) {
          logger.info("Using inquireUser tool");

          console.log(JSON.stringify({ inquiry: inquiryProp }, null, 2));

          generation.update({
            process: "generating",
            loading: true,
          });

          const parse = inputInquirySchema.safeParse(inquiryProp);

          if (!parse.success || parse.error) {
            generation.done({
              process: "fatal_error",
              loading: false,
            });
            return (
              <ErrorMessage
                errorName="Invalid Payload on Inquire Property"
                reason="An error occured when try to parse inquiry payload from LLM"
                raw={{ parse }}
              />
            );
          }

          const callId = generateId();

          yield <LoadingText key={callId} text="Creating an Inquiry" />;

          yield <InquirySkeleton />;

          const inquiryObject = await generateObject({
            model: google("gemini-2.0-flash-001"),
            system: SYSTEM_INSTRUCTION.INQUIRY_CRAFTER,
            prompt: JSON.stringify(parse.data),
            schema: inquireUserSchema,
          });

          mutateTool(state, {
            name: "inquireUser",
            args: { inquiry: inquiryObject.object.inquiry },
            result: { data: "no-result" },
            overrideAssistant: {
              content: `Inquiry have been provided, please fill them in accordingly.`,
            },
          });

          logger.info("Done using inquireUser tool");

          generation.done({
            process: "done",
            loading: false,
          });

          return <UserInquiry inquiry={inquiryObject.object.inquiry} />;
        },
      },
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
