"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import {
  type ActionResult,
  type AssignmentInput,
  assignmentInputSchema,
  type ConnectionInput,
  connectionInputSchema,
  type ConnectionView,
  MODEL_ROLES,
  type ModelRole,
  type PreferencesInput,
  preferencesInputSchema,
  type UsageSummary,
} from "@/lib/agents/ai-settings-schema";
import { listProviderModels } from "@/lib/agents/provider-models";
import { getPreset, isAllowedBaseURL, needsBaseURL } from "@/lib/agents/providers";
import { getSession } from "@/lib/auth";
import logger from "@/lib/utility/logger";
import { v4 } from "uuid";
import { connectionContext, decryptSecret, encryptSecret, secretHint } from "./crypto";
import { getUsageSummary } from "./repository";

const SETTINGS_PATH = "/settings";
const MAX_CONNECTIONS = 20;

/** Signed-in user's id, or `null`. */
const currentUserId = async () => (await getSession())?.user?.id ?? null;

const fail = (error: string) => ({ ok: false as const, error });

const firstIssue = (error: z.ZodError) => error.issues[0]?.message ?? "Check the form fields";

/** Base URL to store: only custom endpoints keep one, and it must be allowed. */
const storedBaseURL = (provider: ConnectionInput["provider"], baseURL?: string | null) => {
  if (!needsBaseURL(provider)) return { ok: true as const, value: null };
  if (!baseURL || !isAllowedBaseURL(baseURL)) {
    return fail("The base URL must be a public HTTPS address");
  }
  return { ok: true as const, value: baseURL.replace(/\/+$/, "") };
};

/** JSON schema output override, only meaningful for OpenAI-compatible APIs. */
const storedStructuredOutputs = (
  provider: ConnectionInput["provider"],
  value?: boolean | null
) => (getPreset(provider).kind === "openai-compatible" ? (value ?? null) : null);

/**
 * Adds a connection, or updates one when `id` is set. An empty API key on
 * update keeps the stored key, unless the provider changed.
 */
export async function saveConnection(
  input: ConnectionInput
): Promise<ActionResult<ConnectionView>> {
  const userId = await currentUserId();
  if (!userId) return fail("Sign in to manage AI connections");

  const parsed = connectionInputSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const { id, label, provider, apiKey, structuredOutputs } = parsed.data;
  const baseURL = storedBaseURL(provider, parsed.data.baseURL);
  if (!baseURL.ok) return baseURL;

  try {
    if (id) {
      const existing = await prisma.aiConnection.findFirst({ where: { id, userId } });
      if (!existing) return fail("Connection not found");
      if (!apiKey && existing.provider !== provider) {
        return fail("Enter the API key for the new provider");
      }

      const row = await prisma.aiConnection.update({
        where: { id },
        data: {
          label,
          provider,
          baseURL: baseURL.value,
          structuredOutputs: storedStructuredOutputs(provider, structuredOutputs),
          ...(apiKey && {
            apiKeyCipher: encryptSecret(apiKey, connectionContext(userId, id)),
            apiKeyHint: secretHint(apiKey),
          }),
        },
      });

      revalidatePath(SETTINGS_PATH);
      return { ok: true, data: toView(row) };
    }

    const count = await prisma.aiConnection.count({ where: { userId } });
    if (count >= MAX_CONNECTIONS) {
      return fail(`You can save up to ${MAX_CONNECTIONS} connections`);
    }

    const newId = v4();
    const row = await prisma.aiConnection.create({
      data: {
        id: newId,
        userId,
        label,
        provider,
        baseURL: baseURL.value,
        structuredOutputs: storedStructuredOutputs(provider, structuredOutputs),
        apiKeyCipher: encryptSecret(apiKey!, connectionContext(userId, newId)),
        apiKeyHint: secretHint(apiKey!),
      },
    });

    revalidatePath(SETTINGS_PATH);
    return { ok: true, data: toView(row) };
  } catch (error) {
    logger.error("Saving AI connection failed", { error });
    return fail("Could not save the connection. Please try again.");
  }
}

const toView = (row: {
  id: string;
  label: string;
  provider: string;
  baseURL: string | null;
  apiKeyHint: string;
  structuredOutputs: boolean | null;
}): ConnectionView => ({
  id: row.id,
  label: row.label,
  provider: row.provider as ConnectionView["provider"],
  baseURL: row.baseURL,
  apiKeyHint: row.apiKeyHint,
  structuredOutputs: row.structuredOutputs,
});

