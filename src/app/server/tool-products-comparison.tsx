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
import { ProductComparison } from "@/components/maven/product-comparison";
import {
  StreamRelatedMessage,
  RelatedMessage,
} from "@/components/maven/related-message";
import { LoadingText } from "@/components/maven/shining-glass";
import { StreamProductComparison } from "@/components/maven/stream-product-comparison";
import { toPayloadRelatedMessage } from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { COMPARISON_EXTRACTOR_SYSTEM_INSTRUCTION } from "@/lib/agents/constant/md/comparison-extractor";
import { COMPARISON_INSIGHT_SYSTEM_INSTRUCTION } from "@/lib/agents/constant/md/comparison-insight";
import { COMPARISON_TABLE_CRAFTER_SYSTEM_INSTRUCTION } from "@/lib/agents/constant/md/comparison-table";
import {
  RelatedQuery,
  PartialRelated,
  relatedQuerySchema,
} from "@/lib/agents/schema/related";
import { productsComparionSchema } from "@/lib/agents/schema/tool-parameters";
import {
  getObjectEntry,
  createToolDataEntry,
  createObjectEntry,
} from "@/lib/service/store";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import { ComparisonData, ProductDetails } from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { streamText, streamObject } from "ai";
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
      const toolRequestId = v4();

      logger.info("Using productsComparison tool");

      generation.update({
        process: "tool:initial",
        loading: true,
      });

      const finalizedToolData = {
        args: { compare },
        data: {
          callId: toolRequestId,
          object: {
            userIntent: userMessage?.text_input,
            comparison: {},
            markdownTable: "",
          },
        } as ComparisonData,
      };

      yield <LoadingText text="Getting given products data..." />;

      const resulted = await Promise.all(
        compare.map((v) => getObjectEntry<ProductDetails>(v.callId))
      );

      const previousProductsData = resulted.filter((v) => v !== null);

      if (previousProductsData.length === 0) {
        const getKeys = compare.map((v) => v.callId).join(", ");

        errorState = {
          isError: true,
          error: `Error cannot access data with keys: [${getKeys}]`,
        };

        generation.done({
          process: "database:not-found",
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

      yield <LoadingText text="Generating comparison..." />;

      const comparisonPayload = previousProductsData.map(
        (data) => data.object.object
      );

      generation.update({
        process: "stream:initial",
        loading: true,
      });

      const streamableComparison = createStreamableValue<Record<string, any>>(
        {}
      );

      const streamableTable = createStreamableValue("");

      yield (
        <StreamProductComparison
          content={streamableComparison.value}
          table={streamableTable.value}
          stage={"object"}
          data={{
            compare,
            userIntent: userMessage?.text_input,
          }}
        />
      );

      // stream-ui here

      let comparisonObj: Record<string, any> = {};

      const { partialObjectStream } = streamObject({
        model: google("gemini-2.0-flash"),
        system: COMPARISON_EXTRACTOR_SYSTEM_INSTRUCTION,
        output: "no-schema",
        prompt: JSON.stringify({ payload: comparisonPayload }),
        onFinish: ({ object }) => {
          finalizedToolData.data.object.comparison = object as Record<
            string,
            any
          >;

          comparisonObj = object as Record<string, any>;

          streamableComparison.done();

          generation.update({
            process: "stream:partial-done",
            loading: true,
          });
        },
        onError: ({ error }) => {
          streamableComparison.error(error);
          streamableTable.error(error);

          errorState = {
            isError: true,
            error,
          };

          generation.update({
            process: "stream:error",
            loading: true,
          });
        },
      });

      for await (const chunk of partialObjectStream) {
        streamableComparison.update(chunk as Record<string, any>);
      }

      generation.update({
        process: "stream:next-action",
        loading: true,
      });

      const mockStreamableComparison = createStreamableValue<
        Record<string, any>
      >({});

      yield (
        <StreamProductComparison
          content={mockStreamableComparison.value}
          table={streamableTable.value}
          completedObject={comparisonObj}
          stage={"table"}
          data={{
            compare,
            userIntent: userMessage?.text_input,
          }}
        />
      );

      let tableMarkdown = "";

      const comparisonTable = streamText({
        model: google("gemini-2.0-flash"),
        system: COMPARISON_TABLE_CRAFTER_SYSTEM_INSTRUCTION,
        prompt: JSON.stringify({ payload: finalizedToolData.data }),
        onFinish: ({ text }) => {
          tableMarkdown = text;

          mockStreamableComparison.done();
          streamableTable.done();

          finalizedToolData.data.object.markdownTable = text;

          generation.update({
            process: "stream:success",
            loading: true,
          });
        },
        onError: ({ error }) => {
          mockStreamableComparison.error(error);
          streamableTable.error(error);

          errorState = {
            isError: true,
            error,
          };

          generation.update({
            process: "stream:error",
            loading: true,
          });
        },
      });

      for await (const tables of comparisonTable.textStream) {
        tableMarkdown += tables;
        streamableTable.update(tableMarkdown);
      }

      const streamableInsight = createStreamableValue<string>("");

      yield (
        <>
          <ProductComparison
            content={{
              success: true,
              name: "productComparison",
              args: finalizedToolData.args,
              data: finalizedToolData.data,
            }}
          />
          <StreamAssistantMessage content={streamableInsight.value} />
        </>
      );

      const insightPayload = {
        userIntent: userMessage?.text_input,
        dataset: comparisonObj || finalizedToolData.data.object.comparison,
      };

      let insightText = "";

      const comparisonInsight = streamText({
        model: google("gemini-2.0-flash"),
        system: COMPARISON_INSIGHT_SYSTEM_INSTRUCTION,
        prompt: JSON.stringify(insightPayload),
        onFinish: ({ text }) => {
          insightText = text;

          streamableInsight.done();

          generation.update({
            process: "stream:partial-done",
            loading: true,
          });
        },
        onError: ({ error }) => {
          streamableInsight.error(error);

          errorState = {
            isError: true,
            error,
          };

          generation.update({
            process: "stream:error",
            loading: true,
          });
        },
      });

      for await (const texts of comparisonInsight.textStream) {
        insightText += texts;
        streamableInsight.update(insightText);
      }

      await createObjectEntry({
        key: finalizedToolData.data.callId,
        chatId: state.get().chatId,
        owner: state.get().username,
        type: "productsComparison",
        object: finalizedToolData.data,
      });

      const productsComparisonUiNode = (
        <>
          <ProductComparison
            content={{
              success: true,
              name: "productsComparison",
              args: finalizedToolData.args,
              data: finalizedToolData.data,
            }}
          />
          <AssistantMessage content={insightText} />
        </>
      );

      const { toolResult, mutate } = mutateTool(state, {
        name: "productsComparison",
        args: finalizedToolData.args,
        result: finalizedToolData.data,
        overrideAssistant: {
          content: insightText,
        },
      });

      await createToolDataEntry({
        key: finalizedToolData.data.callId,
        chatId: state.get().chatId,
        owner: state.get().username,
        tool: toolResult,
      });

      generation.update({
        process: "database:save-state",
        loading: true,
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
            {productsComparisonUiNode}
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
            logger.info("Usage - Products Comparison - Step 3", {
              usage,
            });

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
              payload: { compare },
              error: errorState,
            }}
          />
        );
      }

      generation.done({
        process: "stream:done",
        loading: false,
      });

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
