import {
  StreamAssistantMessage,
  AssistantMessage,
} from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
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
import { toPayloadRelatedMessage } from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import {
  ProductsRecommendation,
  recommendationSchema,
} from "@/lib/agents/schema/product";
import {
  RelatedQuery,
  PartialRelated,
  relatedQuerySchema,
} from "@/lib/agents/schema/related";
import { recommendatorSchema } from "@/lib/agents/schema/tool-parameters";
import { createToolDataEntry } from "@/lib/service/store";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import { RecommendationResponse } from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { DeepPartial, streamObject, streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { v4 } from "uuid";

const toolRecommendator = ({
  generation,
  errorState,
  state,
  requestOption,
}: ToolsetProps) => {
  const recommendator: RenderTool<typeof recommendatorSchema> = {
    description: TEMPLATE.recommendator_description,
    parameters: recommendatorSchema,
    generate: async function* ({ intent, scope }) {
      const toolRequestId = v4();

      yield (
        <LoadingText text="Crafting an recommendations based on your thought..." />
      );

      logger.info("Using recommendator tool", {
        progress: "initial",
        request: { intent, scope },
      });

      generation.update({
        process: "generating",
        loading: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const finalizedRecommendator: RecommendationResponse = {
        callId: toolRequestId,
        recommendations: [],
      };

      yield <RecommendationSkeleton />;

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const streamableRecommendation = createStreamableValue<
        DeepPartial<ProductsRecommendation>
      >({ recommendations: [] });

      yield (
        <StreamRecommendationAction
          callId={toolRequestId}
          content={streamableRecommendation.value}
        />
      );

      const { partialObjectStream } = streamObject({
        model: google("gemini-2.0-flash-lite", {
          useSearchGrounding: true,
        }),
        system: await SYSTEM_INSTRUCTION.RECOMMENDATOR_EXTRACTOR,
        prompt: JSON.stringify({ intent, scope }),
        schema: recommendationSchema,
        onFinish: ({ object, usage }) => {
          logger.info("Usage - Recommendator - Step 1", { usage });

          if (object) {
            finalizedRecommendator.recommendations = object.recommendations;
          }
          streamableRecommendation.done();
        },
        onError: ({ error }) => {
          streamableRecommendation.error(error);
          errorState = {
            isError: true,
            error,
          };
        },
      });

      for await (const chunkRecommendator of partialObjectStream) {
        streamableRecommendation.update(chunkRecommendator);
      }

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

      let finalizedInsight = "";

      const { textStream } = streamText({
        model: google("gemini-2.0-flash-lite"),
        system: await SYSTEM_INSTRUCTION.RECOMMENDATOR_INSIGHT,
        prompt: JSON.stringify({
          payload: finalizedRecommendator.recommendations,
        }),
        onFinish: ({ text, usage }) => {
          logger.info("Usage - Recommendator - Step 2", { usage });

          finalizedInsight = text;
          streamableInsight.done();

          generation.done({
            process: "done",
            loading: false,
          });
        },
        onError: ({ error }) => {
          streamableInsight.error(error);
          errorState = {
            isError: true,
            error,
          };
        },
      });

      for await (const t of textStream) {
        finalizedInsight += t;
        streamableInsight.update(finalizedInsight);
      }

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

      const { toolResult, mutate } = mutateTool(state, {
        name: "recommendator",
        args: { intent, scope },
        result: finalizedRecommendator,
        overrideAssistant: {
          content: finalizedInsight,
        },
      });

      await createToolDataEntry({
        key: finalizedRecommendator.callId,
        chatId: state.get().chatId,
        owner: state.get().username,
        tool: toolResult,
      });

      logger.info("Done using recommendator tool", {
        progress: "finish",
        request: { intent, scope },
      });

      let relatedObject: RelatedQuery | null = null;

      const streamableRelated = createStreamableValue<PartialRelated>();

      if (requestOption?.onRequest?.related) {
        yield (
          <>
            {recommendatorUiNode}
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
        onFinish: async ({ object, usage }) => {
          logger.info("Usage - Recommendator - Step 3", { usage });

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
              payload: { intent, scope },
              error: errorState,
            }}
          />
        );
      }

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
