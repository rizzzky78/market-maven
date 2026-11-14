/**
 * LLM provider presets a user can connect with their own API key. Shared by
 * the AI settings page (labels, hints, groups) and the server (validation and
 * model setup in `models.ts`).
 *
 * Kinds:
 * - `google`, `openai`, `anthropic`, `gateway`: the official APIs, with their
 *   own web search tool where the provider has one.
 * - `openai-compatible`: any API implementing the OpenAI chat completions
 *   format (DeepSeek, Qwen, Kimi, GLM, Groq, OpenRouter, Ollama, ...).
 * - `anthropic-compatible`: any API implementing the Anthropic Messages format.
 *   `baseURL` includes the version segment (for example `.../anthropic/v1`).
 *
 * Presets without a `baseURL` that are compatible kinds are custom endpoints:
 * the user enters the base URL.
 */
export const PROVIDER_KINDS = [
  "google",
  "openai",
  "anthropic",
  "gateway",
  "openai-compatible",
  "anthropic-compatible",
] as const;

export type ProviderKind = (typeof PROVIDER_KINDS)[number];

export type ProviderGroup = "official" | "openai-compatible" | "anthropic-compatible" | "custom";

type ProviderPreset = {
  label: string;
  kind: ProviderKind;
  group: ProviderGroup;
  baseURL?: string;
  /** JSON schema outputs; `false` falls back to JSON mode (OpenAI-compatible only) */
  structuredOutputs?: boolean;
  exampleModel: string;
  exampleLightModel: string;
  keyUrl?: string;
};

export const PROVIDERS = {
  google: {
    label: "Google Gemini",
    kind: "google",
    group: "official",
    exampleModel: "gemini-2.5-flash",
    exampleLightModel: "gemini-2.5-flash-lite",
    keyUrl: "https://aistudio.google.com/app/apikey",
  },
  openai: {
    label: "OpenAI",
    kind: "openai",
    group: "official",
    exampleModel: "gpt-4.1",
    exampleLightModel: "gpt-4.1-mini",
    keyUrl: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    label: "Anthropic",
    kind: "anthropic",
    group: "official",
    exampleModel: "claude-sonnet-4-5",
    exampleLightModel: "claude-haiku-4-5",
    keyUrl: "https://console.anthropic.com/settings/keys",
  },
  gateway: {
    label: "Vercel AI Gateway",
    kind: "gateway",
    group: "official",
    exampleModel: "openai/gpt-4.1",
    exampleLightModel: "google/gemini-2.5-flash-lite",
    keyUrl: "https://vercel.com/docs/ai-gateway",
  },
  openrouter: {
    label: "OpenRouter",
    kind: "openai-compatible",
    group: "openai-compatible",
    baseURL: "https://openrouter.ai/api/v1",
    structuredOutputs: true,
    exampleModel: "openai/gpt-4.1",
    exampleLightModel: "openai/gpt-4.1-mini",
    keyUrl: "https://openrouter.ai/keys",
  },
  deepseek: {
    label: "DeepSeek",
    kind: "openai-compatible",
    group: "openai-compatible",
    baseURL: "https://api.deepseek.com/v1",
    /** DeepSeek only offers JSON mode, not JSON schema outputs. */
    structuredOutputs: false,
    exampleModel: "deepseek-chat",
    exampleLightModel: "deepseek-chat",
    keyUrl: "https://platform.deepseek.com/api_keys",
  },
  qwen: {
    label: "Qwen (Alibaba Model Studio)",
    kind: "openai-compatible",
    group: "openai-compatible",
    baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    structuredOutputs: false,
    exampleModel: "qwen-plus",
    exampleLightModel: "qwen-turbo",
    keyUrl: "https://modelstudio.console.alibabacloud.com/?tab=playground#/api-key",
  },
  moonshot: {
    label: "Kimi (Moonshot AI)",
    kind: "openai-compatible",
    group: "openai-compatible",
    baseURL: "https://api.moonshot.ai/v1",
    structuredOutputs: false,
    exampleModel: "kimi-k2-turbo-preview",
    exampleLightModel: "kimi-k2-turbo-preview",
    keyUrl: "https://platform.moonshot.ai/console/api-keys",
  },
  zai: {
    label: "GLM (Z.ai)",
    kind: "openai-compatible",
    group: "openai-compatible",
    baseURL: "https://api.z.ai/api/paas/v4",
    structuredOutputs: false,
    exampleModel: "glm-4.6",
    exampleLightModel: "glm-4.5-air",
    keyUrl: "https://z.ai/manage-apikey/apikey-list",
  },
  groq: {
    label: "Groq",
    kind: "openai-compatible",
    group: "openai-compatible",
    baseURL: "https://api.groq.com/openai/v1",
    structuredOutputs: true,
    exampleModel: "openai/gpt-oss-120b",
    exampleLightModel: "openai/gpt-oss-20b",
    keyUrl: "https://console.groq.com/keys",
  },
  xai: {
    label: "xAI Grok",
    kind: "openai-compatible",
    group: "openai-compatible",
    baseURL: "https://api.x.ai/v1",
    structuredOutputs: true,
    exampleModel: "grok-4",
    exampleLightModel: "grok-3-mini",
    keyUrl: "https://console.x.ai",
  },
  mistral: {
    label: "Mistral",
    kind: "openai-compatible",
    group: "openai-compatible",
    baseURL: "https://api.mistral.ai/v1",
    structuredOutputs: true,
    exampleModel: "mistral-large-latest",
    exampleLightModel: "mistral-small-latest",
    keyUrl: "https://console.mistral.ai/api-keys",
  },
  together: {
    label: "Together AI",
    kind: "openai-compatible",
    group: "openai-compatible",
    baseURL: "https://api.together.xyz/v1",
    structuredOutputs: true,
    exampleModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    exampleLightModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    keyUrl: "https://api.together.ai/settings/api-keys",
  },
  fireworks: {
    label: "Fireworks AI",
    kind: "openai-compatible",
    group: "openai-compatible",
    baseURL: "https://api.fireworks.ai/inference/v1",
    structuredOutputs: true,
    exampleModel: "accounts/fireworks/models/deepseek-v3p1",
    exampleLightModel: "accounts/fireworks/models/qwen3-30b-a3b",
    keyUrl: "https://fireworks.ai/account/api-keys",
  },
  cerebras: {
    label: "Cerebras",
    kind: "openai-compatible",
    group: "openai-compatible",
    baseURL: "https://api.cerebras.ai/v1",
    structuredOutputs: true,
    exampleModel: "gpt-oss-120b",
    exampleLightModel: "llama3.1-8b",
    keyUrl: "https://cloud.cerebras.ai",
  },
  "deepseek-anthropic": {
    label: "DeepSeek (Anthropic API)",
    kind: "anthropic-compatible",
    group: "anthropic-compatible",
    baseURL: "https://api.deepseek.com/anthropic/v1",
    exampleModel: "deepseek-chat",
    exampleLightModel: "deepseek-chat",
    keyUrl: "https://platform.deepseek.com/api_keys",
  },
  "moonshot-anthropic": {
    label: "Kimi (Anthropic API)",
    kind: "anthropic-compatible",
    group: "anthropic-compatible",
    baseURL: "https://api.moonshot.ai/anthropic/v1",
    exampleModel: "kimi-k2-turbo-preview",
    exampleLightModel: "kimi-k2-turbo-preview",
    keyUrl: "https://platform.moonshot.ai/console/api-keys",
  },
  "zai-anthropic": {
    label: "GLM (Anthropic API)",
    kind: "anthropic-compatible",
    group: "anthropic-compatible",
    baseURL: "https://api.z.ai/api/anthropic/v1",
    exampleModel: "glm-4.6",
    exampleLightModel: "glm-4.5-air",
    keyUrl: "https://z.ai/manage-apikey/apikey-list",
  },
  custom: {
    label: "Custom OpenAI-compatible",
    kind: "openai-compatible",
    group: "custom",
    structuredOutputs: true,
    exampleModel: "your-model-id",
    exampleLightModel: "your-small-model-id",
  },
  "custom-anthropic": {
    label: "Custom Anthropic-compatible",
    kind: "anthropic-compatible",
    group: "custom",
    exampleModel: "your-model-id",
    exampleLightModel: "your-small-model-id",
  },
} as const satisfies Record<string, ProviderPreset>;

