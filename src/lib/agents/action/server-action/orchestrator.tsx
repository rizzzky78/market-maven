import { AI } from "@/app/action";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import {
  StreamProductDetails,
  ProductDetails,
} from "@/components/maven/product-details";
import {
  StreamProductSearch,
  ProductSearch,
} from "@/components/maven/product-search";
import { LoadingText } from "@/components/maven/shining-glass";
import { UserInquiry } from "@/components/maven/user-inquiry";
import { storeKeyValue, retrieveKeyValue } from "@/lib/service/store";
import {
  PayloadData,
  AssignController,
  OrchestratorCallback,
  UserContentMessage,
  MutableAIState,
  AIState,
  StreamGeneration,
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
import { getMutableAIState, createStreamableValue, streamUI } from "ai/rsc";
import { v4 } from "uuid";
import { z } from "zod";
import SYSTEM_INSTRUCTION from "../../constant/md";
import { productsSchema } from "../../schema/product";
import {
  searchProductSchema,
  getProductDetailsSchema,
  inquireUserSchema,
} from "../../schema/tool-parameters";
import {
  SYSTEM_INSTRUCT_CORE,
  SYSTEM_INSTRUCT_PRODUCTS,
  SYSTEM_INSTRUCT_INSIGHT,
} from "../../system-instructions";
import { scrapeUrl } from "../../tools/api/firecrawl";
import { toCoreMessage } from "../mutator/mutate-messages";
import { mutateTool } from "../mutator/mutate-tool";
import { TEMPLATE } from "../../constant";

export async function orchestrator(
  payload: PayloadData,
  assignController?: AssignController
): Promise<OrchestratorCallback> {
  "use server";

  const { textInput, attachProduct, inquiryResponse } = payload;

  logger.info("Process on Server Action", { payload });

  const payloadUserMessage: UserContentMessage = {
    text_input: textInput ?? null,
    attach_product: attachProduct ?? null,
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

          let finalizedResults: ProductsResponse = { data: [] };

          const scrapeContent = await scrapeUrl({
            url: processURLQuery(query),
            formats: ["markdown", "screenshot"],
            waitFor: 4000,
          });

          /** Handle if Scrape Operation is Error */
          if (!scrapeContent.success) {
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

          /** Handle if Scrape Operation is Success */
          if (scrapeContent.success && scrapeContent.markdown) {
            yield (
              <LoadingText text="Found products, proceed to data extraction..." />
            );

            await new Promise((resolve) => setTimeout(resolve, 3000));

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

            let isObjectGenerationDone = false;

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCT_PRODUCTS,
              prompt: payload,
              schema: productsSchema,
              onFinish: async ({ object }) => {
                isObjectGenerationDone = true;

                if (object) {
                  finalizedResults = {
                    callId: v4(),
                    screenshot: scrapeContent.screenshot,
                    data: object.data,
                  };
                }
              },
            });

            for await (const chunk of partialObjectStream) {
              if (chunk.data) {
                streamableProducts.update(chunk.data);
              }
            }

            streamableProducts.done();

            if (isObjectGenerationDone) {
              const stored = await storeKeyValue<ProductsResponse>({
                key: finalizedResults.callId as string,
                metadata: {
                  chatId: state.get().chatId,
                  email: "",
                },
                value: finalizedResults,
              });

              const streamableText = createStreamableValue<string>("");

              yield (
                <>
                  <ProductSearch
                    content={{
                      success: true,
                      name: "searchProduct",
                      args: { query },
                      data: stored.value,
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
                prompt: JSON.stringify(finalizedResults),
                onFinish: ({ text }) => {
                  finalizedText = text;
                },
              });

              for await (const texts of textStream) {
                finalizedText += texts;
                streamableText.update(finalizedText);
              }

              streamableText.done();

              const { mutate } = mutateTool({
                name: "searchProduct",
                args: { query },
                result: finalizedResults,
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
            }
          }

          generation.done({
            process: "done",
            loading: false,
          });
        },
      },
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
            yield (
              <LoadingText text="Found product details, please hang on..." />
            );

            await new Promise((resolve) => setTimeout(resolve, 3000));

            let finalizedObject: ProductDetailsResponse = {
              productDetails: {},
            };

            const payloadContent = JSON.stringify({
              prompt: TEMPLATE.ExtractionDetails,
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

            let isStreamDone = false;

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_DETAILS_EXTRACTOR,
              prompt: payloadContent,
              output: "no-schema",
              onFinish: async ({ object }) => {
                isStreamDone = true;
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

            if (isStreamDone) {
              const stored = await storeKeyValue<ProductDetailsResponse>({
                key: finalizedObject.callId as string,
                metadata: {
                  chatId: state.get().chatId,
                  email: "",
                },
                value: finalizedObject,
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
                prompt: JSON.stringify(stored.value.productDetails),
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
                result: stored.value,
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
            }
          }

          generation.done({
            process: "done",
            loading: false,
          });
        },
      },
      productsComparison: {
        description: `Compare two products based on user requested data`,
        parameters: z.object({
          compare: z.array(
            z.object({
              title: z.string(),
              callId: z.string(),
            })
          ),
        }),
        generate: async function* ({ compare }) {
          logger.info("Using productsComparison tool");

          generation.update({
            process: "generating",
            loading: true,
          });

          yield <LoadingText text="Getting given products data..." />;

          const resulted = await Promise.all(
            compare.map((v) =>
              retrieveKeyValue<{
                productDetails: Record<string, any>;
                screenshot?: string;
                callId?: string;
              }>({ key: v.callId })
            )
          );

          if (!resulted) {
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

          yield <LoadingText text="Found previous products details data" />;

          await new Promise((resolve) => setTimeout(resolve, 3000));

          let finalizedCompare: ProductsComparisonResponse = { comparison: {} };

          const prevProductDetailsData = resulted
            .filter((v) => v !== null)
            .map((v) => v?.value);

          let isStreamDone = false;

          yield <LoadingText text="Generating comparison..." />;

          await new Promise((resolve) => setTimeout(resolve, 3000));

          const streamableObject = createStreamableValue<Record<string, any>>();

          // append stream-ui here

          const { partialObjectStream } = streamObject({
            model: google("gemini-2.0-flash-exp"),
            system: SYSTEM_INSTRUCTION.PRODUCT_COMPARE_EXTRACTOR,
            prompt: JSON.stringify(prevProductDetailsData),
            output: "no-schema",
            onFinish: async ({ object }) => {
              const images = prevProductDetailsData.map(
                (v) => v.screenshot
              ) as string[];

              isStreamDone = true;

              finalizedCompare = {
                callId: v4(),
                productImages: images,
                comparison: object as Record<string, any>,
              };
            },
          });

          for await (const chunk of partialObjectStream) {
            finalizedCompare = {
              comparison: chunk as Record<string, any>,
            };
            streamableObject.update(finalizedCompare);
          }

          streamableObject.done();

          if (isStreamDone) {
            const stored = await storeKeyValue<ProductsComparisonResponse>({
              key: finalizedCompare.callId as string,
              metadata: {
                chatId: state.get().chatId,
                email: "",
              },
              value: finalizedCompare,
            });

            const streamableText = createStreamableValue<string>("");

            yield <StreamAssistantMessage content={streamableText.value} />;

            let finalizedText = "";

            const { textStream } = streamText({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_COMPARE_INSIGHT,
              prompt: JSON.stringify(stored.value.comparison),
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
              name: "productsComparison",
              args: { compare },
              result: stored.value,
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
          }
        },
      },
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

          yield <LoadingText key={callId} text="Creating an Inquiry" />;

          await new Promise((resolve) => setTimeout(resolve, 3000));

          const { mutate } = mutateTool({
            name: "inquireUser",
            args: { inquiry },
            result: { data: "no-result" },
            overrideAssistant: {
              content: `Inquiry have been provided, please fill them in accordingly.`,
            },
          });

          state.done({
            ...state.get(),
            messages: [...state.get().messages, ...mutate],
          });

          logger.info("Done using inquireUser tool");

          generation.done({
            process: "done",
            loading: false,
          });

          yield <LoadingText key={callId} text="Finalizing Inquiry" />;

          await new Promise((resolve) => setTimeout(resolve, 3000));

          return <UserInquiry inquiry={inquiry} />;
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
}
