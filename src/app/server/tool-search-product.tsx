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
import { toPayloadRelatedMessage } from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { productsSchema } from "@/lib/agents/schema/product";
import {
  RelatedQuery,
  PartialRelated,
  relatedQuerySchema,
} from "@/lib/agents/schema/related";
import { searchProductSchema } from "@/lib/agents/schema/tool-parameters";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { handleScrapingWithCache } from "@/lib/service/cache-store";
import {
  createMarkdownEntry,
  createObjectEntry,
  createToolDataEntry,
} from "@/lib/service/store";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import {
  ProductsResponse,
  Product,
  SearchProductResult,
  GlobalSearchResult,
  TokopediaSearchResult,
} from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { processURLQuery } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { DeepPartial, streamObject, streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
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

const toolSearchProduct = ({
  generation,
  errorState,
  state,
  requestOption,
}: ToolsetProps) => {
  const searchProduct: RenderTool<typeof searchProductSchema> = {
    description: TEMPLATE.search_product_description,
    parameters: searchProductSchema,
    generate: async function* ({ query }) {
      const toolRequestId = v4();

      yield <LoadingText text={`Searching for ${query}`} />;

      logger.info("Using searchProduct tool", {
        progress: "initial",
        request: { query },
      });

      generation.update({
        process: "tool:initial",
        loading: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      yield <LoadingText text="Validating user query..." />;

      yield <QueryValidationSkeleton />;

      const validatedResult = await queryValidator({ query });

      if (!validatedResult.ok || !validatedResult.data) {
        errorState = {
          isError: true,
          error: validatedResult.error,
        };

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
          errorState = {
            isError: true,
            error: insightResult.error,
          };

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

        const streamableText = createStreamableValue<string>("");

        yield (
          <>
            <InsightProductCard
              usage={insightResult.usage}
              content={{
                success: true,
                name: "searchProduct",
                args: finalizedToolData.args,
                data: finalizedToolData.data as SearchProductResult<GlobalSearchResult>,
              }}
            />
            <StreamAssistantMessage content={streamableText.value} />
          </>
        );

        let finalizedText: string = "";

        const { textStream } = streamText({
          model: google("gemini-2.0-flash-lite"),
          system: await SYSTEM_INSTRUCTION.PRODUCT_SEARCH_INSIGHT,
          prompt: JSON.stringify(insightResult.data),
          onFinish: ({ text, usage }) => {
            logger.info("Usage - Search Product - Step 2", { usage });

            finalizedText = text;
            streamableText.done();

            generation.update({
              process: "stream:partial-done",
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
            {queryVEUI}
            <InsightProductCard
              opened
              usage={insightResult.usage}
              content={{
                success: true,
                name: "searchProduct",
                args: finalizedToolData.args,
                data: finalizedToolData.data as SearchProductResult<GlobalSearchResult>,
              }}
            />
            <AssistantMessage content={finalizedText} />
          </>
        );

        const { toolResult, mutate } = mutateTool(state, {
          name: "searchProduct",
          args: finalizedToolData.args,
          result:
            finalizedToolData.data as SearchProductResult<GlobalSearchResult>,
          overrideAssistant: {
            content: finalizedText,
          },
        });

        generation.update({
          process: "database:save-state",
          loading: true,
        });

        await createToolDataEntry({
          key: toolRequestId,
          chatId: state.get().chatId,
          owner: state.get().username,
          tool: toolResult,
        });

        logger.info("Done using searchProduct tool", {
          progress: "finish",
          request: { query, reffSource: requestOption?.onRequest?.reffSource },
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
              {searchProductUiNode}
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
              logger.info("Usage - Search Product - Step 3", { usage });

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
                payload: { query },
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
            {searchProductUiNode}
            {requestOption?.onRequest?.related && (
              <RelatedMessage related={relatedObject} />
            )}
          </>
        );
      } else {
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

          yield (
            <>
              {queryVEUI}
              <LoadingText text="Found products..." />
            </>
          );

          (
            finalizedToolData.data
              .object as SearchProductResult<TokopediaSearchResult>["object"]
          ).screenshot = scrapeContent.screenshot;

          const finalizedProductSearch: ProductsResponse = {
            callId: toolRequestId,
            screenshot: scrapeContent.screenshot,
            data: [],
          };

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

          const streamableProducts =
            createStreamableValue<DeepPartial<Product[]>>();

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

          const { partialObjectStream } = streamObject({
            model: google("gemini-2.0-flash-lite"),
            system: await SYSTEM_INSTRUCTION.PRODUCT_SEARCH_EXTRACTOR,
            prompt: payload,
            schema: productsSchema,
            onFinish: async ({ object, usage }) => {
              logger.info("Usage - Search Product - Step 1", { usage });

              if (object) {
                (
                  finalizedToolData.data
                    .object as SearchProductResult<TokopediaSearchResult>["object"]
                ).products = object.data;
              }

              streamableProducts.done();

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
              {queryVEUI}
              <ProductSearch
                content={{
                  success: true,
                  name: "searchProduct",
                  args: { query },
                  data: finalizedToolData.data as SearchProductResult<TokopediaSearchResult>,
                }}
                isFinished={true}
              />
              <StreamAssistantMessage content={streamableText.value} />
            </>
          );

          let finalizedText: string = "";

          generation.update({
            process: "stream:next-action",
            loading: true,
          });

          const { textStream } = streamText({
            model: google("gemini-2.0-flash-lite"),
            system: await SYSTEM_INSTRUCTION.PRODUCT_SEARCH_INSIGHT,
            prompt: JSON.stringify(finalizedProductSearch.data),
            onFinish: ({ text, usage }) => {
              logger.info("Usage - Search Product - Step 2", { usage });

              finalizedText = text;
              streamableText.done();

              generation.update({
                process: "stream:partial-done",
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

          for await (const texts of textStream) {
            finalizedText += texts;
            streamableText.update(finalizedText);
          }

          const searchProductUiNode = (
            <>
              {queryVEUI}
              <ProductSearch
                content={{
                  success: true,
                  name: "searchProduct",
                  args: { query },
                  data: finalizedToolData.data as SearchProductResult<TokopediaSearchResult>,
                }}
                isFinished={true}
              />
              <AssistantMessage content={finalizedText} />
            </>
          );

          /**
           * Mutate tool result to message context and saving the AI state
           */
          const { toolResult, mutate } = mutateTool(state, {
            name: "searchProduct",
            args: finalizedToolData.args,
            result:
              finalizedToolData.data as SearchProductResult<TokopediaSearchResult>,
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

          logger.info("Done using searchProduct tool", {
            progress: "finish",
            request: { query },
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
                {searchProductUiNode}
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
                logger.info("Usage - Search Product - Step 3", { usage });

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
                  payload: { query },
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
              {searchProductUiNode}
              {requestOption?.onRequest?.related && (
                <RelatedMessage related={relatedObject} />
              )}
            </>
          );
        } else if (!scrapeContent.success) {
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
      }
    },
  };

  return searchProduct;
};

export { toolSearchProduct };
