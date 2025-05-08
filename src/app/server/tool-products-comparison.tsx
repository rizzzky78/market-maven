import {
  StreamAssistantMessage,
  AssistantMessage,
} from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import { ProductComparison } from "@/components/maven/product-comparison";
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
import { productsComparionSchema } from "@/lib/agents/schema/tool-parameters";
import { getObjectEntry, createToolDataEntry } from "@/lib/service/store";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import {
  ProductDetailsResponse,
  ProductsComparisonResponse,
} from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { generateObject, streamText, streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { v4 } from "uuid";

const toolProductComparison = ({
  generation,
  errorState,
  state,
  requestOption,
  userMessage,
}: ToolsetProps) => {
  const productsComparison: RenderTool<typeof productsComparionSchema> = {
    description: TEMPLATE.products_comparison_description,
    parameters: productsComparionSchema,
    generate: async function* ({ compare }) {
      logger.info("Using productsComparison tool");

      generation.update({
        process: "generating",
        loading: true,
      });

      yield <LoadingText text="Getting given products data..." />;

      const resulted = await Promise.all(
        compare.map((v) => getObjectEntry<ProductDetailsResponse>(v.callId))
      );

      const previousProductsData = resulted.filter((v) => v !== null);

      if (previousProductsData.length === 0) {
        const getKeys = compare.map((v) => v.callId).join(", ");

        generation.done({
          process: "database_error",
          loading: false,
          error: `Error cannot access data with keys: [${getKeys}]`,
        });

        return (
          <ErrorMessage
            errorName="Database Error"
            reason="There was an error while getting the content from the database."
            raw={{
              payload: { compare },
              resulted: null,
            }}
          />
        );
      }

      yield <LoadingText text="Found previous products data" />;

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const finalizedCompare: ProductsComparisonResponse = {
        callId: v4(),
        productImages: previousProductsData.map((v) => v.object.screenshot),
        comparison: {},
      };

      yield <LoadingText text="Generating comparison..." />;

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const payloadPrevProductsData = previousProductsData.map(
        (v) => v.object.productDetails
      );

      /**
       * Change to static/non-streamed component instead
       * has error when parsing undefined/null object :(
       */
      yield (
        <ProductComparison
          skeleton
          content={{
            success: true,
            name: "productsComparison",
            args: { compare },
            data: finalizedCompare,
          }}
        />
      );

      const comparisonObjResult = await generateObject({
        model: google("gemini-2.0-flash-lite"),
        system: await SYSTEM_INSTRUCTION.PRODUCT_COMPARE_EXTRACTOR,
        prompt: JSON.stringify(payloadPrevProductsData),
        output: "no-schema",
      });

      const comparisonData = comparisonObjResult.object as Record<string, any>;

      finalizedCompare.comparison = comparisonData;

      const streamableText = createStreamableValue<string>("");

      yield (
        <>
          <ProductComparison
            content={{
              success: true,
              name: "productsComparison",
              args: { compare },
              data: {
                ...finalizedCompare,
                comparison: comparisonData,
              },
            }}
          />
          <StreamAssistantMessage content={streamableText.value} />
        </>
      );

      const payloadComparisonInsight = {
        prompt: userMessage?.text_input ?? "no-instructions-from-user",
        data: finalizedCompare.comparison,
      };

      let finalizedText = "";

      const { textStream } = streamText({
        model: google("gemini-2.0-flash-lite"),
        system: await SYSTEM_INSTRUCTION.PRODUCT_COMPARE_INSIGHT,
        prompt: JSON.stringify(payloadComparisonInsight),
        onFinish: async ({ text }) => {
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

      const productsComparisonUiNode = (
        <>
          <ProductComparison
            content={{
              success: true,
              name: "productsComparison",
              args: { compare },
              data: {
                ...finalizedCompare,
                comparison: comparisonData,
              },
            }}
          />
          <AssistantMessage content={finalizedText} />
        </>
      );

      const { toolResult, mutate } = mutateTool(state, {
        name: "productsComparison",
        args: { compare },
        result: finalizedCompare,
        overrideAssistant: {
          content: finalizedText,
        },
      });

      await createToolDataEntry({
        key: finalizedCompare.callId,
        chatId: state.get().chatId,
        owner: state.get().username,
        tool: toolResult,
      });

      logger.info("Done using productsComparison tool", {
        progress: "finish",
        request: { compare },
      });

      let relatedObject: RelatedQuery | null = null;

      const streamableRelated = createStreamableValue<PartialRelated>();

      if (requestOption?.onRequest?.related) {
        yield (
          <>
            {productsComparisonUiNode}
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
        onFinish: async ({ object }) => {
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
              payload: { compare },
              error: errorState,
            }}
          />
        );
      }

      return (
        <>
          {productsComparisonUiNode}
          {requestOption?.onRequest?.related && (
            <RelatedMessage related={relatedObject} />
          )}
        </>
      );
    },
  };

  return productsComparison;
};

export { toolProductComparison };
