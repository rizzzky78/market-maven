/**
 *
 * CODED BY HUMAN BEING :)
 *
 *
 */

import { models } from "@/lib/agents/models";
import { groundingPolicy } from "@/lib/agents/constant/md/grounding";
import { TEMPLATE } from "@/lib/agents/constant";
import { COMPARISON_EXTRACTOR_SYSTEM_INSTRUCTION } from "@/lib/agents/constant/md/comparison-extractor";
import { COMPARISON_INSIGHT_SYSTEM_INSTRUCTION } from "@/lib/agents/constant/md/comparison-insight";
import { COMPARISON_TABLE_CRAFTER_SYSTEM_INSTRUCTION } from "@/lib/agents/constant/md/comparison-table";
import { RelatedQuery, PartialRelated } from "@/lib/agents/schema/related";
import { productsComparionSchema } from "@/lib/agents/schema/tool-parameters";
import { getObjectEntry, createObjectEntry } from "@/lib/service/store";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import { ComparisonData, ProductDetails } from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { Output, smoothStream } from "ai";
import { v4 } from "uuid";
import {
  commitToolResult,
  createErrorState,
  finishGeneration,
  streamOutputToValue,
  streamRelatedQuery,
  streamTextToValue,
} from "./workflow";
import { ui } from "./stream-ui";

const toolProductComparison = ({
  generation,
  state,
  requestOption,
  userMessage,
  createStreamable,
  abortSignal,
}: ToolsetProps) => {
  const productsComparison: RenderTool<typeof productsComparionSchema> = {
    description: TEMPLATE.products_comparison_description,
    inputSchema: productsComparionSchema,
    generate: async function* ({ compare }) {
      const toolRequestId = v4();
      const errorState = createErrorState();

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

      yield ui("LoadingText", { text: "Getting given products data..." });

      const resulted = await Promise.all(
        compare.map((v) => getObjectEntry<ProductDetails>(v.callId))
      );

      const previousProductsData = resulted.filter((v) => v !== null);

      // Comparing fewer products than requested would present a one-sided
      // "comparison" as if it were evidence, so every product must resolve.
      if (compare.length < 2 || previousProductsData.length < compare.length) {
        const getKeys = compare
          .filter((_, i) => !resulted[i])
          .map((v) => `${v.title} (${v.callId})`)
          .join(", ");

        generation.done({
          process: "database:not-found",
          loading: false,
          error: `Error cannot access data with keys: [${getKeys}]`,
        });

        return ui("ErrorMessage", {
          errorName: "Product Data Not Found",
          reason:
            "Comparison needs the details of both products. Open each product's details first, then compare them again.",
          raw: {
            payload: { compare },
            resulted: null,
          },
        });
      }

      yield ui("LoadingText", { text: "Found previous products data" });

      yield ui("LoadingText", { text: "Generating comparison..." });

      const comparisonPayload = previousProductsData.map(
        (data) => data.object.object
      );

      generation.update({
        process: "stream:initial",
        loading: true,
      });

      const streamableComparison = createStreamable<Record<string, any>>({});

      yield ui("StreamProductComparison", {
        content: streamableComparison.value,
        data: {
          compare,
          userIntent: userMessage?.text_input,
        },
      });

      const comparison = await streamOutputToValue(
        streamableComparison,
        errorState,
        {
          model: models.extract,
          abortSignal,
          instructions: COMPARISON_EXTRACTOR_SYSTEM_INSTRUCTION + groundingPolicy(),
          output: Output.json(),
          prompt: JSON.stringify({ payload: comparisonPayload }),
          select: (partial) => partial as Record<string, any>,
        }
      );

      finalizedToolData.data.object.comparison = comparison as Record<
        string,
        any
      >;

      generation.update({
        process: "stream:partial-done",
        loading: true,
      });

      generation.update({
        process: "stream:next-action",
        loading: true,
      });

      const streamableTable = createStreamable("");

      yield ui("StreamExtendedMessage", {
        title: "Crafting comparison table...",
        content: streamableTable.value,
      });

      finalizedToolData.data.object.markdownTable = await streamTextToValue(
        streamableTable,
        errorState,
        {
          model: models.extract,
          abortSignal,
          instructions:
            COMPARISON_TABLE_CRAFTER_SYSTEM_INSTRUCTION + groundingPolicy(),
          prompt: JSON.stringify({ payload: finalizedToolData.data }),
        }
      );

      generation.update({
        process: "stream:success",
        loading: true,
      });

      const streamableInsight = createStreamable<string>("");

      yield [
        ui("ProductComparison", {
          content: {
            success: true,
            name: "productComparison",
            args: finalizedToolData.args,
            data: finalizedToolData.data,
          },
        }),
        ui("StreamAssistantMessage", { content: streamableInsight.value }),
      ];

      const insightPayload = {
        userIntent: userMessage?.text_input,
        dataset: comparison ?? finalizedToolData.data.object.comparison,
      };

      const insightText = await streamTextToValue(
        streamableInsight,
        errorState,
        {
          model: models.reasoning,
          abortSignal,
          instructions: COMPARISON_INSIGHT_SYSTEM_INSTRUCTION + groundingPolicy(),
          prompt: JSON.stringify(insightPayload),
          experimental_transform: smoothStream({
            delayInMs: 20,
            chunking: "word",
          }),
        }
      );

      generation.update({
        process: "stream:partial-done",
        loading: true,
      });

      await createObjectEntry({
        key: finalizedToolData.data.callId,
        chatId: state.get().chatId,
        owner: state.get().username,
        type: "productsComparison",
        object: finalizedToolData.data,
      });

      const productsComparisonUiNode = [
        ui("ProductComparison", {
          content: {
            success: true,
            name: "productsComparison",
            args: finalizedToolData.args,
            data: finalizedToolData.data,
          },
        }),
        ui("AssistantMessage", { content: insightText }),
      ];

      const mutate = await commitToolResult(
        state,
        generation,
        finalizedToolData.data.callId,
        {
          name: "productsComparison",
          args: finalizedToolData.args,
          result: finalizedToolData.data,
          overrideAssistant: {
            content: insightText,
          },
        }
      );

      let relatedObject: RelatedQuery | null = null;

      if (requestOption?.onRequest?.related) {
        generation.update({
          process: "stream:next-action",
          loading: true,
        });

        const streamableRelated = createStreamable<PartialRelated>();

        yield [
          productsComparisonUiNode,
          ui("StreamRelatedMessage", { content: streamableRelated.value }),
        ];

        relatedObject = await streamRelatedQuery(
          streamableRelated,
          errorState,
          [...state.get().messages, ...mutate],
          "Products Comparison - Step 3",
          models.light
        );
      }

      const failure = finishGeneration(generation, errorState, { compare });
      if (failure) return failure;

      return [
        productsComparisonUiNode,
        requestOption?.onRequest?.related &&
          ui("RelatedMessage", { related: relatedObject }),
      ];
    },
  };

  return productsComparison;
};

export { toolProductComparison };
