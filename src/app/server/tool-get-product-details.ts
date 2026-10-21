/**
 *
 * CODED BY HUMAN BEING :)
 *
 *
 */

import { models } from "@/lib/agents/models";
import { groundingPolicy } from "@/lib/agents/constant/md/grounding";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { PRODUCT_EXTRACTOR_INSIGHT_SYSTEM_PROMPT } from "@/lib/agents/constant/md/product-extractor-insight";
import { PRODUCT_RESEARCHER_INSIGHT_SYSTEM_PROMPT } from "@/lib/agents/constant/md/product-researcher-insight";
import { RelatedQuery, PartialRelated } from "@/lib/agents/schema/related";
import { getProductDetailsSchema } from "@/lib/agents/schema/tool-parameters";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { externalTavilySearch } from "@/lib/agents/tools/api/tavily";
import { handleScrapingWithCache } from "@/lib/service/cache-store";
import {
  createMarkdownEntry,
  createObjectEntry,
  getObjectEntry,
} from "@/lib/service/store";
import { RenderTool, ToolsetProps, View } from "@/lib/types/ai";
import {
  DetailsGlobal,
  ExtendedSearchResult,
  ProductDetails as TProductDetails,
  SearchProductResult,
  DetailsTokopedia,
} from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { Output, LanguageModelUsage, smoothStream, isStepCount } from "ai";
import { v4 } from "uuid";
import {
  commitToolResult,
  createErrorState,
  finishGeneration,
  streamOutputToValue,
  streamRelatedQuery,
  streamTextToValue,
} from "./workflow";
import { ui } from "./stream-ui";

