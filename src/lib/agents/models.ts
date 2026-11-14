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
import {
  MODEL_ROLES,
  type ModelRole,
  type Preferences,
  type ReasoningLevel,
} from "./ai-settings-schema";
import { preferencesInstruction } from "./preferences-instruction";
import {
  getPreset,
  isAllowedBaseURL,
  needsBaseURL,
  type ProviderId,
  resolveBaseURL,
} from "./providers";
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

type WrappableModel = Parameters<typeof wrapLanguageModel>[0]["model"];

const wrap = (model: LanguageModel, middleware: LanguageModelMiddleware) =>
  wrapLanguageModel({ model: model as WrappableModel, middleware });

/** Token usage of one model call, reported to the request's usage sink. */
export type UsageRecord = {
  role: ModelRole;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cachedTokens: number;
};

export type UsageSink = (record: UsageRecord) => void;

type CallMeta = Pick<UsageRecord, "role" | "provider" | "model">;

type ProviderUsage = Extract<StreamPart, { type: "finish" }>["usage"];

const toUsageRecord = (meta: CallMeta, usage: ProviderUsage): UsageRecord => ({
  ...meta,
  inputTokens: usage.inputTokens.total ?? 0,
  outputTokens: usage.outputTokens.total ?? 0,
  reasoningTokens: usage.outputTokens.reasoning ?? 0,
  cachedTokens: usage.inputTokens.cacheRead ?? 0,
});

/** Reports the usage of every call (generate or stream) to `sink`. */
const usageMiddleware = (meta: CallMeta, sink: UsageSink): LanguageModelMiddleware => ({
  wrapGenerate: async ({ doGenerate }) => {
    const result = await doGenerate();
    sink(toUsageRecord(meta, result.usage));
    return result;
  },
  wrapStream: async ({ doStream }) => {
    const { stream, ...rest } = await doStream();
    return {
      ...rest,
      stream: stream.pipeThrough(
        new TransformStream<StreamPart, StreamPart>({
          transform(part, controller) {
            if (part.type === "finish") sink(toUsageRecord(meta, part.usage));
            controller.enqueue(part);
          },
        })
      ),
    };
  },
});

type GenerationSettings = {
  temperature?: number | null;
  maxOutputTokens?: number | null;
  reasoning?: ReasoningLevel | null;
  /** Appended to the system prompt (user preferences) */
  instruction?: string | null;
};

/**
 * Applies the user's generation parameters as defaults (a value set by the
 * call itself wins) and appends their preferences to the system prompt.
 */
const settingsMiddleware = ({
  temperature,
  maxOutputTokens,
  reasoning,
  instruction,
}: GenerationSettings): LanguageModelMiddleware => ({
  transformParams: async ({ params }) => {
    let prompt = params.prompt;

    if (instruction) {
      let lastSystem = -1;
      while (prompt[lastSystem + 1]?.role === "system") lastSystem++;

      prompt =
        lastSystem === -1
          ? [{ role: "system", content: instruction }, ...prompt]
          : prompt.map((message, i) =>
              i === lastSystem && message.role === "system"
                ? { ...message, content: `${message.content}\n\n${instruction}` }
                : message
            );
    }

    return {
      ...params,
      prompt,
      temperature: params.temperature ?? temperature ?? undefined,
      maxOutputTokens: params.maxOutputTokens ?? maxOutputTokens ?? undefined,
      reasoning:
        params.reasoning ??
        (reasoning && reasoning !== "provider-default" ? reasoning : undefined),
    };
  },
});

/** A user connection with its decrypted key, for one request only. */
export type RuntimeConnection = {
  id: string;
  provider: ProviderId;
  apiKey: string;
  baseURL: string | null;
  structuredOutputs: boolean | null;
};

/** The connection, model and parameters a role runs on. */
export type RuntimeAssignment = {
  connectionId: string;
  model: string;
  temperature: number | null;
  maxOutputTokens: number | null;
  reasoning: ReasoningLevel | null;
};

/** Everything a request needs from the user's AI settings. */
export type AgentSettings = {
  connections: Map<string, RuntimeConnection>;
  assignments: Partial<Record<ModelRole, RuntimeAssignment>>;
  preferences: Preferences;
};

type ProviderHandle = {
  model: (id: string) => LanguageModel;
  webSearch: () => WebSearch;
};

const mavenProvider: ProviderHandle = {
  model: (id) => google(id),
  webSearch: () => ({
    tools: { google_search: google.tools.googleSearch({}) },
    sources: [],
  }),
};

/**
 * Model factory and web search of one connection. Throws on a disallowed
 * custom base URL.
 */
