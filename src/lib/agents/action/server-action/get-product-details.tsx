import {
  AIState,
  MutableAIState,
  RenderTool,
  StreamGeneration,
} from "@/lib/types/ai";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { getProductDetailsSchema } from "../../schema/tool-parameters";
import { TEMPLATE } from "../../constant";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import { LoadingText } from "@/components/maven/shining-glass";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { streamObject, streamText } from "ai";
import { v4 } from "uuid";
import { scrapeUrl } from "../../tools/api/firecrawl";
import { mutateTool } from "../mutator/mutate-tool";
import { storeKeyValue } from "@/lib/service/store";
import { ProductDetailsResponse } from "@/lib/types/product";
import SYSTEM_INSTRUCTION from "../../constant/md";
import { StreamProductDetails } from "@/components/maven/product-details";

type ToolProps = {
  state: MutableAIState<AIState>;
  generation: ReturnType<typeof createStreamableValue<StreamGeneration>>;
  ui: ReturnType<typeof createStreamableUI>;
};

export const toolGetProductDetails = ({ ui, state, generation }: ToolProps) => {
  const tool: RenderTool<typeof getProductDetailsSchema> = {
    description: TEMPLATE.GetProductDetailsDescription,
    parameters: getProductDetailsSchema,
    generate: async function* ({ query, link }) {
      logger.info("Using getProductDetails tool", {
        progress: "initial",
        request: { query, link },
      });

      generation.update({
        process: "generating",
        loading: true,
      });

      ui.update(<LoadingText text={`Getting data product for ${query}`} />);

      yield ui.value;

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const scrapeResult = await scrapeUrl({
        url: link,
        formats: ["markdown", "screenshot"],
        waitFor: 4000,
      });

      /** Handle if Scrape Operation is Error */
      if (!scrapeResult.success) {
        ui.done(
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
        ui.update(
          <LoadingText text="Found product details, please hang on..." />
        );

        yield ui.value;

        await new Promise((resolve) => setTimeout(resolve, 3000));

        let finalizedObject: ProductDetailsResponse = {
          productDetails: {},
        };

        const payloadContent = JSON.stringify({
          prompt: TEMPLATE.ExtractionDetails,
          refference: { query, link },
          markdown: scrapeResult.markdown,
        });

        const streamableObject = createStreamableValue<Record<string, any>>();

        ui.update(
          <StreamProductDetails
            query={query}
            link={link}
            callId={finalizedObject.callId}
            content={streamableObject.value}
            screenshot={scrapeResult.screenshot}
          />
        );

        yield ui.value;

        let isStreamDone = false;

        const { partialObjectStream } = streamObject({
          model: google("gemini-2.0-flash-exp"),
          system: SYSTEM_INSTRUCTION.PRODUCT_DETAILS_EXTRACTOR,
          prompt: payloadContent,
          output: "no-schema",
          onFinish: async ({ object }) => {
            isStreamDone = true;
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

        if (isStreamDone) {
          const stored = await storeKeyValue<ProductDetailsResponse>({
            key: finalizedObject.callId as string,
            metadata: {
              chatId: state.get().chatId,
              email: "",
            },
            value: finalizedObject,
          });

          const streamableText = createStreamableValue<string>("");

          ui.append(<StreamAssistantMessage content={streamableText.value} />);

          yield ui.value;

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

          state.done({
            ...state.get(),
            messages: [...state.get().messages, ...mutate],
          });

          ui.done();

          logger.info("Done using getProductDetails tool", {
            progress: "finish",
            request: { query, link },
          });
        }
      }

      generation.done({
        process: "done",
        loading: false,
      });

      return ui.value;
    },
  };

  return tool;
};