/** Deletes a connection; roles assigned to it go back to their fallback. */
export async function deleteConnection(id: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return fail("Sign in to manage AI connections");

  const { count } = await prisma.aiConnection.deleteMany({ where: { id, userId } });
  if (count === 0) return fail("Connection not found");

  revalidatePath(SETTINGS_PATH);
  return { ok: true };
}

const fetchModelsSchema = z.object({
  id: z.string().min(1).max(64).optional(),
  provider: connectionInputSchema.shape.provider,
  apiKey: z.string().trim().max(500).optional(),
  baseURL: z.string().trim().max(500).nullable().optional(),
});

/**
 * Lists a connection's models, which also tests the key. Works for an
 * unsaved form (key from the input) and a saved connection (stored key when
 * the key field is left empty).
 */
export async function fetchConnectionModels(
  input: z.input<typeof fetchModelsSchema>
): Promise<ActionResult<string[]>> {
  const userId = await currentUserId();
  if (!userId) return fail("Sign in to manage AI connections");

  const parsed = fetchModelsSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const { id, provider, baseURL } = parsed.data;
  let apiKey = parsed.data.apiKey;

  if (!apiKey && id) {
    const row = await prisma.aiConnection.findFirst({ where: { id, userId } });
    if (!row) return fail("Connection not found");
    try {
      apiKey = decryptSecret(row.apiKeyCipher, connectionContext(userId, row.id));
    } catch {
      return fail("The stored key could not be read. Enter it again.");
    }
  }
  if (!apiKey) return fail("Enter the API key");

  const result = await listProviderModels({
    id: id ?? "draft",
    provider,
    apiKey,
    baseURL: baseURL ?? null,
    structuredOutputs: null,
  });

  return result.ok ? { ok: true, data: result.models } : fail(result.error);
}

/** Sets the connection, model and parameters of one pipeline role. */
export async function saveAssignment(input: AssignmentInput): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return fail("Sign in to manage AI settings");

  const parsed = assignmentInputSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const { role, connectionId, model, temperature, maxOutputTokens, reasoning } = parsed.data;

  const owned = await prisma.aiConnection.count({ where: { id: connectionId, userId } });
  if (!owned) return fail("Connection not found");

  const data = {
    connectionId,
    model,
    temperature: temperature ?? null,
    maxOutputTokens: maxOutputTokens ?? null,
    reasoning: reasoning ?? null,
  };

  await prisma.aiModelAssignment.upsert({
    where: { userId_role: { userId, role } },
    create: { userId, role, ...data },
    update: data,
  });

  revalidatePath(SETTINGS_PATH);
  return { ok: true };
}

/** Removes a role's assignment so it uses its fallback again. */
export async function clearAssignment(role: ModelRole): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return fail("Sign in to manage AI settings");
  if (!MODEL_ROLES.includes(role)) return fail("Unknown role");

  await prisma.aiModelAssignment.deleteMany({ where: { userId, role } });

  revalidatePath(SETTINGS_PATH);
  return { ok: true };
}

/** Saves custom instructions, chat style and analysis preferences. */
export async function savePreferences(input: PreferencesInput): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return fail("Sign in to manage AI settings");

  const parsed = preferencesInputSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const data = {
    ...parsed.data,
    instructions: parsed.data.instructions ?? null,
    language: parsed.data.language ?? null,
    currency: parsed.data.currency?.toUpperCase() ?? null,
    budgetMax: parsed.data.budgetMax ?? null,
  };

  await prisma.aiPreferences.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  revalidatePath(SETTINGS_PATH);
  return { ok: true };
}

/** Usage summary for another time range. */
export async function loadUsageSummary(days: number): Promise<ActionResult<UsageSummary>> {
  const userId = await currentUserId();
  if (!userId) return fail("Sign in to see usage");

  const range = z.union([z.literal(7), z.literal(30), z.literal(90)]).safeParse(days);
  if (!range.success) return fail("Unsupported range");

  return { ok: true, data: await getUsageSummary(userId, range.data) };
}

/** Deletes all recorded token usage of the user. */
export async function clearUsage(): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return fail("Sign in to manage usage");

  await prisma.aiUsage.deleteMany({ where: { userId } });

  revalidatePath(SETTINGS_PATH);
  return { ok: true };
}