const toolGetProductDetails = ({
  generation,
  state,
  requestOption,
  userMessage,
  createStreamable,
  abortSignal,
}: ToolsetProps) => {
  const getProductDetails: RenderTool<typeof getProductDetailsSchema> = {
    description: TEMPLATE.get_product_details_description,
    inputSchema: getProductDetailsSchema,
    generate: async function* ({ query, link, callId, source }) {
      /**
       * Previous call ID from product search object tool
       */
      const prevCallId = callId;

      const toolRequestId = v4();
      const errorState = createErrorState();

      yield ui("LoadingText", { text: `Getting data product for ${query}` });

      logger.info("Using getProductDetails tool", {
        progress: "initial",
        request: { query, link },
      });

      generation.update({
        process: "tool:initial",
        loading: true,
      });

      yield ui("LoadingText", { text: "Perform scrape operation..." });

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
       * Saves the tool result, streams the related queries when requested and
       * closes the generation. Yields the in-progress UI and returns the final
       * UI node.
       */
      async function* finalize(uiNode: View, insightText: string) {
        const mutate = await commitToolResult(
          state,
          generation,
          finalizedToolData.data.callId,
          {
            name: "getProductDetails",
            args: finalizedToolData.args,
            result: finalizedToolData.data,
            overrideAssistant: {
              content: insightText,
            },
          }
        );

        logger.info("Done using getProductDetails tool", {
          progress: "finish",
          request: { query, link },
        });

        let relatedObject: RelatedQuery | null = null;

        if (requestOption?.onRequest?.related) {
          generation.update({
            process: "stream:next-action",
            loading: true,
          });

          const streamableRelated = createStreamable<PartialRelated>();

          yield [
            uiNode,
            ui("StreamRelatedMessage", { content: streamableRelated.value }),
          ];

          relatedObject = await streamRelatedQuery(
            streamableRelated,
            errorState,
            [...state.get().messages, ...mutate],
            "Get Product Details - Step 4"
          );

          generation.update({
            process: "stream:done",
            loading: true,
          });
        }

        const failure = finishGeneration(generation, errorState, {
          query,
          link,
        });
        if (failure) return failure;

        return [
          uiNode,
          requestOption?.onRequest?.related &&
            ui("RelatedMessage", { related: relatedObject }),
        ];
      }

      /**
       * ==================
       * START - RESEARCHER
       * ==================
       */

      if (
        requestOption?.onRequest?.search &&
        finalizedToolData.data.object.externalData
      ) {
        yield ui("LoadingText", {
          text: "Perform search to get additonal information...",
        });

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

        const evidence = externalData.data;

        if (evidence && (evidence.answer || evidence.results.length > 0)) {
          yield ui("LoadingText", {
            text: `Found ${evidence.results.length} web sources in ${evidence.responseTime} seconds`,
          });

          generation.update({
            process: "stream:initial",
            loading: true,
          });


          finalizedToolData.data.object.externalData.tavily =
            evidence.answer ||
            `Summarised from ${evidence.results.length} web sources.`;

          generation.update({
            process: "stream:generating",
            loading: true,
          });

          const streamableResearch = createStreamable("");

          yield ui("StreamExtendedMessage", {
            content: streamableResearch.value,
          });

          finalizedToolData.data.object.externalData.markdown =
            await streamTextToValue(streamableResearch, errorState, {
              model: models.reasoning,
              abortSignal,
              tools: { google_search: google.tools.googleSearch({}) },
              instructions: await SYSTEM_INSTRUCTION.PRODUCT_RESEARCHER,
              // The researcher writes from the retrieved evidence, not memory.
              prompt: JSON.stringify({
                query,
                userQuestion: userMessage?.text_input ?? null,
                evidence: {
                  answer: evidence.answer ?? null,
                  sources: evidence.results.map((r) => ({
                    title: r.title,
                    url: r.url,
                    content: r.content,
                    publishedDate: r.publishedDate,
                  })),
                },
              }),
              onEnd: ({ usage }) => {
                logger.info("Usage - Get Product Details - Step 1", { usage });
              },
            });

          generation.update({
            process: "stream:next-action",
            loading: true,
          });
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

          errorState.isError = true;
          errorState.error = {
            access_to_call_id: prevCallId,
            error_reason: "Previous Object Data Not Found!",
          };

          return ui("ErrorMessage", {
            errorName: "LLM Error",
            reason:
              "There was an error on LLMs Agent generation, that's all we know :(",
            raw: {
              payload: { query, link },
              error: errorState,
            },
          });
        }

        const {
          object: { object: prevSearch },
        } = prevObjectSearch;

        const globalObject = finalizedToolData.data
          .object as TProductDetails<DetailsGlobal>["object"];

        globalObject.previousData = {
          title: prevSearch.title,
          estimatedPrice: prevSearch.estimatedPrice,
          referenceCallId: prevCallId,
        };

        globalObject.snapshots = {
          images: prevSearch.images,
          videos: prevSearch.videos,
        };

        generation.update({
          process: "stream:generating",
          loading: true,
        });

        const streamableDetailsResearcher = createStreamable("");

        yield ui("StreamExtendedMessage", {
          title: `Getting Data for ${globalObject.previousData.title}`,
          content: streamableDetailsResearcher.value,
        });

        const usages: LanguageModelUsage[] = [];

        globalObject.markdown = await streamTextToValue(
          streamableDetailsResearcher,
          errorState,
          {
            model: models.reasoning,
            abortSignal,
            tools: { google_search: google.tools.googleSearch({}) },
            instructions: PRODUCT_RESEARCHER_INSIGHT_SYSTEM_PROMPT + groundingPolicy(),
            stopWhen: isStepCount(5),
            prompt: JSON.stringify({
              payload: globalObject.previousData.title,
            }),
            onEnd: ({ usage }) => {
              usages.push(usage);
            },
          }
        );

        generation.update({
          process: "stream:partial-done",
          loading: true,
        });

        const payloadContent = JSON.stringify({
          payload: {
            dataset: {
              previousData: globalObject.previousData,
              snapshots: globalObject.snapshots,
              markdown: globalObject.markdown,
            },
            externalData: finalizedToolData.data.object.externalData,
          },
        });

        generation.update({
          process: "stream:generating",
          loading: true,
        });

        const streamableObject = createStreamable<Record<string, any>>();

        yield ui("StreamProductDetailsInsight", {
          content: streamableObject.value,
          callId: finalizedToolData.data.callId,
          data: globalObject,
        });

        let partialDetails: Record<string, any> = {};

        const detailsInsight = await streamOutputToValue(
          streamableObject,
          errorState,
          {
            model: models.extract,
            abortSignal,
            instructions: PRODUCT_EXTRACTOR_INSIGHT_SYSTEM_PROMPT + groundingPolicy(),
            prompt: payloadContent,
            output: Output.json(),
            select: (partial) => (partialDetails = partial as Record<string, any>),
            onEnd: ({ usage }) => {
              usages.push(usage);
            },
          }
        );

        finalizedToolData.data.object.productDetails =
          (detailsInsight as Record<string, any> | undefined) ?? partialDetails;

        logger.info("[DEBUG: insightDetailsObject]", detailsInsight);

        generation.update({
          process: "stream:next-action",
          loading: true,
        });

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

        const mergedLLMUsage = sumUsage(usages);

        const insightContent = {
          success: true,
          name: "getProductDetails",
          args: finalizedToolData.args,
          data: finalizedToolData.data as TProductDetails<DetailsGlobal>,
        } as const;

        generation.update({
          process: "stream:generating",
          loading: true,
        });

        const streamableText = createStreamable<string>("");

        const insightNode = ui("ProductDetailsInsight", {
          content: insightContent,
          usage: mergedLLMUsage,
        });

        yield [
          insightNode,
          ui("StreamAssistantMessage", { content: streamableText.value }),
        ];

        const payloadInsight = {
          prompt: userMessage?.text_input ?? undefined,
          dataset: finalizedToolData.data.object,
        };

        const finalizedInsightText = await streamTextToValue(
          streamableText,
          errorState,
          {
            model: models.reasoning,
            abortSignal,
            instructions: await SYSTEM_INSTRUCTION.PRODUCT_DETAILS_INSIGHT,
            prompt: JSON.stringify(payloadInsight),
          }
        );

        generation.update({
          process: "stream:done",
          loading: true,
        });

        return yield* finalize(
          [insightNode, ui("AssistantMessage", { content: finalizedInsightText })],
          finalizedInsightText
        );
      }

      if (!link) {
        // Tokopedia details are scraped from the listing page.
        generation.done({
          process: "tool:error",
          loading: false,
          error: "Missing product link",
        });

        return ui("ErrorMessage", {
          errorName: "Product Link Missing",
          reason:
            "This Tokopedia product came without a listing link, so its page can't be read. Search for it again and attach a result from the new list.",
          raw: { payload: { query, callId, source } },
        });
      }

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
        yield ui("LoadingText", {
          text: "The query is cached!. Proceed to data extraction",
        });
      }

      if (!scrapeContent.success) {
        generation.done({
          process: "api:fatal-error",
          loading: false,
        });

        return ui("ErrorMessage", {
          errorName: "Scrape Operation Failed",
          reason:
            "There was an error while scrapping the content from the firecrawl service.",
          raw: {
            payload: { query, link },
            error: scrapeContent.error,
            message: scrapeContent.message,
          },
        });
      }

      if (!scrapeContent.markdown || !scrapeContent.screenshot) {
        // Returning nothing here left the generation open and the UI loading.
        generation.done({
          process: "api:fatal-error",
          loading: false,
          error: "Empty scrape result",
        });

        return ui("ErrorMessage", {
          errorName: "No Page Content",
          reason:
            "The marketplace page returned no readable content. Try again, or use a more specific product name.",
          raw: { payload: { query, link } },
        });
      }

      generation.update({
        process: "api:success",
        loading: true,
      });

      yield ui("LoadingText", { text: "Retrieved raw data..." });

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

      yield ui("LoadingText", { text: "Proceed to data extraction..." });

      const payloadContent = JSON.stringify({
        refference: { query, link },
        markdown: scrapeContent.markdown,
        externalData: finalizedToolData.data.object.externalData,
      });

      const streamableObject = createStreamable<Record<string, any>>();

      generation.update({
        process: "stream:generating",
        loading: true,
      });

      yield ui("StreamProductDetails", {
        query,
        link,
        callId: finalizedToolData.data.callId,
        content: streamableObject.value,
        screenshot: scrapeContent.screenshot,
        externalData: finalizedToolData.data.object.externalData,
      });

      const productDetails = await streamOutputToValue(
        streamableObject,
        errorState,
        {
          model: models.extract,
          abortSignal,
          instructions: await SYSTEM_INSTRUCTION.PRODUCT_DETAILS_EXTRACTOR,
          prompt: payloadContent,
          output: Output.json(),
          select: (partial) => partial as Record<string, any>,
          onEnd: ({ usage }) => {
            logger.info("Usage - Get Product Details - Step 2", { usage });
          },
        }
      );

      if (productDetails) {
        finalizedToolData.data.object.productDetails = productDetails as Record<
          string,
          any
        >;
      }

      generation.update({
        process: "stream:partial-done",
        loading: true,
      });

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

      generation.update({
        process: "stream:generating",
        loading: true,
      });

      const detailsContent = {
        success: true,
        name: "getProductDetails",
        args: finalizedToolData.args,
        data: finalizedToolData.data as TProductDetails<DetailsTokopedia>,
      } as const;

      const streamableText = createStreamable<string>("");

      const detailsNode = ui("ProductDetails", { content: detailsContent });

      yield [
        detailsNode,
        ui("StreamAssistantMessage", { content: streamableText.value }),
      ];

      const payloadInsight = {
        prompt: userMessage?.text_input ?? null,
        data: finalizedToolData.data.object.productDetails,
        externalData: finalizedToolData.data.object.externalData,
      };

      const finalizedText = await streamTextToValue(streamableText, errorState, {
        model: models.reasoning,
        abortSignal,
        instructions: await SYSTEM_INSTRUCTION.PRODUCT_DETAILS_INSIGHT,
        prompt: JSON.stringify(payloadInsight),
        onEnd: ({ usage }) => {
          logger.info("Usage - Get Product Details - Step 3", { usage });
        },
        experimental_transform: smoothStream({
          delayInMs: 20,
          chunking: "word",
        }),
      });

      generation.update({
        process: "stream:done",
        loading: true,
      });

      return yield* finalize(
        [detailsNode, ui("AssistantMessage", { content: finalizedText })],
        finalizedText
      );
    },
  };

  return getProductDetails;
};

/** Sums token usage across the steps of one tool call. */
const sumUsage = (usages: LanguageModelUsage[]): LanguageModelUsage => ({
  inputTokens: usages.reduce((n, u) => n + (u.inputTokens ?? 0), 0),
  inputTokenDetails: {
    noCacheTokens: undefined,
    cacheReadTokens: undefined,
    cacheWriteTokens: undefined,
  },
  outputTokens: usages.reduce((n, u) => n + (u.outputTokens ?? 0), 0),
  outputTokenDetails: {
    textTokens: undefined,
    reasoningTokens: undefined,
  },
  totalTokens: usages.reduce((n, u) => n + (u.totalTokens ?? 0), 0),
});

export { toolGetProductDetails };