export type ProviderId = keyof typeof PROVIDERS;

export const providerIds = Object.keys(PROVIDERS) as ProviderId[];

export const PROVIDER_GROUP_LABELS: Record<ProviderGroup, string> = {
  official: "Official APIs",
  "openai-compatible": "OpenAI-compatible",
  "anthropic-compatible": "Anthropic-compatible",
  custom: "Custom endpoint",
};

/** Preset of a provider id, typed loosely for optional fields. */
export const getPreset = (id: ProviderId): ProviderPreset => PROVIDERS[id];

/** Whether the user enters the base URL for this provider. */
export const needsBaseURL = (id: ProviderId) => getPreset(id).group === "custom";

/** Base URL requests go to: the preset's, or the user's for custom endpoints. */
export const resolveBaseURL = (id: ProviderId, custom?: string | null) =>
  getPreset(id).baseURL ?? (needsBaseURL(id) ? (custom ?? undefined) : undefined);

/** IPv4/IPv6 literals and names that only resolve inside a network. */
const isPrivateHost = (host: string) => {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "localhost" || /\.(local|internal|localhost)$/.test(h)) return true;

  const v4 = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)?.slice(1).map(Number);
  if (v4) {
    const [a, b] = v4;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }

  return h.includes(":") && (h === "::1" || /^(fc|fd|fe8|fe9|fea|feb|::ffff:)/.test(h));
};

/**
 * Whether the server may call this custom base URL. The server makes the
 * request, so a private address would let a user reach the server's own
 * network. Self-hosters can allow it with MAVEN_ALLOW_PRIVATE_BASE_URL=true.
 */
export const isAllowedBaseURL = (
  value: string,
  allowPrivate = process.env.MAVEN_ALLOW_PRIVATE_BASE_URL === "true"
) => {
  try {
    const url = new URL(value);
    if (allowPrivate) return url.protocol === "https:" || url.protocol === "http:";
    // ponytail: checks the literal host only; a public name resolving to a private IP still passes, add a resolving fetch guard if that matters.
    return url.protocol === "https:" && !isPrivateHost(url.hostname);
  } catch {
    return false;
  }
};
