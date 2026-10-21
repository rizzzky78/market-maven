import { z } from "zod";

/**
 * LLM providers a user can bring their own API key for. Shared by the
 * settings dialog (labels, hints) and the server (validation, model setup in
 * `models.ts`). `openai-compatible` presets talk to any API that implements
 * the OpenAI chat completions format.
 */
export const PROVIDERS = {
  google: {
    label: "Google Gemini",
    kind: "google",
    exampleModel: "gemini-2.5-flash",
    exampleLightModel: "gemini-2.5-flash-lite",
    keyUrl: "https://aistudio.google.com/app/apikey",
  },
  openai: {
    label: "OpenAI",
    kind: "openai",
    exampleModel: "gpt-4.1",
    exampleLightModel: "gpt-4.1-mini",
    keyUrl: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    label: "Anthropic",
    kind: "anthropic",
    exampleModel: "claude-sonnet-4-5",
    exampleLightModel: "claude-haiku-4-5",
    keyUrl: "https://console.anthropic.com/settings/keys",
  },
  gateway: {
    label: "Vercel AI Gateway (any model)",
    kind: "gateway",
    exampleModel: "openai/gpt-4.1",
    exampleLightModel: "google/gemini-2.5-flash-lite",
    keyUrl: "https://vercel.com/docs/ai-gateway",
  },
  openrouter: {
    label: "OpenRouter",
    kind: "openai-compatible",
    baseURL: "https://openrouter.ai/api/v1",
    structuredOutputs: true,
    exampleModel: "openai/gpt-4.1",
    exampleLightModel: "openai/gpt-4.1-mini",
    keyUrl: "https://openrouter.ai/keys",
  },
  groq: {
    label: "Groq",
    kind: "openai-compatible",
    baseURL: "https://api.groq.com/openai/v1",
    structuredOutputs: true,
    exampleModel: "openai/gpt-oss-120b",
    exampleLightModel: "openai/gpt-oss-20b",
    keyUrl: "https://console.groq.com/keys",
  },
  xai: {
    label: "xAI Grok",
    kind: "openai-compatible",
    baseURL: "https://api.x.ai/v1",
    structuredOutputs: true,
    exampleModel: "grok-4",
    exampleLightModel: "grok-3-mini",
    keyUrl: "https://console.x.ai",
  },
  deepseek: {
    label: "DeepSeek",
    kind: "openai-compatible",
    baseURL: "https://api.deepseek.com/v1",
    // DeepSeek only offers JSON mode, not JSON schema outputs.
    structuredOutputs: false,
    exampleModel: "deepseek-chat",
    exampleLightModel: "deepseek-chat",
    keyUrl: "https://platform.deepseek.com/api_keys",
  },
  mistral: {
    label: "Mistral",
    kind: "openai-compatible",
    baseURL: "https://api.mistral.ai/v1",
    structuredOutputs: true,
    exampleModel: "mistral-large-latest",
    exampleLightModel: "mistral-small-latest",
    keyUrl: "https://console.mistral.ai/api-keys",
  },
  together: {
    label: "Together AI",
    kind: "openai-compatible",
    baseURL: "https://api.together.xyz/v1",
    structuredOutputs: true,
    exampleModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    exampleLightModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    keyUrl: "https://api.together.ai/settings/api-keys",
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    kind: "openai-compatible",
    structuredOutputs: true,
    exampleModel: "your-model-id",
    exampleLightModel: "your-small-model-id",
    keyUrl: undefined,
  },
} as const satisfies Record<
  string,
  {
    label: string;
    kind: "google" | "openai" | "anthropic" | "gateway" | "openai-compatible";
    baseURL?: string;
    structuredOutputs?: boolean;
    exampleModel: string;
    exampleLightModel: string;
    keyUrl: string | undefined;
  }
>;

export type ProviderId = keyof typeof PROVIDERS;

export const providerIds = Object.keys(PROVIDERS) as ProviderId[];

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
export const isAllowedBaseURL = (value: string, allowPrivate = false) => {
  try {
    const url = new URL(value);
    if (allowPrivate) return url.protocol === "https:" || url.protocol === "http:";
    // ponytail: checks the literal host only; a public name resolving to a private IP still passes, add a resolving fetch guard if that matters.
    return url.protocol === "https:" && !isPrivateHost(url.hostname);
  } catch {
    return false;
  }
};

const modelId = z.string().trim().min(1).max(200);

/**
 * A user's own LLM settings, sent with each chat request. Never stored on
 * the server.
 */
export const modelConfigSchema = z
  .object({
    provider: z.enum(providerIds as [ProviderId, ...ProviderId[]]),
    apiKey: z.string().trim().min(1).max(500),
    /** Model for routing, research and answers */
    model: modelId,
    /** Smaller model for follow-ups (related queries, titles); defaults to `model` */
    lightModel: modelId.optional().or(z.literal("").transform(() => undefined)),
    /** Only for `custom` */
    baseURL: z.string().trim().max(500).optional(),
  })
  .refine((c) => c.provider !== "custom" || !!c.baseURL, {
    message: "A custom provider needs a base URL",
    path: ["baseURL"],
  });

export type ModelConfig = z.infer<typeof modelConfigSchema>;
