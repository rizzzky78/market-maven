/**
 *
 * CODED BY HUMAN BEING :)
 *
 *
 */

import {
  StreamAssistantMessage,
  AssistantMessage,
} from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import { StreamExtendedMessage } from "@/components/maven/extended-message";
import { ProductDetails } from "@/components/maven/product-details";
import { ProductDetailsInsight } from "@/components/maven/product-details-insight";
import {
  StreamRelatedMessage,
  RelatedMessage,
} from "@/components/maven/related-message";
import { LoadingText } from "@/components/maven/shining-glass";
import { StreamProductDetails } from "@/components/maven/stream-product-details";
import { StreamProductDetailsInsight } from "@/components/maven/stream-product-details-insight";
import { toPayloadRelatedMessage } from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { PRODUCT_EXTRACTOR_INSIGHT_SYSTEM_PROMPT } from "@/lib/agents/constant/md/product-extractor-insight";
import { PRODUCT_RESEARCHER_INSIGHT_SYSTEM_PROMPT } from "@/lib/agents/constant/md/product-researcher-insight";
import {
  RelatedQuery,
  PartialRelated,
  relatedQuerySchema,
} from "@/lib/agents/schema/related";
import { getProductDetailsSchema } from "@/lib/agents/schema/tool-parameters";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { externalTavilySearch } from "@/lib/agents/tools/api/tavily";
import { handleScrapingWithCache } from "@/lib/service/cache-store";
import {
  createMarkdownEntry,
  createObjectEntry,
  createToolDataEntry,
  getObjectEntry,
} from "@/lib/service/store";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import {
  DetailsGlobal,
  ExtendedSearchResult,
  ProductDetails as TProductDetails,
  SearchProductResult,
  DetailsTokopedia,
} from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { streamText, streamObject, LanguageModelUsage, smoothStream } from "ai";
import { createStreamableValue } from "ai/rsc";
import { v4 } from "uuid";

