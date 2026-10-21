/**
 *
 * CODED BY HUMAN BEING :)
 *
 *
 */

import { models } from "@/lib/agents/models";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { groundingPolicy } from "@/lib/agents/constant/md/grounding";
import { RECOMMENDATOR_RESEARCH_SYSTEM_INSTRUCTION } from "@/lib/agents/constant/md/recommendator-extractor";
import {
  ProductsRecommendation,
  recommendationSchema,
} from "@/lib/agents/schema/product";
import { RelatedQuery, PartialRelated } from "@/lib/agents/schema/related";
import { recommendatorSchema } from "@/lib/agents/schema/tool-parameters";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import { RecommendationResponse } from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { DeepPartial, generateText, Output } from "ai";
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

const toolRecommendator = ({
  generation,
  state,
  requestOption,
  createStreamable,
  abortSignal,
}: ToolsetProps) => {
  const recommendator: RenderTool<typeof recommendatorSchema> = {
    description: TEMPLATE.recommendator_description,
    inputSchema: recommendatorSchema,
    generate: async function* ({ intent, scope }) {
      const toolRequestId = v4();
      const errorState = createErrorState();

      yield ui("LoadingText", {
        text: "Crafting an recommendations based on your thought...",
      });

      logger.info("Using recommendator tool", {
        progress: "initial",
        request: { intent, scope },
      });

      generation.update({
        process: "tool:initial",
        loading: true,
      });

      const finalizedRecommendator: RecommendationResponse = {
        callId: toolRequestId,
        recommendations: [],
        sources: [],
      };

      generation.update({
        process: "stream:initial",
        loading: true,
      });

      yield [
        ui("LoadingText", {
          text: "Researching current models that fit your needs...",
        }),
        ui("RecommendationSkeleton", {}),
      ];

      // Step 1: search-grounded research. Gemini 2.x cannot combine Google
      // Search with JSON output in one call, so research and extraction are
      // separate steps; the sources come from this call.
      const research = await generateText({
        model: models.reasoning,
        abortSignal,
        tools: { google_search: google.tools.googleSearch({}) },
        instructions:
          RECOMMENDATOR_RESEARCH_SYSTEM_INSTRUCTION + groundingPolicy(),
        prompt: JSON.stringify({ intent, scope }),
      });

      for (const s of research.sources) {
        if (s.sourceType !== "url") continue;
        if (finalizedRecommendator.sources?.some((x) => x.url === s.url)) continue;
        finalizedRecommendator.sources?.push({ url: s.url, title: s.title });
      }

      logger.info("Usage - Recommendator - Step 1 (research)", {
        usage: research.usage,
        sources: finalizedRecommendator.sources?.length,
      });

      const streamableRecommendation = createStreamable<
        DeepPartial<ProductsRecommendation>
      >({ recommendations: [] });

      generation.update({
        process: "stream:generating",
        loading: true,
      });

      yield ui("StreamRecommendationAction", {
        callId: toolRequestId,
        content: streamableRecommendation.value,
      });

      // Step 2: structure the researched candidates.
      const recommendation = await streamOutputToValue(
        streamableRecommendation,
        errorState,
        {
          model: models.extract,
          abortSignal,
          instructions: await SYSTEM_INSTRUCTION.RECOMMENDATOR_EXTRACTOR,
          prompt: JSON.stringify({ intent, scope, research: research.text }),
          output: Output.object({ schema: recommendationSchema }),
          onEnd: ({ usage }) => {
            logger.info("Usage - Recommendator - Step 1 (extract)", { usage });
          },
        }
      );

      if (recommendation) {
        finalizedRecommendator.recommendations = recommendation.recommendations;
      }

      generation.update({
        process: "stream:next-action",
        loading: true,
      });

      const streamableInsight = createStreamable("");

      const recommendationNode = ui("RecommendationAction", {
        content: {
          success: true,
          name: "recommendator",
          args: { intent, scope },
          data: finalizedRecommendator,
        },
      });

      yield [
        recommendationNode,
        ui("StreamAssistantMessage", { content: streamableInsight.value }),
      ];

      const finalizedInsight = await streamTextToValue(
        streamableInsight,
        errorState,
        {
          model: models.reasoning,
          abortSignal,
          instructions: await SYSTEM_INSTRUCTION.RECOMMENDATOR_INSIGHT,
          // Without the intent the insight can only describe the list,
          // not explain why each pick fits the user's need.
          prompt: JSON.stringify({
            userIntent: intent,
            scope,
            payload: finalizedRecommendator.recommendations,
          }),
          onEnd: ({ usage }) => {
            logger.info("Usage - Recommendator - Step 2", { usage });
          },
        }
      );

      generation.update({
        process: "stream:done",
        loading: true,
      });

      const recommendatorUiNode = [
        recommendationNode,
        ui("AssistantMessage", { content: finalizedInsight }),
      ];

      const mutate = await commitToolResult(
        state,
        generation,
        finalizedRecommendator.callId,
        {
          name: "recommendator",
          args: { intent, scope },
          result: finalizedRecommendator,
          overrideAssistant: {
            content: finalizedInsight,
          },
        }
      );

      logger.info("Done using recommendator tool", {
        progress: "finish",
        request: { intent, scope },
      });

      let relatedObject: RelatedQuery | null = null;

      if (requestOption?.onRequest?.related) {
        const streamableRelated = createStreamable<PartialRelated>();

        yield [
          recommendatorUiNode,
          ui("StreamRelatedMessage", { content: streamableRelated.value }),
        ];

        relatedObject = await streamRelatedQuery(
          streamableRelated,
          errorState,
          [...state.get().messages, ...mutate],
          "Recommendator - Step 3"
        );
      }

      const failure = finishGeneration(generation, errorState, {
        intent,
        scope,
      });
      if (failure) return failure;

      return [
        recommendatorUiNode,
        requestOption?.onRequest?.related &&
          ui("RelatedMessage", { related: relatedObject }),
      ];
    },
  };

  return recommendator;
};

export { toolRecommendator };
