"use server";

import { AIState, MutableAIState, StreamGeneration } from "@/lib/types/ai";
import { CoreMessage, streamObject } from "ai";
import { toCoreMessage } from "../mutator/mutate-messages";
import SYSTEM_INSTRUCTION from "../../constant/md";
import { google } from "@ai-sdk/google";
import { PartialRelated, relatedQuerySchema } from "../../schema/related";
import { createStreamableValue } from "ai/rsc";

type RelatedRequest = {
  state: MutableAIState<AIState>;
  onRequest: {
    enable?: boolean;
  };
};

export async function generateRelatedQuery(req: RelatedRequest) {
  const { state, onRequest } = req;

  const streamableRelated = createStreamableValue<PartialRelated>();

  const payloadRelated = JSON.stringify({
    datasetConversation: toCoreMessage(state.get().messages),
  });

  let errorState: { isError: boolean; error?: unknown } = {
    isError: false,
  };

  if (onRequest.enable) {
    (async () => {
      const { partialObjectStream } = streamObject({
        model: google("gemini-2.0-pro-exp-02-05"),
        system: SYSTEM_INSTRUCTION.RELATED_QUERY_CRAFTER,
        prompt: payloadRelated,
        schema: relatedQuerySchema,
        onFinish: async ({ object }) => {
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

      for await (const chunk of partialObjectStream) {
        streamableRelated.update(chunk);
      }
    })();
  } else {
    streamableRelated.done();
  }

  return {
    useRelated: onRequest.enable ?? false,
    streamRelated: streamableRelated.value,
    error: errorState,
  };
}