const toolGetProductDetails = ({
  generation,
  errorState,
  state,
  requestOption,
  userMessage,
}: ToolsetProps) => {
  const getProductDetails: RenderTool<typeof getProductDetailsSchema> = {
    description: TEMPLATE.get_product_details_description,
    parameters: getProductDetailsSchema,
    generate: async function* ({ query, link, callId, source }) {
      /**
       * Previous call ID from product search object tool
       */
      const prevCallId = callId;

      const toolRequestId = v4();

      yield <LoadingText text={`Getting data product for ${query}`} />;

      logger.info("Using getProductDetails tool", {
        progress: "initial",
        request: { query, link },
      });

      generation.update({
        process: "tool:initial",
        loading: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      yield <LoadingText text={`Perform scrape operation...`} />;

      const finalizedToolData = {
        args: { query, callId, source, link },
        data: {
          source: requestOption?.onRequest?.reffSource,
          callId: toolRequestId,
          object: {
            externalData: requestOption?.onRequest?.search
              ? {
                  tavily: "",
                  markdown: "",
                }
              : undefined,
          } as TProductDetails["object"],
        },
      };

      /**
       * ==================
       * START - RESEARCHER
       * ==================
       */

      if (
        requestOption?.onRequest?.search &&
        finalizedToolData.data.object.externalData
      ) {
        yield (
          <LoadingText text="Perform search to get additonal information..." />
        );

        generation.update({
          process: "api:requesting-data",
          loading: true,
        });

        const externalData = await externalTavilySearch(
          requestOption?.onRequest?.search ?? false,
          {
            query,
          }
        );

        if (externalData.data?.answer) {
          yield (
            <LoadingText
              text={`Retrieved additional information, thought for ${externalData.data.responseTime} seconds`}
            />
          );

          generation.update({
            process: "stream:initial",
            loading: true,
          });

          await new Promise((resolve) => setTimeout(resolve, 3000));

          finalizedToolData.data.object.externalData.tavily =
            externalData.data.answer;

          generation.update({
            process: "stream:generating",
            loading: true,
          });

          const streamableResearch = createStreamableValue("");

          yield <StreamExtendedMessage content={streamableResearch.value} />;

          let researcherText = "";

          const { textStream: researcherStream } = streamText({
            model: google("gemini-2.0-flash-lite"),
            system: await SYSTEM_INSTRUCTION.PRODUCT_RESEARCHER,
            prompt: JSON.stringify({ query }),
            onFinish: ({ text, usage }) => {
              logger.info("Usage - Get Product Details - Step 1", { usage });

              finalizedToolData.data.object.externalData!.markdown = text;

              streamableResearch.done(text);

              generation.update({
                process: "stream:next-action",
                loading: true,
              });
            },
            onError: ({ error }) => {
              streamableResearch.error(error);
              errorState = {
                isError: true,
                error,
              };
            },
          });

          for await (const t of researcherStream) {
            researcherText += t;
            streamableResearch.update(researcherText);
          }
        }
      }

      /**
       * ==================
       * END - RESEARCHER
       * ==================
       */

      if (
        requestOption?.onRequest?.reffSource &&
        requestOption?.onRequest?.reffSource !== "tokopedia"
      ) {
        generation.update({
          process: "database:requesting-data",
          loading: true,
        });
        /**
         * Get previous search product data by call id
         */
        const prevObjectSearch = await getObjectEntry<
          SearchProductResult<ExtendedSearchResult>
        >(prevCallId);

        generation.update({
          process: "database:success",
          loading: true,
        });

        if (!prevObjectSearch) {
          generation.done({
            process: "database:not-found",
            loading: false,
            error: "LLM Generation Error",
          });

          errorState = {
            isError: true,
            error: {
              access_to_call_id: prevCallId,
              error_reason: "Previous Object Data Not Found!",
            },
          };

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

        const {
          object: { object: prevSearch },
        } = prevObjectSearch;

        const previousSearchData: DetailsGlobal = {
          previousData: {
            title: prevSearch.title,
            estimatedPrice: prevSearch.estimatedPrice,
            referenceCallId: prevCallId,
          },
          snapshots: {
            images: prevSearch.images,
            videos: prevSearch.videos,
          },
          markdown: "",
        };

        (
          finalizedToolData.data
            .object as TProductDetails<DetailsGlobal>["object"]
        ).previousData = previousSearchData.previousData;

        (
          finalizedToolData.data
            .object as TProductDetails<DetailsGlobal>["object"]
        ).snapshots = previousSearchData.snapshots;

        generation.update({
          process: "stream:generating",
          loading: true,
        });

        const streamableDetailsResearcher = createStreamableValue("");

        yield (
          <StreamExtendedMessage
            title={`Getting Data for ${previousSearchData.previousData.title}`}
            content={streamableDetailsResearcher.value}
          />
        );

        let detailsResearcherText = "";

        const mergedUsageObj = {
          researcher: {},
          objectDetails: {},
        } as unknown as Record<string, LanguageModelUsage>;

        const markdownLLM = streamText({
          model: google("gemini-2.0-flash", { useSearchGrounding: true }),
          system: PRODUCT_RESEARCHER_INSIGHT_SYSTEM_PROMPT,
          maxSteps: 5,
          prompt: JSON.stringify({
            payload: previousSearchData.previousData.title,
          }),
          onFinish: ({ text, usage }) => {
            mergedUsageObj.researcher = usage;

            previousSearchData.markdown = text;

            streamableDetailsResearcher.done(text);

            (
              finalizedToolData.data
                .object as TProductDetails<DetailsGlobal>["object"]
            ).markdown = previousSearchData.markdown;

            generation.update({
              process: "stream:partial-done",
              loading: true,
            });
          },
          onError: ({ error }) => {
            streamableDetailsResearcher.error(error);
            errorState = {
              isError: true,
              error,
            };
          },
        });

        for await (const detailsText of markdownLLM.textStream) {
          detailsResearcherText += detailsText;
          streamableDetailsResearcher.update(detailsResearcherText);
        }

        const payloadContent = JSON.stringify({
          payload: {
            dataset: previousSearchData,
            externalData: finalizedToolData.data.object.externalData,
          },
        });

        generation.update({
          process: "stream:generating",
          loading: true,
        });

        const streamableObject = createStreamableValue<Record<string, any>>();

        yield (
          <StreamProductDetailsInsight
            content={streamableObject.value}
            callId={finalizedToolData.data.callId}
            data={
              finalizedToolData.data
                .object as TProductDetails<DetailsGlobal>["object"]
            }
          />
        );

        let partialObjDetailInsight: Record<string, any> = {};

        const { partialObjectStream } = streamObject({
          model: google("gemini-2.0-flash-lite"),
          system: PRODUCT_EXTRACTOR_INSIGHT_SYSTEM_PROMPT,
          prompt: payloadContent,
          output: "no-schema",
          onFinish: async ({ object, usage }) => {
            mergedUsageObj.objectDetails = usage;
            finalizedToolData.data.object.productDetails = object as Record<
              string,
              any
            >;

            generation.update({
              process: "stream:next-action",
              loading: true,
            });

            logger.info("[DEBUG: insightDetailsObject]", object);

            streamableObject.done();

            await createObjectEntry({
              key: finalizedToolData.data.callId,
              chatId: state.get().chatId,
              owner: state.get().username,
              type: "getProductDetails",
              object: finalizedToolData.data,
            });

            generation.update({
              process: "database:save-state",
              loading: true,
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
          partialObjDetailInsight = objProduct as Record<string, any>;
          streamableObject.update(objProduct as Record<string, any>);
        }

        const streamableText = createStreamableValue<string>("");

        const mergedLLMUsage = Object.values(mergedUsageObj).reduce(
          (acc, usage) => ({
            promptTokens: acc.promptTokens + usage.promptTokens,
            completionTokens: acc.completionTokens + usage.completionTokens,
            totalTokens: acc.totalTokens + usage.totalTokens,
          }),
          { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
        );

        generation.update({
          process: "stream:generating",
          loading: true,
        });

        yield (
          <>
            <ProductDetailsInsight
              content={{
                success: true,
                name: "getProductDetails",
                args: finalizedToolData.args,
                data: {
                  ...finalizedToolData.data,
                  object: {
                    ...finalizedToolData.data.object,
                    productDetails: partialObjDetailInsight,
                  },
                } as TProductDetails<DetailsGlobal>,
              }}
              usage={mergedLLMUsage}
            />
            <StreamAssistantMessage content={streamableText.value} />
          </>
        );

        const payloadInsight = {
          prompt: userMessage?.text_input ?? undefined,
          dataset: finalizedToolData.data.object,
        };

        let finalizedInsightText = "";

        const { textStream } = streamText({
          model: google("gemini-2.0-flash-lite"),
          system: await SYSTEM_INSTRUCTION.PRODUCT_DETAILS_INSIGHT,
          prompt: JSON.stringify(payloadInsight),
          onFinish: async ({ text }) => {
            finalizedInsightText = text;

            streamableText.done();

            generation.update({
              process: "stream:done",
              loading: true,
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
          finalizedInsightText += text;
          streamableText.update(finalizedInsightText);
        }

        const getProductDetailsInsightUiNode = (
          <>
            <ProductDetailsInsight
              content={{
                success: true,
                name: "getProductDetails",
                args: finalizedToolData.args,
                data: {
                  ...finalizedToolData.data,
                  object: {
                    ...finalizedToolData.data.object,
                    productDetails: partialObjDetailInsight,
                  },
                } as TProductDetails<DetailsGlobal>,
              }}
              usage={mergedLLMUsage}
            />
            <AssistantMessage content={finalizedInsightText} />
          </>
        );

        const { toolResult, mutate } = mutateTool(state, {
          name: "getProductDetails",
          args: finalizedToolData.args,
          result: finalizedToolData.data,
          overrideAssistant: {
            content: finalizedInsightText,
          },
        });

        generation.update({
          process: "database:save-state",
          loading: true,
        });

        await createToolDataEntry({
          key: finalizedToolData.data.callId,
          chatId: state.get().chatId,
          owner: state.get().username,
          tool: toolResult,
        });

        let relatedObject: RelatedQuery | null = null;

        const streamableRelated = createStreamableValue<PartialRelated>();

        if (requestOption?.onRequest?.related) {
          generation.update({
            process: "stream:generating",
            loading: true,
          });

          yield (
            <>
              {getProductDetailsInsightUiNode}
              <StreamRelatedMessage content={streamableRelated.value} />
            </>
          );

          const payloadRelated = JSON.stringify(
            toPayloadRelatedMessage([...state.get().messages, ...mutate])
          );

          const { partialObjectStream: relatedStream } = streamObject({
            model: google("gemini-2.0-flash-lite"),
            system: await SYSTEM_INSTRUCTION.RELATED_QUERY_CRAFTER,
            prompt: payloadRelated,
            schema: relatedQuerySchema,
            onFinish: async ({ object, usage }) => {
              logger.info("Usage - Search Product - Step 4", { usage });

              if (object) {
                relatedObject = object;
              }
              streamableRelated.done();

              generation.update({
                process: "stream:done",
                loading: true,
              });
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
        }

        if (errorState.isError) {
          generation.done({
            process: "tool:fatal-error",
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
        } else {
          generation.done({
            process: "tool:done",
            loading: false,
          });
        }

        return (
          <>
            {getProductDetailsInsightUiNode}
            {requestOption?.onRequest?.related && (
              <RelatedMessage related={relatedObject} />
            )}
          </>
        );
      } else if (link) {
        generation.update({
          process: "api:requesting-data",
          loading: true,
        });
        /**
         *
         * START - SCRAPE
         *
         */
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
              text={`The query is cached!. Proceed to data extraction`}
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
            process: "api:success",
            loading: true,
          });

          yield <LoadingText text="Retrieved raw data..." />;

          await createMarkdownEntry({
            key: finalizedToolData.data.callId,
            chatId: state.get().chatId,
            owner: state.get().username,
            type: "product-details",
            markdown: scrapeContent.markdown,
          });

          generation.update({
            process: "database:save-state",
            loading: true,
          });

          yield <LoadingText text="Proceed to data extraction..." />;

          const payloadContent = JSON.stringify({
            refference: { query, link },
            markdown: scrapeContent.markdown,
            externalData: finalizedToolData.data.object.externalData,
          });

          const streamableObject = createStreamableValue<Record<string, any>>();

          generation.update({
            process: "stream:generating",
            loading: true,
          });

          yield (
            <StreamProductDetails
              query={query}
              link={link}
              callId={finalizedToolData.data.callId}
              content={streamableObject.value}
              screenshot={scrapeContent.screenshot}
              externalData={finalizedToolData.data.object.externalData}
            />
          );

          const { partialObjectStream } = streamObject({
            model: google("gemini-2.0-flash-lite"),
            system: await SYSTEM_INSTRUCTION.PRODUCT_DETAILS_EXTRACTOR,
            prompt: payloadContent,
            output: "no-schema",
            onFinish: async ({ object, usage }) => {
              logger.info("Usage - Search Product - Step 2", { usage });

              if (object) {
                finalizedToolData.data.object.productDetails = object as Record<
                  string,
                  any
                >;
              }

              generation.update({
                process: "stream:partial-done",
                loading: true,
              });

              streamableObject.done();

              await createObjectEntry({
                key: finalizedToolData.data.callId,
                chatId: state.get().chatId,
                owner: state.get().username,
                type: "getProductDetails",
                object: finalizedToolData.data,
              });

              generation.update({
                process: "database:save-state",
                loading: true,
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

          generation.update({
            process: "stream:generating",
            loading: true,
          });

          const streamableText = createStreamableValue<string>("");

          yield (
            <>
              <ProductDetails
                content={{
                  success: true,
                  name: "getProductDetails",
                  args: finalizedToolData.args,
                  data: finalizedToolData.data as any,
                }}
              />
              <StreamAssistantMessage content={streamableText.value} />
            </>
          );

          const payloadInsight = {
            prompt: userMessage?.text_input ?? null,
            data: finalizedToolData.data.object.productDetails,
            externalData: finalizedToolData.data.object.externalData,
          };

          let finalizedText: string = "";

          const { textStream } = streamText({
            model: google("gemini-2.0-flash"),
            system: await SYSTEM_INSTRUCTION.PRODUCT_DETAILS_INSIGHT,
            prompt: JSON.stringify(payloadInsight),
            onFinish: async ({ text, usage }) => {
              logger.info("Usage - Search Product - Step 3", { usage });

              finalizedText = text;

              streamableText.done();

              generation.update({
                process: "stream:done",
                loading: true,
              });
            },
            onError: ({ error }) => {
              streamableText.error(error);
              errorState = {
                isError: true,
                error,
              };
            },
            experimental_transform: smoothStream({
              delayInMs: 20,
              chunking: "word",
            }),
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
                  args: finalizedToolData.args,
                  data: finalizedToolData.data as TProductDetails<DetailsTokopedia>,
                }}
              />
              <AssistantMessage content={finalizedText} />
            </>
          );

          const { toolResult, mutate } = mutateTool(state, {
            name: "getProductDetails",
            args: finalizedToolData.args,
            result: finalizedToolData.data,
            overrideAssistant: {
              content: finalizedText,
            },
          });

          generation.update({
            process: "database:save-state",
            loading: true,
          });

          await createToolDataEntry({
            key: finalizedToolData.data.callId,
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
            generation.update({
              process: "stream:next-action",
              loading: true,
            });

            yield (
              <>
                {getProductDetailsUiNode}
                <StreamRelatedMessage content={streamableRelated.value} />
              </>
            );

            const payloadRelated = JSON.stringify(
              toPayloadRelatedMessage([...state.get().messages, ...mutate])
            );

            const { partialObjectStream: relatedStream } = streamObject({
              model: google("gemini-2.0-flash-lite"),
              system: await SYSTEM_INSTRUCTION.RELATED_QUERY_CRAFTER,
              prompt: payloadRelated,
              schema: relatedQuerySchema,
              onFinish: async ({ object, usage }) => {
                logger.info("Usage - Search Product - Step 4", { usage });

                if (object) {
                  relatedObject = object;
                }
                streamableRelated.done();

                generation.update({
                  process: "stream:done",
                  loading: true,
                });
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
          }

          if (errorState.isError) {
            generation.done({
              process: "tool:fatal-error",
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
          } else {
            generation.done({
              process: "tool:done",
              loading: true,
            });
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
            process: "api:fatal-error",
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
      }
    },
  };

  return getProductDetails;
};

export { toolGetProductDetails };
