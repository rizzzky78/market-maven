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
import {
  StreamRecommendationAction,
  RecommendationAction,
} from "@/components/maven/recommendation-action";
import { RecommendationSkeleton } from "@/components/maven/recommendation-skeleton";
import {
  StreamRelatedMessage,
  RelatedMessage,
} from "@/components/maven/related-message";
import { LoadingText } from "@/components/maven/shining-glass";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
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
import { DeepPartial, Output } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { v4 } from "uuid";
import {
  commitToolResult,
  createErrorState,
  finishGeneration,
  streamOutputToValue,
  streamRelatedQuery,
  streamTextToValue,
} from "./workflow";

const toolRecommendator = ({
  generation,
  state,
  requestOption,
}: ToolsetProps) => {
  const recommendator: RenderTool<typeof recommendatorSchema> = {
    description: TEMPLATE.recommendator_description,
    inputSchema: recommendatorSchema,
    generate: async function* ({ intent, scope }) {
      const toolRequestId = v4();
      const errorState = createErrorState();

      yield (
        <LoadingText text="Crafting an recommendations based on your thought..." />
      );

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
      };

      generation.update({
        process: "stream:initial",
        loading: true,
      });

      yield <RecommendationSkeleton />;


      const streamableRecommendation = createStreamableValue<
        DeepPartial<ProductsRecommendation>
      >({ recommendations: [] });

      generation.update({
        process: "stream:generating",
        loading: true,
      });

      yield (
        <StreamRecommendationAction
          callId={toolRequestId}
          content={streamableRecommendation.value}
        />
      );

      const recommendation = await streamOutputToValue(
        streamableRecommendation,
        errorState,
        {
          model: google("gemini-2.5-flash"),
          tools: { google_search: google.tools.googleSearch({}) },
          instructions: await SYSTEM_INSTRUCTION.RECOMMENDATOR_EXTRACTOR,
          prompt: JSON.stringify({ intent, scope }),
          output: Output.object({ schema: recommendationSchema }),
          onEnd: ({ usage }) => {
            logger.info("Usage - Recommendator - Step 1", { usage });
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

      const streamableInsight = createStreamableValue("");

      yield (
        <>
          <RecommendationAction
            content={{
              success: true,
              name: "recommendator",
              args: { intent, scope },
              data: finalizedRecommendator,
            }}
          />
          <StreamAssistantMessage content={streamableInsight.value} />
        </>
      );

      const finalizedInsight = await streamTextToValue(
        streamableInsight,
        errorState,
        {
          model: google("gemini-2.5-flash"),
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

      const recommendatorUiNode = (
        <>
          <RecommendationAction
            content={{
              success: true,
              name: "recommendator",
              args: { intent, scope },
              data: finalizedRecommendator,
            }}
          />
          <AssistantMessage content={finalizedInsight} />
        </>
      );

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
        const streamableRelated = createStreamableValue<PartialRelated>();

        yield (
          <>
            {recommendatorUiNode}
            <StreamRelatedMessage content={streamableRelated.value} />
          </>
        );

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

      return (
        <>
          {recommendatorUiNode}
          {requestOption?.onRequest?.related && (
            <RelatedMessage related={relatedObject} />
          )}
        </>
      );
    },
  };

  return recommendator;
};

export { toolRecommendator };
