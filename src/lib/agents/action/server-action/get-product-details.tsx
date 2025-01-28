import {
  AIState,
  MutableAIState,
  RenderTool,
  StreamGeneration,
} from "@/lib/types/ai";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { getProductDetailsSchema } from "../../schema/tool-parameters";
import { root } from "../../constant";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import { StreamProductInsight } from "@/components/maven/product-insight";
import { ShinyText } from "@/components/maven/shining-glass";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { streamObject, streamText } from "ai";
import { v4 } from "uuid";
import {
  SYSTEM_INSTRUCT_EXTRACTOR,
  SYSTEM_INSTRUCT_DEFINED_INSIGHT,
} from "../../system-instructions";
import { scrapeUrl } from "../../tools/api/firecrawl";
import { mutateTool } from "../mutator/mutate-tool";

interface RenderProps {
  ui: ReturnType<typeof createStreamableUI>;
  state: MutableAIState<AIState>;
  generation: ReturnType<typeof createStreamableValue<StreamGeneration>>;
}

export const actionGetProductDetails = ({
  ui,
  state,
  generation,
}: RenderProps) => {
  const toolGetProductDetails: RenderTool<typeof getProductDetailsSchema> = {
    description: root.GetProductDetailsDescription,
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

      ui.update(<ShinyText text={`Getting data product for ${query}`} />);

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
            name="Scrape Error"
            messsage={scrapeResult.error}
            raw={{ query, link }}
          />
        );
      }

      /** Handle if Scrape Operation is Success */
      if (scrapeResult.success && scrapeResult.markdown) {
        ui.update(
          <ShinyText text="Found product details, please hang on..." />
        );

        yield ui.value;

        await new Promise((resolve) => setTimeout(resolve, 3000));

        let finalizedObject: {
          insight: Record<string, any>;
          screenshot?: string;
          callId?: string;
        } = { callId: v4(), insight: {} };

        const payloadContent = JSON.stringify({
          prompt: root.ExtractionDetails,
          refference: { query, link },
          markdown: scrapeResult.markdown,
        });

        const streamableObject = createStreamableValue<Record<string, any>>();

        ui.update(
          <StreamProductInsight
            callId={finalizedObject.callId}
            content={streamableObject.value}
            screenshot={scrapeResult.screenshot}
          />
        );

        yield ui.value;

        const { partialObjectStream } = streamObject({
          model: google("gemini-2.0-flash-exp"),
          system: SYSTEM_INSTRUCT_EXTRACTOR,
          prompt: payloadContent,
          output: "no-schema",
          onFinish: async ({ object }) => {
            finalizedObject = {
              callId: v4(),
              insight: object as Record<string, any>,
              screenshot: scrapeResult.screenshot,
            };
          },
        });

        for await (const objProduct of partialObjectStream) {
          finalizedObject = {
            insight: objProduct as Record<string, any>,
          };
          streamableObject.update(finalizedObject.insight);
        }

        streamableObject.done();

        const streamableText = createStreamableValue<string>("");

        ui.append(<StreamAssistantMessage content={streamableText.value} />);

        yield ui.value;

        let finalizedText: string = "";

        const { textStream } = streamText({
          model: google("gemini-2.0-flash-exp"),
          system: SYSTEM_INSTRUCT_DEFINED_INSIGHT,
          prompt: JSON.stringify({ data: finalizedObject.insight }),
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
          result: finalizedObject,
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

      generation.done({
        process: "done",
        loading: false,
      });

      return ui.value;
    },
  };

  return toolGetProductDetails;
};
