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
import { Output, LanguageModelUsage, smoothStream, isStepCount } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { ReactNode } from "react";
import { v4 } from "uuid";
import {
  commitToolResult,
  createErrorState,
  delay,
  finishGeneration,
  streamOutputToValue,
  streamRelatedQuery,
  streamTextToValue,
} from "./workflow";

const toolGetProductDetails = ({
  generation,
  state,
  requestOption,
  userMessage,
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

      yield <LoadingText text={`Getting data product for ${query}`} />;

      logger.info("Using getProductDetails tool", {
        progress: "initial",
        request: { query, link },
      });

      generation.update({
        process: "tool:initial",
        loading: true,
      });

      await delay(3000);

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
       * Saves the tool result, streams the related queries when requested and
       * closes the generation. Yields the in-progress UI and returns the final
       * UI node.
       */
      async function* finalize(uiNode: ReactNode, insightText: string) {
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

          const streamableRelated = createStreamableValue<PartialRelated>();

          yield (
            <>
              {uiNode}
              <StreamRelatedMessage content={streamableRelated.value} />
            </>
          );

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

        return (
          <>
            {uiNode}
            {requestOption?.onRequest?.related && (
              <RelatedMessage related={relatedObject} />
            )}
          </>
        );
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

          await delay(3000);

          finalizedToolData.data.object.externalData.tavily =
            externalData.data.answer;

          generation.update({
            process: "stream:generating",
            loading: true,
          });

          const streamableResearch = createStreamableValue("");

          yield <StreamExtendedMessage content={streamableResearch.value} />;

          finalizedToolData.data.object.externalData.markdown =
            await streamTextToValue(streamableResearch, errorState, {
              model: google("gemini-2.5-flash"),
              instructions: await SYSTEM_INSTRUCTION.PRODUCT_RESEARCHER,
              prompt: JSON.stringify({ query }),
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

        const streamableDetailsResearcher = createStreamableValue("");

        yield (
          <StreamExtendedMessage
            title={`Getting Data for ${globalObject.previousData.title}`}
            content={streamableDetailsResearcher.value}
          />
        );

        const usages: LanguageModelUsage[] = [];

        globalObject.markdown = await streamTextToValue(
          streamableDetailsResearcher,
          errorState,
          {
            model: google("gemini-2.5-flash"),
            tools: { google_search: google.tools.googleSearch({}) },
            instructions: PRODUCT_RESEARCHER_INSIGHT_SYSTEM_PROMPT,
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

        const streamableObject = createStreamableValue<Record<string, any>>();

        yield (
          <StreamProductDetailsInsight
            content={streamableObject.value}
            callId={finalizedToolData.data.callId}
            data={globalObject}
          />
        );

        let partialDetails: Record<string, any> = {};

        const detailsInsight = await streamOutputToValue(
          streamableObject,
          errorState,
          {
            model: google("gemini-2.5-flash"),
            instructions: PRODUCT_EXTRACTOR_INSIGHT_SYSTEM_PROMPT,
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

        const streamableText = createStreamableValue<string>("");

        yield (
          <>
            <ProductDetailsInsight
              content={insightContent}
              usage={mergedLLMUsage}
            />
            <StreamAssistantMessage content={streamableText.value} />
          </>
        );

        const payloadInsight = {
          prompt: userMessage?.text_input ?? undefined,
          dataset: finalizedToolData.data.object,
        };

        const finalizedInsightText = await streamTextToValue(
          streamableText,
          errorState,
          {
            model: google("gemini-2.5-flash"),
            instructions: await SYSTEM_INSTRUCTION.PRODUCT_DETAILS_INSIGHT,
            prompt: JSON.stringify(payloadInsight),
          }
        );

        generation.update({
          process: "stream:done",
          loading: true,
        });

        return yield* finalize(
          <>
            <ProductDetailsInsight
              content={insightContent}
              usage={mergedLLMUsage}
            />
            <AssistantMessage content={finalizedInsightText} />
          </>,
          finalizedInsightText
        );
      }

      if (!link) return;

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
          <LoadingText text={`The query is cached!. Proceed to data extraction`} />
        );

        await delay(3000);
      }

      if (!scrapeContent.success) {
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

      if (!scrapeContent.markdown || !scrapeContent.screenshot) return;

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

      const productDetails = await streamOutputToValue(
        streamableObject,
        errorState,
        {
          model: google("gemini-2.5-flash"),
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

      const streamableText = createStreamableValue<string>("");

      yield (
        <>
          <ProductDetails content={detailsContent} />
          <StreamAssistantMessage content={streamableText.value} />
        </>
      );

      const payloadInsight = {
        prompt: userMessage?.text_input ?? null,
        data: finalizedToolData.data.object.productDetails,
        externalData: finalizedToolData.data.object.externalData,
      };

      const finalizedText = await streamTextToValue(streamableText, errorState, {
        model: google("gemini-2.5-flash"),
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
        <>
          <ProductDetails content={detailsContent} />
          <AssistantMessage content={finalizedText} />
        </>,
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
