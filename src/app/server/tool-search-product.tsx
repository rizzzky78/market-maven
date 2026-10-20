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
import { ProductSearch } from "@/components/maven/product-search";
import {
  StreamRelatedMessage,
  RelatedMessage,
} from "@/components/maven/related-message";
import { LoadingText } from "@/components/maven/shining-glass";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { productsSchema } from "@/lib/agents/schema/product";
import { RelatedQuery, PartialRelated } from "@/lib/agents/schema/related";
import { searchProductSchema } from "@/lib/agents/schema/tool-parameters";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { handleScrapingWithCache } from "@/lib/service/cache-store";
import { createMarkdownEntry, createObjectEntry } from "@/lib/service/store";
import { MessageProperty, RenderTool, ToolsetProps } from "@/lib/types/ai";
import {
  Product,
  SearchProductResult,
  GlobalSearchResult,
  TokopediaSearchResult,
} from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { processURLQuery } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { DeepPartial, Output } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { ReactNode } from "react";
import { v4 } from "uuid";
import { queryValidator } from "./subtools/query-validator";
import { queryEnhancer } from "./subtools/query-enhancer";
import { QueryValidation } from "@/components/maven/query-validation";
import { QueryEnhancement } from "@/components/maven/query-enhancement";
import { QueryValidationSkeleton } from "@/components/maven/query-validation-skeleton";
import { QueryEnhancementSkeleton } from "@/components/maven/query-enhancement-skeleton";
import { searchProductInsight } from "./subtools/data-source/insight";
import { InsightProductCardSkeleton } from "@/components/maven/insight-product-card-skeleton";
import { InsightProductCard } from "@/components/maven/insight-product-card";
import { StreamProductSearch } from "@/components/maven/stream-product-search";
import {
  commitToolResult,
  createErrorState,
  finishGeneration,
  streamOutputToValue,
  streamRelatedQuery,
  streamTextToValue,
} from "./workflow";

