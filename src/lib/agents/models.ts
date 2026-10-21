import logger from "@/lib/utility/logger";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  createGateway,
  defaultSettingsMiddleware,
  isStepCount,
  LanguageModel,
  LanguageModelMiddleware,
  StopCondition,
  tool,
  ToolSet,
  wrapLanguageModel,
} from "ai";
import { z } from "zod";
import { isAllowedBaseURL, ModelConfig, PROVIDERS } from "./providers";
import { externalTavilySearch } from "./tools/api/tavily";

const REASONING_MODEL = process.env.MAVEN_REASONING_MODEL || "gemini-2.5-flash";
const LIGHT_MODEL = process.env.MAVEN_LIGHT_MODEL || "gemini-2.5-flash-lite";

type StreamResult = Awaited<
  ReturnType<
    Parameters<NonNullable<LanguageModelMiddleware["wrapStream"]>>[0]["doStream"]
  >
>;
type StreamPart =
  StreamResult["stream"] extends ReadableStream<infer P> ? P : never;

const INTERRUPTED_NOTICE =
  "\n\n_The connection to the AI service dropped while answering, so this reply may be incomplete. Please ask again._";

/**
 * Turns a failure in the middle of a model stream into a normal ending.
 *
 * An `error` part or a broken stream would otherwise end the orchestrator's
 * reply with an error. This ends the stream instead: with a short notice when
 * the model was writing text, or silently when a tool call already went out
 * (the tool keeps rendering). Tool input parts are dropped: only the complete
 * `tool-call` part runs a tool, and a partial call that never completes must
 * not count as one.
 */
export const recoverStreamErrors: LanguageModelMiddleware = {
  wrapStream: async ({ doStream }) => {
    const { stream, ...rest } = await doStream();
    const reader = stream.getReader();
    let toolCalled = false;

    const end = (
      controller: ReadableStreamDefaultController<StreamPart>,
      error: unknown
    ) => {
      logger.error("Model stream interrupted", { error });
      reader.cancel().catch(() => {});

      if (!toolCalled) {
        controller.enqueue({ type: "text-start", id: "interrupted" });
        controller.enqueue({
          type: "text-delta",
          id: "interrupted",
          delta: INTERRUPTED_NOTICE,
        });
        controller.enqueue({ type: "text-end", id: "interrupted" });
      }

      controller.enqueue({
        type: "finish",
        finishReason: { unified: "error", raw: undefined },
        usage: {
          inputTokens: {
            total: undefined,
            noCache: undefined,
            cacheRead: undefined,
            cacheWrite: undefined,
          },
          outputTokens: { total: undefined, text: undefined, reasoning: undefined },
        },
      });
      controller.close();
    };

    return {
      ...rest,
      stream: new ReadableStream<StreamPart>({
        async pull(controller) {
          try {
            // Loop past dropped parts: a pull that enqueues nothing is never
            // called again, which would stall the stream.
            while (true) {
              const { done, value } = await reader.read();
              if (done) return controller.close();

              if (value.type === "error") return end(controller, value.error);
              if (value.type.startsWith("tool-input-")) continue;
              if (value.type === "tool-call") toolCalled = true;

              return controller.enqueue(value);
            }
          } catch (error) {
            end(controller, error);
          }
        },
        cancel(reason) {
          return reader.cancel(reason);
        },
      }),
    };
  },
};

/** A web page a grounded answer was based on. */
export type WebSource = { url: string; title?: string };

/**
 * Web search for grounded steps, spread into `streamText` / `generateText`
 * options. Providers with built-in search (Google, OpenAI, Anthropic) use it
 * and report sources on the result; others get a Tavily-backed `web_search`
 * tool that needs extra steps and collects its pages in `sources`.
 */
export type WebSearch = {
  tools: ToolSet;
  stopWhen?: StopCondition<ToolSet>;
  /** Pages found by the Tavily tool; merge with the result's `sources` */
  sources: WebSource[];
};

/**
 * Model tiers used across the agent pipeline. Pick by the job, not by habit:
 *
 * - `orchestrator`: `reasoning` plus stream-error recovery for the chat reply.
 * - `reasoning`: routing, research and user-facing analysis (thinking on).
 * - `extract`: same model with thinking off (on Gemini), for turning scraped
 *   pages or search results into JSON/tables. The answer is in the input, so
 *   thinking only adds latency and cost.
 * - `light`: small follow-ups (related queries, inquiry options, chat title).
 * - `webSearch()`: a fresh search toolset per call.
 * - `custom`: true when the models run on the user's own key.
 */
