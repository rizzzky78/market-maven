import {
  StreamAssistantMessage,
  AssistantMessage,
} from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import {
  ExtendedMessage,
  StreamExtendedMessage,
} from "@/components/maven/extended-message";
import {
  StreamProductDetails,
  ProductDetails,
} from "@/components/maven/product-details";
import {
  StreamRelatedMessage,
  RelatedMessage,
} from "@/components/maven/related-message";
import { LoadingText } from "@/components/maven/shining-glass";
import { toPayloadRelatedMessage } from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
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
} from "@/lib/service/store";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import { ProductDetailsResponse } from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { streamText, streamObject } from "ai";
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
    generate: async function* ({ query, link, source }) {
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

      yield <LoadingText text={`Perform scrape operation...`} />;

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
        const finalizedObject: ProductDetailsResponse = {
          callId: toolRequestId,
          screenshot: scrapeContent.screenshot,
          externalData: {
            tavily: null,
            markdown: null,
          },
          productDetails: {},
        };

        generation.update({
          process: "api_success",
          loading: true,
        });

        yield <LoadingText text="Retrieved raw data..." />;

        await createMarkdownEntry({
          key: finalizedObject.callId,
          chatId: state.get().chatId,
          owner: state.get().username,
          type: "product-details",
          markdown: scrapeContent.markdown,
        });

        yield <LoadingText text="Proceed to data extraction..." />;

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
              text={`Retrieved additional information, thought for ${externalData.data.responseTime} seconds`}
            />
          );

          finalizedObject.externalData.tavily = externalData.data.answer;

          yield (
            <ExtendedMessage content={finalizedObject.externalData.tavily} />
          );

          const streamableResearch = createStreamableValue("");

          yield <StreamExtendedMessage content={streamableResearch.value} />;

          let researcherText = "";

          const { textStream: researcherStream } = streamText({
            model: google("gemini-2.0-flash-lite"),
            system: await SYSTEM_INSTRUCTION.PRODUCT_RESEARCHER,
            prompt: JSON.stringify({ query }),
            onFinish: ({ text, usage }) => {
              logger.info("Usage - Get Product Details - Step 1", { usage });

              finalizedObject.externalData.markdown = text;
              streamableResearch.done(text);
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

        const payloadContent = JSON.stringify({
          refference: { query, link },
          markdown: scrapeContent.markdown,
          externalData: finalizedObject.externalData,
        });

        const streamableObject = createStreamableValue<Record<string, any>>();

        yield (
          <StreamProductDetails
            query={query}
            link={link}
            callId={finalizedObject.callId}
            content={streamableObject.value}
            screenshot={scrapeContent.screenshot}
            externalData={finalizedObject.externalData}
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
              finalizedObject.productDetails = object as Record<string, any>;
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
                data: finalizedObject,
              }}
            />
            <StreamAssistantMessage content={streamableText.value} />
          </>
        );

        const payloadInsight = {
          prompt: userMessage?.text_input ?? null,
          data: finalizedObject.productDetails,
          externalData: externalData.data,
        };

        let finalizedText: string = "";

        const { textStream } = streamText({
          model: google("gemini-2.0-flash-lite"),
          system: await SYSTEM_INSTRUCTION.PRODUCT_DETAILS_INSIGHT,
          prompt: JSON.stringify(payloadInsight),
          onFinish: async ({ text, usage }) => {
            logger.info("Usage - Search Product - Step 3", { usage });

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
                data: finalizedObject,
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
  };

  return getProductDetails;
};

export { toolGetProductDetails };
