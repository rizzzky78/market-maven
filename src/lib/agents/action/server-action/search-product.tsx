import {
  AIState,
  MutableAIState,
  RenderTool,
  StreamGeneration,
} from "@/lib/types/ai";
import { searchProductSchema } from "../../schema/tool-parameters";
import logger from "@/lib/utility/logger";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import { StreamProductsContainer } from "@/components/maven/exp-stream-products-container";
import { ProductsContainer } from "@/components/maven/product-search";
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
import { storeKeyValue } from "@/lib/service/store";
import { v4 } from "uuid";

type ToolProps = {
  state: MutableAIState<AIState>;
  generation: ReturnType<typeof createStreamableValue<StreamGeneration>>;
  ui: ReturnType<typeof createStreamableUI>;
};

export const toolSearchProduct = ({ state, generation, ui }: ToolProps) => {
  const tool: RenderTool<typeof searchProductSchema> = {
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

      ui.update(<ShinyText text={`Searching for ${query}`} />);

      yield ui.value;

      let finalizedResults: ProductsResponse = { data: [] };

      const scrapeContent = await scrapeUrl({
        url: processURLQuery(query),
        formats: ["markdown", "screenshot"],
        waitFor: 4000,
      });

      /** Handle if Scrape Operation is Error */
      if (!scrapeContent.success) {
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
      }

      /** Handle if Scrape Operation is Success */
      if (scrapeContent.success && scrapeContent.markdown) {
        ui.update(
          <ShinyText text="Found products, proceed to data extraction..." />
        );

        yield ui.value;

        await new Promise((resolve) => setTimeout(resolve, 3000));

        const payload = JSON.stringify({
          objective: root.ExtractionOjective,
          markdown: scrapeContent.markdown,
        });

        const streamableProducts =
          createStreamableValue<DeepPartial<Product[]>>();

        ui.update(
          <StreamProductsContainer
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

          ui.update(
            <ProductsContainer
              content={{
                success: true,
                name: "searchProduct",
                args: { query },
                data: stored.value,
              }}
              isFinished={true}
            />
          );

          const streamableText = createStreamableValue<string>("");

          ui.append(<StreamAssistantMessage content={streamableText.value} />);

          yield ui.value;

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

      ui.done();

      generation.done({
        process: "done",
        loading: false,
      });

      return ui.value;
    },
  };

  return tool;
};
