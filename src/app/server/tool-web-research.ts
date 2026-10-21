import { TEMPLATE } from "@/lib/agents/constant";
import { WEB_RESEARCH_SYSTEM_INSTRUCTION } from "@/lib/agents/constant/md/web-research";
import { groundingPolicy } from "@/lib/agents/constant/md/grounding";
import { RelatedQuery, PartialRelated } from "@/lib/agents/schema/related";
import { webResearchSchema } from "@/lib/agents/schema/tool-parameters";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { v4 } from "uuid";
import {
  commitToolResult,
  createErrorState,
  finishGeneration,
  streamRelatedQuery,
  streamTextToValue,
} from "./workflow";
import { ui } from "./stream-ui";

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
  createStreamable,
  abortSignal,
  models,
}: ToolsetProps) => {
  const webResearch: RenderTool<typeof webResearchSchema> = {
    description: TEMPLATE.web_research_description,
    inputSchema: webResearchSchema,
    generate: async function* ({ question, products }) {
      const callId = v4();
      const errorState = createErrorState();

      logger.info("Using webResearch tool", { request: { question, products } });

      generation.update({ process: "tool:initial", loading: true });

      yield ui("LoadingText", { text: "Researching the web for evidence..." });

      const streamableAnswer = createStreamable("");
      const sources: { url: string; title?: string }[] = [];

      generation.update({ process: "stream:generating", loading: true });

      yield ui("StreamAssistantMessage", { content: streamableAnswer.value });

      const search = models.webSearch();
      const answer = await streamTextToValue(streamableAnswer, errorState, {
        model: models.reasoning,
        abortSignal,
        tools: search.tools,
        stopWhen: search.stopWhen,
        instructions: WEB_RESEARCH_SYSTEM_INSTRUCTION + groundingPolicy(),
        prompt: JSON.stringify({ question, products }),
        onEnd: ({ usage, sources: found }) => {
          for (const s of found) {
            if (s.sourceType === "url") sources.push({ url: s.url, title: s.title });
          }
          logger.info("Usage - Web Research", { usage, sources: found.length });
        },
      });

      sources.push(...search.sources);

      const content = answer
        ? answer +
          (sources.length
            ? formatSources(sources)
            : "\n\n_No web sources were returned for this answer, so treat it as unverified._")
        : "";

      const uiNode = ui("AssistantMessage", { content });

      const mutate = await commitToolResult(state, generation, callId, {
        name: "webResearch",
        args: { question, products },
        result: { callId, sources },
        overrideAssistant: { content },
      });

      let relatedObject: RelatedQuery | null = null;

      if (requestOption?.onRequest?.related) {
        const streamableRelated = createStreamable<PartialRelated>();

        yield [
          uiNode,
          ui("StreamRelatedMessage", { content: streamableRelated.value }),
        ];

        relatedObject = await streamRelatedQuery(
          streamableRelated,
          errorState,
          [...state.get().messages, ...mutate],
          "Web Research - Related",
            models.light
        );
      }

      const failure = finishGeneration(generation, errorState, { question });
      if (failure) return failure;

      return [
        uiNode,
        requestOption?.onRequest?.related &&
          ui("RelatedMessage", { related: relatedObject }),
      ];
    },
  };

  return webResearch;
};

export { toolWebResearch };
