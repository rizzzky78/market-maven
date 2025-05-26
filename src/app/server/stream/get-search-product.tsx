import {
  StreamAssistantMessage,
  AssistantMessage,
} from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import {
  StreamProductSearch,
  ProductSearch,
} from "@/components/maven/product-search";
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
import { ProductsResponse, Product } from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { processURLQuery } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { DeepPartial, generateObject, streamObject, streamText } from "ai";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { v4 } from "uuid";
import { z } from "zod";

interface ExperimentalToolSearchProductProps extends ToolsetProps {
  ui: ReturnType<typeof createStreamableUI>;
}

const experimental_toolSearchProduct = ({
  generation,
  errorState,
  state,
  requestOption,
  ui,
}: ExperimentalToolSearchProductProps) => {
  const searchProduct: RenderTool<typeof searchProductSchema> = {
    description: TEMPLATE.search_product_description,
    parameters: searchProductSchema,
    generate: async function* ({ query }) {
      ui.update(<LoadingText text={`Searching for ${query}`} />);

      const toolRequestId = v4();

      logger.info("Using searchProduct tool", {
        progress: "initial",
        request: { query },
      });

      generation.update({
        process: "generating",
        loading: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      ui.update(<LoadingText text={`Perform scrape operation...`} />);

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
        ui.update(
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

        ui.update(<LoadingText text="Found products..." />);

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

        ui.update(<LoadingText text="Proceed to data extraction..." />);

        const payload = JSON.stringify({
          objective: TEMPLATE.gpd_extraction_objective,
          markdown: scrapeContent.markdown,
        });

        const streamableProducts =
          createStreamableValue<DeepPartial<Product[]>>();

        ui.update(
          <StreamProductSearch
            query={query}
            callId={finalizedProductSearch.callId}
            screenshot={scrapeContent.screenshot}
            products={streamableProducts.value}
          />
        );

        const { partialObjectStream } = streamObject({
          model: google("gemini-2.0-flash-lite"),
          system: await SYSTEM_INSTRUCTION.PRODUCT_SEARCH_EXTRACTOR,
          prompt: payload,
          schema: productsSchema,
          onFinish: async ({ object, usage }) => {
            logger.info("Usage - Search Product - Step 1", { usage });

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

        ui.update(
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
          model: google("gemini-2.0-flash-lite"),
          system: await SYSTEM_INSTRUCTION.PRODUCT_SEARCH_INSIGHT,
          prompt: JSON.stringify(finalizedProductSearch.data),
          onFinish: ({ text, usage }) => {
            logger.info("Usage - Search Product - Step 2", { usage });

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
          ui.append(<StreamRelatedMessage content={streamableRelated.value} />);
        }

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

          ui.update(
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

        if (requestOption?.onRequest?.related) {
          ui.append(<RelatedMessage related={relatedObject} />);
        }

        ui.done();

        return ui.value;
      } else if (!scrapeContent.success) {
        generation.done({
          process: "api_error",
          loading: false,
          error: scrapeContent.message,
        });

        ui.done(
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

        return ui.value;
      }
    },
  };

  return searchProduct;
};

export { experimental_toolSearchProduct };