function connectProvider(connection: RuntimeConnection): ProviderHandle {
  const { provider, apiKey } = connection;
  const preset = getPreset(provider);
  const baseURL = resolveBaseURL(provider, connection.baseURL);

  if (needsBaseURL(provider) && (!baseURL || !isAllowedBaseURL(baseURL))) {
    throw new Error("This base URL is not allowed");
  }

  switch (preset.kind) {
    case "google": {
      const p = createGoogleGenerativeAI({ apiKey });
      return {
        model: (id) => p(id),
        webSearch: () => ({ tools: { google_search: p.tools.googleSearch({}) }, sources: [] }),
      };
    }
    case "openai": {
      const p = createOpenAI({ apiKey });
      return {
        model: (id) => p(id),
        webSearch: () => ({ tools: { web_search: p.tools.webSearch({}) }, sources: [] }),
      };
    }
    case "anthropic": {
      const p = createAnthropic({ apiKey });
      return {
        model: (id) => p(id),
        webSearch: () => ({
          tools: { web_search: p.tools.webSearch_20250305({ maxUses: 5 }) },
          sources: [],
        }),
      };
    }
    case "anthropic-compatible": {
      /** Third-party Messages APIs do not run Anthropic's server-side tools. */
      const p = createAnthropic({ apiKey, baseURL, name: provider });
      return { model: (id) => p(id), webSearch: tavilyWebSearch };
    }
    case "gateway": {
      const p = createGateway({ apiKey });
      return { model: (id) => p(id), webSearch: tavilyWebSearch };
    }
    case "openai-compatible": {
      const p = createOpenAICompatible({
        name: provider,
        baseURL: baseURL ?? "",
        apiKey,
        supportsStructuredOutputs:
          connection.structuredOutputs ?? preset.structuredOutputs ?? true,
      });
      return { model: (id) => p(id), webSearch: tavilyWebSearch };
    }
  }
}

/**
 * The models of one request, per pipeline role: the orchestrator uses
 * `forRole("default")`, each tool `forRole(<tool name>)`.
 */
export type ModelRegistry = {
  forRole: (role: Exclude<ModelRole, "light">) => Models;
  /** True when any role runs on the user's own connection */
  custom: boolean;
};

/**
 * Builds a request's models from the user's AI settings. Roles without an
 * assignment fall back to the `default` assignment, and without that to
 * Maven's own Gemini models; `light` falls back to `default` the same way.
 * Every call reports its token usage to `onUsage` when given. Throws when an
 * assigned connection uses a disallowed base URL.
 */
export function createModelRegistry({
  settings,
  onUsage,
}: {
  settings?: AgentSettings | null;
  onUsage?: UsageSink;
} = {}): ModelRegistry {
  if (!settings && !onUsage) {
    return { forRole: () => defaultModels, custom: false };
  }

  const preferences = settings?.preferences;
  const fullInstruction = preferences ? preferencesInstruction(preferences, "full") : null;
  const languageInstruction = preferences
    ? preferencesInstruction(preferences, "language")
    : null;
  const handles = new Map<string, ProviderHandle>();

  const handleFor = (connection: RuntimeConnection) => {
    let handle = handles.get(connection.id);
    if (!handle) {
      handle = connectProvider(connection);
      handles.set(connection.id, handle);
    }
    return handle;
  };

  const assignmentFor = (role: ModelRole) => {
    const assignment = settings?.assignments[role] ?? settings?.assignments.default;
    const connection = assignment && settings?.connections.get(assignment.connectionId);
    return assignment && connection ? { assignment, connection } : null;
  };

  /** Raw model of a role, with usage reporting. */
  const resolve = (role: ModelRole, mavenModel: string) => {
    const found = assignmentFor(role);
    const handle = found ? handleFor(found.connection) : mavenProvider;
    const modelId = found ? found.assignment.model : mavenModel;
    const raw = handle.model(modelId);
    const meta: CallMeta = {
      role,
      provider: found ? found.connection.provider : "maven",
      model: modelId,
    };

    return {
      handle,
      assignment: found?.assignment ?? null,
      model: onUsage ? wrap(raw, usageMiddleware(meta, onUsage)) : raw,
    };
  };

  const lightResolved = resolve("light", LIGHT_MODEL);
  const light = wrap(
    lightResolved.model,
    settingsMiddleware({ ...lightResolved.assignment, instruction: languageInstruction })
  );

  const cache = new Map<ModelRole, Models>();

  const forRole: ModelRegistry["forRole"] = (role) => {
    const cached = cache.get(role);
    if (cached) return cached;

    const { handle, assignment, model } = resolve(role, REASONING_MODEL);
    const reasoning = wrap(
      model,
      settingsMiddleware({ ...assignment, instruction: fullInstruction })
    );
    /** Extraction keeps the sampling parameters but neither reasoning nor preferences. */
    const extract = wrap(
      wrap(
        model,
        settingsMiddleware({
          temperature: assignment?.temperature,
          maxOutputTokens: assignment?.maxOutputTokens,
        })
      ),
      thinkingOff
    );

    const models: Models = {
      orchestrator: wrap(reasoning, recoverStreamErrors),
      reasoning,
      extract,
      light,
      webSearch: handle.webSearch,
      custom: !!assignment,
    };

    cache.set(role, models);
    return models;
  };

  /** Built up front so a connection that cannot be used fails the request early. */
  for (const role of MODEL_ROLES) if (role !== "light") forRole(role);

  return {
    forRole,
    custom: MODEL_ROLES.some((role) => !!assignmentFor(role)),
  };
}

/** The app's own models: Gemini with the server's key. */
export const defaultModels: Models = {
  orchestrator: wrap(google(REASONING_MODEL), recoverStreamErrors),
  reasoning: google(REASONING_MODEL),
  /** Provider options for other providers are ignored, so this is a no-op off Gemini. */
  extract: wrap(google(REASONING_MODEL), thinkingOff),
  light: google(LIGHT_MODEL),
  webSearch: mavenProvider.webSearch,
  custom: false,
};
