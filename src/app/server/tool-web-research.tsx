import { models } from "@/lib/agents/models";
import {
  StreamAssistantMessage,
  AssistantMessage,
} from "@/components/maven/assistant-message";
import {
  StreamRelatedMessage,
  RelatedMessage,
} from "@/components/maven/related-message";
import { LoadingText } from "@/components/maven/shining-glass";
import { TEMPLATE } from "@/lib/agents/constant";
import { WEB_RESEARCH_SYSTEM_INSTRUCTION } from "@/lib/agents/constant/md/web-research";
import { groundingPolicy } from "@/lib/agents/constant/md/grounding";
import { RelatedQuery, PartialRelated } from "@/lib/agents/schema/related";
import { webResearchSchema } from "@/lib/agents/schema/tool-parameters";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { createStreamableValue } from "@ai-sdk/rsc";
import { v4 } from "uuid";
import {
  commitToolResult,
  createErrorState,
  finishGeneration,
  streamRelatedQuery,
  streamTextToValue,
} from "./workflow";

/** Markdown list of the unique web sources the answer was grounded on. */
const formatSources = (sources: { url: string; title?: string }[]) => {
  const unique = [...new Map(sources.map((s) => [s.url, s])).values()];
  if (unique.length === 0) return "";

  return (
    "\n\n---\n\n**Sources**\n\n" +
    unique
      .map((s, i) => `${i + 1}. [${s.title || s.url}](${s.url})`)
      .join("\n")
  );
};

/**
 * Answers factual product questions with Google Search grounding and appends
 * the sources the answer is based on.
 */
const toolWebResearch = ({
  generation,
  state,
  requestOption,
}: ToolsetProps) => {
  const webResearch: RenderTool<typeof webResearchSchema> = {
    description: TEMPLATE.web_research_description,
    inputSchema: webResearchSchema,
    generate: async function* ({ question, products }) {
      const callId = v4();
      const errorState = createErrorState();

      logger.info("Using webResearch tool", { request: { question, products } });

      generation.update({ process: "tool:initial", loading: true });

      yield <LoadingText text="Researching the web for evidence..." />;

      const streamableAnswer = createStreamableValue("");
      const sources: { url: string; title?: string }[] = [];

      generation.update({ process: "stream:generating", loading: true });

      yield <StreamAssistantMessage content={streamableAnswer.value} />;

      const answer = await streamTextToValue(streamableAnswer, errorState, {
        model: models.reasoning,
        tools: { google_search: google.tools.googleSearch({}) },
        instructions: WEB_RESEARCH_SYSTEM_INSTRUCTION + groundingPolicy(),
        prompt: JSON.stringify({ question, products }),
        onEnd: ({ usage, sources: found }) => {
          for (const s of found) {
            if (s.sourceType === "url") sources.push({ url: s.url, title: s.title });
          }
          logger.info("Usage - Web Research", { usage, sources: found.length });
        },
      });

      const content = answer
        ? answer +
          (sources.length
            ? formatSources(sources)
            : "\n\n_No web sources were returned for this answer, so treat it as unverified._")
        : "";

      const uiNode = <AssistantMessage content={content} />;

      const mutate = await commitToolResult(state, generation, callId, {
        name: "webResearch",
        args: { question, products },
        result: { callId, sources },
        overrideAssistant: { content },
      });

      let relatedObject: RelatedQuery | null = null;

      if (requestOption?.onRequest?.related) {
        const streamableRelated = createStreamableValue<PartialRelated>();

        yield (
          <>
            {uiNode}
            <StreamRelatedMessage content={streamableRelated.value} />
          </>
        );

        relatedObject = await streamRelatedQuery(
          streamableRelated,
          errorState,
          [...state.get().messages, ...mutate],
          "Web Research - Related"
        );
      }

      const failure = finishGeneration(generation, errorState, { question });
      if (failure) return failure;

      return (
        <>
          {uiNode}
          {requestOption?.onRequest?.related && (
            <RelatedMessage related={relatedObject} />
          )}
        </>
      );
    },
  };

  return webResearch;
};

export { toolWebResearch };
