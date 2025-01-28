import { MutableAIState, RenderTool } from "@/lib/types/ai";
import { searchProductSchema } from "../../schema/tool-parameters";
import logger from "@/lib/utility/logger";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import { StreamProductsContainer } from "@/components/maven/exp-stream-products-container";
import { ProductsContainer } from "@/components/maven/products-container";
import { ShinyText } from "@/components/maven/shining-glass";
import { ProductsResponse, Product } from "@/lib/types/product";
import { processURLQuery } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { DeepPartial, streamObject, streamText } from "ai";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { productsSchema } from "../../schema/product";
import {
  SYSTEM_INSTRUCT_PRODUCTS,
  SYSTEM_INSTRUCT_INSIGHT,
} from "../../system-instructions";
import { scrapeUrl } from "../../tools/api/firecrawl";
import { mutateTool } from "../mutator/mutate-tool";
import { root } from "../../constant";

export const actionSearchProduct = (state: MutableAIState) => {
  const toolSearchProduct: RenderTool<typeof searchProductSchema> = {
    description: root.SearchProductDescription,
    parameters: searchProductSchema,
    generate: async function* ({ query }) {
      logger.info("Using searchProduct tool", {
        progress: "initial",
        request: { query },
      });

      const uiStream = createStreamableUI();

      let finalizedResults: ProductsResponse = { data: [] };

      uiStream.append(<ShinyText text={`Searching for ${query}`} />);

      yield uiStream.value;

      const scrapeContent = await scrapeUrl({
        url: processURLQuery(query),
        formats: ["markdown", "screenshot"],
        waitFor: 4000,
      });

      /** Handle if Scrape Operation is Error */
      if (!scrapeContent.success) {
        uiStream.done(
          <ErrorMessage
            name="Scrape Error"
            messsage={scrapeContent.error}
            raw={{ query }}
          />
        );

        return uiStream.value;
      }

      /** Handle if Scrape Operation is Success */
      if (scrapeContent.success && scrapeContent.markdown) {
        uiStream.update(
          <ShinyText
            text="Found products, proceed to data extraction..."
            speed={1}
          />
        );

        yield uiStream.value;

        const payload = JSON.stringify({
          objective: root.ExtractionOjective,
          markdown: scrapeContent.markdown,
        });

        const streamableProducts =
          createStreamableValue<DeepPartial<Product[]>>();

        uiStream.update(
          <StreamProductsContainer
            query={query}
            screenshot={scrapeContent.screenshot}
            products={streamableProducts.value}
          />
        );

        const { partialObjectStream } = streamObject({
          model: google("gemini-2.0-flash-exp"),
          system: SYSTEM_INSTRUCT_PRODUCTS,
          prompt: payload,
          schema: productsSchema,
          onFinish: async ({ object }) => {
            if (object) {
              finalizedResults = {
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

        uiStream.update(
          <ProductsContainer
            content={{
              success: true,
              name: "searchProduct",
              args: { query },
              data: finalizedResults,
            }}
            isFinished={true}
          />
        );

        const streamableText = createStreamableValue<string>("");

        uiStream.append(
          <StreamAssistantMessage content={streamableText.value} />
        );

        yield uiStream.value;

        let finalizedText: string = "";

        const { textStream } = streamText({
          model: groq("llama-3.2-90b-vision-preview"),
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

        uiStream.done();

        logger.info("Done using searchProduct tool", {
          progress: "finish",
          request: { query },
        });

        return uiStream.value;
      }
    },
  };

  return toolSearchProduct;
};
