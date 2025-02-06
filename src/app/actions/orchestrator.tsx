"use server";

import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ShinyText } from "@/components/maven/shining-glass";
import { toUnifiedUserMessage } from "@/lib/agents/action/mutator/mutate-messages";
import {
  SYSTEM_INSTRUCT_CORE,
  SYSTEM_INSTRUCT_INSIGHT,
  SYSTEM_INSTRUCT_PRODUCTS,
} from "@/lib/agents/system-instructions";
import {
  PayloadData,
  AssignController,
  OrchestratorCallback,
  StreamGeneration,
} from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { DeepPartial, generateId, streamObject, streamText } from "ai";
import { createStreamableValue, streamUI } from "ai/rsc";
import {
  getProductDetailsSchema,
  searchProductSchema,
} from "@/lib/agents/schema/tool-parameters";
import { root } from "@/lib/agents/constant";
import { ErrorMessage } from "@/components/maven/error-message";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { productsSchema } from "@/lib/agents/schema/product";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { storeKeyValue } from "@/lib/service/store";
import {
  ProductsResponse,
  Product,
  ProductDetailsResponse,
} from "@/lib/types/product";
import { processURLQuery } from "@/lib/utils";
import { groq } from "@ai-sdk/groq";
import { v4 } from "uuid";
import {
  getServerState,
  updateServerState,
} from "@/lib/agents/action/mutator/ai-state-service";
import {
  StreamProductDetails,
  ProductDetails,
} from "@/components/maven/product-details";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import {
  ProductSearch,
  StreamProductSearch,
} from "@/components/maven/product-search";

export async function orchestrator(
  payload: PayloadData,
  assignController?: AssignController
): Promise<OrchestratorCallback> {
  logger.info("Process on Server Action", { payload });

  const payloadUserMessage = toUnifiedUserMessage(payload);

  const state = await getServerState();

  await updateServerState((prevAIState) => ({
    ...prevAIState,
    messages: [
      ...prevAIState.messages,
      {
        id: generateId(),
        role: "user",
        content: JSON.stringify(payloadUserMessage),
      },
    ],
  }));

  const generation = createStreamableValue<StreamGeneration>({
    process: "initial",
    loading: true,
  });

  const streamableText = createStreamableValue<string>("");

  const textUi = <StreamAssistantMessage content={streamableText.value} />;

  const { value } = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    system: SYSTEM_INSTRUCT_CORE,
    // messages: toCoreMessage(state.get().messages),
    prompt: JSON.stringify(payloadUserMessage),
    initial: <ShinyText text="Maven is thinking..." />,
    text: async function* ({ content, done }) {
      if (done) {
        await updateServerState((prevAIState) => ({
          ...prevAIState,
          messages: [
            ...prevAIState.messages,
            {
              id: generateId(),
              role: "assistant",
              content,
            },
          ],
        }));

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
        description: root.SearchProductDescription,
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

          yield <ShinyText text={`Searching for ${query}`} />;

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
              <ShinyText text="Found products, proceed to data extraction..." />
            );

            await new Promise((resolve) => setTimeout(resolve, 3000));

            const payload = JSON.stringify({
              objective: root.ExtractionOjective,
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
                  chatId: "temporary",
                  email: "temporary",
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

              await updateServerState((prevAIState) => ({
                ...prevAIState,
                messages: [...prevAIState.messages, ...mutate],
              }));

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
        description: root.GetProductDetailsDescription,
        parameters: getProductDetailsSchema,
        generate: async function* ({ query, link }) {
          generation.update({
            process: "generating",
            loading: true,
          });

          yield <ShinyText text={`Getting data product for ${query}`} />;

          const scrapeResult = await scrapeUrl({
            url: link,
            formats: ["markdown", "screenshot"],
            waitFor: 4000,
          });

          /** Handle if Scrape Operation is Error */
          if (!scrapeResult.success) {
            generation.update({
              process: "api_error",
              loading: false,
              error: scrapeResult.error,
            });

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
            yield <ShinyText text="Found product details..." />;

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

            yield <ShinyText text="Generating UI, please hang on..." />;

            yield (
              <StreamProductDetails
                content={streamableObject.value}
                screenshot={scrapeResult.screenshot}
                query={query}
                link={link}
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

            const stored = await storeKeyValue<ProductDetailsResponse>({
              key: finalizedObject.callId as string,
              metadata: {
                chatId: state?.chatId || v4(),
                email: state?.username || "anonymous@gmail.com",
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
                      insight: stored.value.productDetails,
                      screenshot: stored.value.screenshot as string,
                      callId: stored.value.callId as string,
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

            await updateServerState((prevAIState) => ({
              ...prevAIState,
              messages: [...prevAIState.messages, ...mutate],
            }));
          }

          generation.done({
            process: "done",
            loading: false,
          });
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
