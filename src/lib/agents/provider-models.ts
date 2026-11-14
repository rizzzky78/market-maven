import type { RuntimeConnection } from "./models";
import { getPreset, isAllowedBaseURL, needsBaseURL, resolveBaseURL } from "./providers";

const TIMEOUT_MS = 10_000;
const MAX_MODELS = 300;

type ListRequest = { url: string; headers: Record<string, string> };

/** The provider's model list endpoint and auth headers. */
function listRequest(connection: RuntimeConnection): ListRequest {
  const { provider, apiKey } = connection;
  const kind = getPreset(provider).kind;
  const baseURL = resolveBaseURL(provider, connection.baseURL);

  switch (kind) {
    case "google":
      return {
        url: "https://generativelanguage.googleapis.com/v1beta/models?pageSize=200",
        headers: { "x-goog-api-key": apiKey },
      };
    case "openai":
      return {
        url: "https://api.openai.com/v1/models",
        headers: { Authorization: `Bearer ${apiKey}` },
      };
    case "anthropic":
    case "anthropic-compatible":
      return {
        url: `${(baseURL ?? "https://api.anthropic.com/v1").replace(/\/$/, "")}/models?limit=100`,
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      };
    case "gateway":
      return {
        url: "https://ai-gateway.vercel.sh/v1/models",
        headers: { Authorization: `Bearer ${apiKey}` },
      };
    case "openai-compatible":
      return {
        url: `${(baseURL ?? "").replace(/\/$/, "")}/models`,
        headers: { Authorization: `Bearer ${apiKey}` },
      };
  }
}

/** Model ids from the response shapes of the supported list endpoints. */
function parseModelIds(body: unknown): string[] {
  if (!body || typeof body !== "object") return [];
  const record = body as Record<string, unknown>;

  /** Google: { models: [{ name: "models/gemini-...", supportedGenerationMethods }] } */
  if (Array.isArray(record.models)) {
    return record.models
      .filter((m) => {
        const methods = (m as { supportedGenerationMethods?: string[] }).supportedGenerationMethods;
        return !methods || methods.includes("generateContent");
      })
      .map((m) => String((m as { name?: string }).name ?? "").replace(/^models\//, ""))
      .filter(Boolean);
  }

  /** OpenAI, Anthropic, gateway and compatible APIs: { data: [{ id }] } */
  if (Array.isArray(record.data)) {
    return record.data
      .map((m) => String((m as { id?: string }).id ?? ""))
      .filter(Boolean);
  }

  return [];
}

/**
 * Lists the models a connection can use, which also verifies the key and
 * base URL. Redirects are not followed so a public URL cannot bounce the
 * server's request to a private address.
 */
export async function listProviderModels(
  connection: RuntimeConnection
): Promise<{ ok: true; models: string[] } | { ok: false; error: string }> {
  const baseURL = resolveBaseURL(connection.provider, connection.baseURL);
  if (needsBaseURL(connection.provider) && (!baseURL || !isAllowedBaseURL(baseURL))) {
    return { ok: false, error: "This base URL is not allowed" };
  }

  const { url, headers } = listRequest(connection);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", ...headers },
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (response.status === 401 || response.status === 403) {
      return { ok: false, error: "The provider rejected this API key" };
    }
    if (!response.ok) {
      return {
        ok: false,
        error: `The provider answered with status ${response.status}. This endpoint may not list models; you can still type a model id.`,
      };
    }

    const ids = [...new Set(parseModelIds(await response.json()))].sort();
    return { ok: true, models: ids.slice(0, MAX_MODELS) };
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    return {
      ok: false,
      error: timedOut
        ? "The provider did not answer in time"
        : "Could not reach the provider. Check the base URL.",
    };
  }
}
