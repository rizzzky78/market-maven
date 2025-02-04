import {
  AIState,
  MutableAIState,
  RenderTool,
  StreamGeneration,
} from "@/lib/types/ai";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { z } from "zod";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ShinyText } from "@/components/maven/shining-glass";
import { retrieveKeyValue, storeKeyValue } from "@/lib/service/store";
import { ProductsComparisonResponse } from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { streamObject, streamText } from "ai";
import { v4 } from "uuid";
import SYSTEM_INSTRUCTION from "../../constant/md";
import { mutateTool } from "../mutator/mutate-tool";

type ToolProps = {
  state: MutableAIState<AIState>;
  generation: ReturnType<typeof createStreamableValue<StreamGeneration>>;
  ui: ReturnType<typeof createStreamableUI>;
};

const productsComparisonSchema = z.object({
  compare: z.array(
    z.object({
      title: z.string(),
      callId: z.string(),
    })
  ),
});

export const toolProductsComparison = ({
  ui,
  state,
  generation,
}: ToolProps) => {
  const tool: RenderTool<typeof productsComparisonSchema> = {
    description: `Compare two products based on user requested data`,
    parameters: productsComparisonSchema,
    generate: async function* ({ compare }) {
      logger.info("Using productsComparison tool");

      generation.update({
        process: "generating",
        loading: true,
      });

      ui.update(<ShinyText text="Getting given products data..." />);

      yield ui.value;

      const resulted = await Promise.all(
        compare.map((v) =>
          retrieveKeyValue<{
            productDetails: Record<string, any>;
            screenshot?: string;
            callId?: string;
          }>({ key: v.callId })
        )
      );

      ui.update(<ShinyText text="Found previous products details data" />);

      yield ui.value;

      await new Promise((resolve) => setTimeout(resolve, 3000));

      let finalizedCompare: ProductsComparisonResponse = { comparison: {} };

      const prevProductDetailsData = resulted
        .filter((v) => v !== null)
        .map((v) => v?.value);

      let isStreamDone = false;

      ui.update(<ShinyText text="Generating comparison..." />);

      yield ui.value;

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const streamableObject = createStreamableValue<Record<string, any>>();

      // append stream-ui here

      const { partialObjectStream } = streamObject({
        model: google("gemini-2.0-flash-exp"),
        system: SYSTEM_INSTRUCTION.PRODUCT_COMPARE_EXTRACTOR,
        prompt: JSON.stringify(prevProductDetailsData),
        output: "no-schema",
        onFinish: async ({ object }) => {
          const images = prevProductDetailsData.map(
            (v) => v.screenshot
          ) as string[];

          isStreamDone = true;

          finalizedCompare = {
            callId: v4(),
            productImages: images,
            comparison: object as Record<string, any>,
          };
        },
      });

      for await (const chunk of partialObjectStream) {
        finalizedCompare = {
          comparison: chunk as Record<string, any>,
        };
        streamableObject.update(finalizedCompare);
      }

      streamableObject.done();

      if (isStreamDone) {
        const stored = await storeKeyValue<ProductsComparisonResponse>({
          key: finalizedCompare.callId as string,
          metadata: {
            chatId: state.get().chatId,
            email: "",
          },
          value: finalizedCompare,
        });

        const streamableText = createStreamableValue<string>("");

        ui.append(<StreamAssistantMessage content={streamableText.value} />);

        yield ui.value;

        let finalizedText = "";

        const { textStream } = streamText({
          model: google("gemini-2.0-flash-exp"),
          system: SYSTEM_INSTRUCTION.PRODUCT_COMPARE_INSIGHT,
          prompt: JSON.stringify(stored.value.comparison),
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
          name: "productsComparison",
          args: { compare },
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

        logger.info("Done using productsComparison tool", {
          progress: "finish",
          request: { compare },
        });
      }

      return ui.value;
    },
  };

  return tool;
};