export type Models = {
  orchestrator: LanguageModel;
  reasoning: LanguageModel;
  extract: LanguageModel;
  light: LanguageModel;
  webSearch: () => WebSearch;
  custom: boolean;
};

/** Search through Tavily as a regular tool, for providers without one. */
const tavilyWebSearch = (): WebSearch => {
  if (!process.env.TAVILY_API_KEY) return { tools: {}, sources: [] };

  const sources: WebSource[] = [];

  return {
    sources,
    stopWhen: isStepCount(5),
    tools: {
      web_search: tool({
        description:
          "Search the web for current, factual information. Returns page titles, URLs and excerpts to cite.",
        inputSchema: z.object({
          query: z.string().describe("A focused search query"),
        }),
        execute: async ({ query }) => {
          const { data, error } = await externalTavilySearch(true, { query });
          if (!data) return { error: error ?? "Search failed", results: [] };

          for (const r of data.results) {
            if (!sources.some((s) => s.url === r.url))
              sources.push({ url: r.url, title: r.title });
          }

          return {
            answer: data.answer ?? null,
            results: data.results.map((r) => ({
              title: r.title,
              url: r.url,
              content: r.content,
              publishedDate: r.publishedDate,
            })),
          };
        },
      }),
    },
  };
};

const thinkingOff = defaultSettingsMiddleware({
  settings: {
    providerOptions: {
      google: { thinkingConfig: { thinkingBudget: 0 } },
    },
  },
});

const buildModels = (
  reasoning: LanguageModel,
  light: LanguageModel,
  webSearch: () => WebSearch,
  custom: boolean
): Models => ({
  orchestrator: wrapLanguageModel({
    model: reasoning as Parameters<typeof wrapLanguageModel>[0]["model"],
    middleware: recoverStreamErrors,
  }),
  reasoning,
  // Provider options for other providers are ignored, so this is a no-op off Gemini.
  extract: wrapLanguageModel({
    model: reasoning as Parameters<typeof wrapLanguageModel>[0]["model"],
    middleware: thinkingOff,
  }),
  light,
  webSearch,
  custom,
});

/** The app's own models: Gemini with the server's key. */
export const defaultModels: Models = buildModels(
  google(REASONING_MODEL),
  google(LIGHT_MODEL),
  () => ({ tools: { google_search: google.tools.googleSearch({}) }, sources: [] }),
  false
);

/**
 * Models for one request: the user's own provider, key and model ids, or the
 * app's defaults when they have none. Throws on a disallowed custom base URL.
 */
export function createModels(config?: ModelConfig): Models {
  if (!config) return defaultModels;

  const { provider, apiKey, model, lightModel = model } = config;
  const preset = PROVIDERS[provider];

  switch (preset.kind) {
    case "google": {
      const p = createGoogleGenerativeAI({ apiKey });
      return buildModels(
        p(model),
        p(lightModel),
        () => ({ tools: { google_search: p.tools.googleSearch({}) }, sources: [] }),
        true
      );
    }
    case "openai": {
      const p = createOpenAI({ apiKey });
      return buildModels(
        p(model),
        p(lightModel),
        () => ({ tools: { web_search: p.tools.webSearch({}) }, sources: [] }),
        true
      );
    }
    case "anthropic": {
      const p = createAnthropic({ apiKey });
      return buildModels(
        p(model),
        p(lightModel),
        () => ({
          tools: { web_search: p.tools.webSearch_20250305({ maxUses: 5 }) },
          sources: [],
        }),
        true
      );
    }
    case "gateway": {
      const p = createGateway({ apiKey });
      return buildModels(p(model), p(lightModel), tavilyWebSearch, true);
    }
    case "openai-compatible": {
      const baseURL =
        "baseURL" in preset ? preset.baseURL : (config.baseURL ?? "");

      if (
        !isAllowedBaseURL(
          baseURL,
          process.env.MAVEN_ALLOW_PRIVATE_BASE_URL === "true"
        )
      ) {
        throw new Error("This base URL is not allowed");
      }

      const p = createOpenAICompatible({
        name: provider,
        baseURL,
        apiKey,
        supportsStructuredOutputs: preset.structuredOutputs,
      });
      return buildModels(p(model), p(lightModel), tavilyWebSearch, true);
    }
  }
}