const toolSearchProduct = ({
  generation,
  state,
  requestOption,
  userMessage,
}: ToolsetProps) => {
  const searchProduct: RenderTool<typeof searchProductSchema> = {
    description: TEMPLATE.search_product_description,
    inputSchema: searchProductSchema,
    generate: async function* ({ query }) {
      const toolRequestId = v4();
      const errorState = createErrorState();

      yield <LoadingText text={`Searching for ${query}`} />;

      logger.info("Using searchProduct tool", {
        progress: "initial",
        request: { query },
      });

      generation.update({
        process: "tool:initial",
        loading: true,
      });


      yield <LoadingText text="Validating user query..." />;

      yield <QueryValidationSkeleton />;

      const validatedResult = await queryValidator({ query });

      if (!validatedResult.ok || !validatedResult.data) {
        errorState.isError = true;
        errorState.error = validatedResult.error;

        generation.done({
          process: "api:fatal-error",
          loading: false,
          error: "LLM Generation Error",
        });

        return (
          <ErrorMessage
            errorName="LLM Error"
            reason="There was an error on LLMs Agent query validation, that's all we know :("
            raw={{
              payload: { query },
              error: errorState,
            }}
          />
        );
      }

      generation.update({
        process: "tool:partial-done",
        loading: true,
      });

      const queryValidationUI = (
        <QueryValidation
          data={validatedResult.data}
          usage={validatedResult.usage}
        />
      );

      yield (
        <>
          {queryValidationUI}
          <QueryEnhancementSkeleton />
        </>
      );

      const enhancedQuery = await queryEnhancer({ query });

      generation.update({
        process: "tool:next-action",
        loading: true,
      });

      /**
       * Node UI for both:
       * - Query Validation
       * - Query Enhancement
       */
      const queryVEUI = (
        <>
          {queryValidationUI}
          <QueryEnhancement
            data={enhancedQuery.data}
            usage={enhancedQuery.usage}
          />
        </>
      );

      yield queryVEUI;

      /**
       * Build Toolset
       */

      const finalizedToolData = {
        args: { query },
        data: {
          source: requestOption?.onRequest?.reffSource,
          callId: toolRequestId,
          object: {} as SearchProductResult["object"],
        },
      };

      /**
       * Streams the related queries when requested, then closes the generation.
       * Yields the in-progress UI and returns the final UI node.
       */
      async function* finalize(uiNode: ReactNode, mutate: MessageProperty[]) {
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
            "Search Product - Step 3"
          );

          generation.update({
            process: "stream:done",
            loading: true,
          });
        }

        const failure = finishGeneration(generation, errorState, { query });
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
       * Reference Source Switcher
       *
       * Logic:
       * - if reffSource: "insight" -> marketSource: "global"
       * - if reffSource: "tokopedia" -> marketSource: "tokopedia"
       * - if reffSource: "shopee" -> marketSource: "shopee" (using same API as "insight" but with marketSource: "shopee" in payload)
       */

      if (
        requestOption?.onRequest?.reffSource &&
        requestOption?.onRequest?.reffSource !== "tokopedia"
      ) {
        generation.update({
          process: "tool:partial-done",
          loading: true,
        });

        yield (
          <>
            {queryVEUI}
            <InsightProductCardSkeleton />
          </>
        );

        const insightResult = await searchProductInsight({
          query: enhancedQuery.data.enhanced_query,
          marketSource: requestOption.onRequest.reffSource,
        });

        if (!insightResult.ok || !insightResult.data) {
          errorState.isError = true;
          errorState.error = insightResult.error;

          generation.done({
            process: "api:fatal-error",
            loading: false,
            error: "LLM Generation Error",
          });

          return (
            <ErrorMessage
              errorName="LLM Error"
              reason="There was an error on LLMs Agent product search object crafter, that's all we know :("
              raw={{
                payload: { query },
                error: errorState,
              }}
            />
          );
        }

        generation.update({
          process: "tool:next-action",
          loading: true,
        });

        /**
         * Assign insight result to tool data
         */
        finalizedToolData.data.object = insightResult.data.data;

        generation.update({
          process: "database:save-state",
          loading: true,
        });

        await createObjectEntry({
          key: finalizedToolData.data.callId,
          chatId: state.get().chatId,
          owner: state.get().username,
          type: "searchProduct",
          object: finalizedToolData.data,
        });

        generation.update({
          process: "stream:initial",
          loading: true,
        });

        const insightContent = {
          success: true,
          name: "searchProduct",
          args: finalizedToolData.args,
          data: finalizedToolData.data as SearchProductResult<GlobalSearchResult>,
        } as const;

        const streamableText = createStreamableValue<string>("");

        yield (
          <>
            <InsightProductCard
              usage={insightResult.usage}
              content={insightContent}
            />
            <StreamAssistantMessage content={streamableText.value} />
          </>
        );

        const finalizedText = await streamTextToValue(
          streamableText,
          errorState,
          {
            model: google("gemini-2.5-flash"),
            instructions: await SYSTEM_INSTRUCTION.PRODUCT_SEARCH_INSIGHT,
            prompt: JSON.stringify({
              searchQuery: query,
              userRequest: userMessage?.text_input ?? null,
              ...insightResult.data,
            }),
            onEnd: ({ usage }) => {
              logger.info("Usage - Search Product - Step 2", { usage });
            },
          }
        );

        generation.update({
          process: "stream:partial-done",
          loading: false,
        });

        const searchProductUiNode = (
          <>
            {queryVEUI}
            <InsightProductCard
              opened
              usage={insightResult.usage}
              content={insightContent}
            />
            <AssistantMessage content={finalizedText} />
          </>
        );

        const mutate = await commitToolResult(state, generation, toolRequestId, {
          name: "searchProduct",
          args: finalizedToolData.args,
          result:
            finalizedToolData.data as SearchProductResult<GlobalSearchResult>,
          overrideAssistant: {
            content: finalizedText,
          },
        });

        logger.info("Done using searchProduct tool", {
          progress: "finish",
          request: { query, reffSource: requestOption?.onRequest?.reffSource },
        });

        return yield* finalize(searchProductUiNode, mutate);
      }

      yield <LoadingText text={`Perform scrape operation...`} />;

      generation.update({
        process: "api:requesting-data",
        loading: true,
      });

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

      }

      if (!scrapeContent.success) {
        generation.done({
          process: "api:fatal-error",
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

      if (!scrapeContent.markdown || !scrapeContent.screenshot) {
        // Returning nothing here left the generation open and the UI loading.
        generation.done({
          process: "api:fatal-error",
          loading: false,
          error: "Empty scrape result",
        });

        return (
          <ErrorMessage
            errorName="No Page Content"
            reason="The marketplace page returned no readable content. Try again, or use a more specific product name."
            raw={{ payload: { query } }}
          />
        );
      }

      generation.update({
        process: "api:success",
        loading: true,
      });

      yield (
        <>
          {queryVEUI}
          <LoadingText text="Found products..." />
        </>
      );

      const tokopediaObject = finalizedToolData.data
        .object as SearchProductResult<TokopediaSearchResult>["object"];

      tokopediaObject.screenshot = scrapeContent.screenshot;

      generation.update({
        process: "database:save-state",
        loading: true,
      });

      await createMarkdownEntry({
        key: finalizedToolData.data.callId,
        chatId: state.get().chatId,
        owner: state.get().username,
        type: "product-search",
        markdown: scrapeContent.markdown,
      });

      yield (
        <>
          {queryVEUI}
          <LoadingText text="Proceed to data extraction..." />
        </>
      );

      const payload = JSON.stringify({
        objective: TEMPLATE.gpd_extraction_objective,
        markdown: scrapeContent.markdown,
      });

      const streamableProducts = createStreamableValue<DeepPartial<Product[]>>();

      yield (
        <>
          {queryVEUI}
          <StreamProductSearch
            query={query}
            callId={finalizedToolData.data.callId}
            screenshot={scrapeContent.screenshot}
            products={streamableProducts.value}
          />
        </>
      );

      generation.update({
        process: "stream:initial",
        loading: true,
      });

      const extracted = await streamOutputToValue(
        streamableProducts,
        errorState,
        {
          model: google("gemini-2.5-flash"),
          instructions: await SYSTEM_INSTRUCTION.PRODUCT_SEARCH_EXTRACTOR,
          prompt: payload,
          output: Output.object({ schema: productsSchema }),
          select: (chunk) => chunk.data,
          onEnd: ({ usage }) => {
            logger.info("Usage - Search Product - Step 1", { usage });
          },
        }
      );

      if (extracted) {
        tokopediaObject.products = extracted.data;
      }

      generation.update({
        process: "stream:partial-done",
        loading: true,
      });

      await createObjectEntry({
        key: finalizedToolData.data.callId,
        chatId: state.get().chatId,
        owner: state.get().username,
        type: "searchProduct",
        object: finalizedToolData.data,
      });

      generation.update({
        process: "database:save-state",
        loading: true,
      });

      const productSearchContent = {
        success: true,
        name: "searchProduct",
        args: { query },
        data: finalizedToolData.data as SearchProductResult<TokopediaSearchResult>,
      } as const;

      const streamableText = createStreamableValue<string>("");

      yield (
        <>
          {queryVEUI}
          <ProductSearch content={productSearchContent} isFinished={true} />
          <StreamAssistantMessage content={streamableText.value} />
        </>
      );

      generation.update({
        process: "stream:next-action",
        loading: true,
      });

      const finalizedText = await streamTextToValue(streamableText, errorState, {
        model: google("gemini-2.5-flash"),
        instructions: await SYSTEM_INSTRUCTION.PRODUCT_SEARCH_INSIGHT,
        prompt: JSON.stringify({
          searchQuery: query,
          userRequest: userMessage?.text_input ?? null,
          products: tokopediaObject.products ?? [],
        }),
        onEnd: ({ usage }) => {
          logger.info("Usage - Search Product - Step 2", { usage });
        },
      });

      generation.update({
        process: "stream:partial-done",
        loading: true,
      });

      const searchProductUiNode = (
        <>
          {queryVEUI}
          <ProductSearch content={productSearchContent} isFinished={true} />
          <AssistantMessage content={finalizedText} />
        </>
      );

      /**
       * Mutate tool result to message context and saving the AI state
       */
      const mutate = await commitToolResult(
        state,
        generation,
        finalizedToolData.data.callId,
        {
          name: "searchProduct",
          args: finalizedToolData.args,
          result:
            finalizedToolData.data as SearchProductResult<TokopediaSearchResult>,
          overrideAssistant: {
            content: finalizedText,
          },
        }
      );

      logger.info("Done using searchProduct tool", {
        progress: "finish",
        request: { query },
      });

      return yield* finalize(searchProductUiNode, mutate);
    },
  };

  return searchProduct;
};

export { toolSearchProduct };
