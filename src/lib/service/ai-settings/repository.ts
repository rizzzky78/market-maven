import { prisma } from "@/database/prisma";
import {
  type AssignmentView,
  type ConnectionView,
  DEFAULT_PREFERENCES,
  MODEL_ROLES,
  type ModelRole,
  type Preferences,
  preferencesInputSchema,
  type ReasoningLevel,
  REASONING_LEVELS,
  type UsageSummary,
} from "@/lib/agents/ai-settings-schema";
import type {
  AgentSettings,
  RuntimeAssignment,
  RuntimeConnection,
  UsageRecord,
} from "@/lib/agents/models";
import { type ProviderId, providerIds } from "@/lib/agents/providers";
import logger from "@/lib/utility/logger";
import { v4 } from "uuid";
import { connectionContext, decryptSecret } from "./crypto";

/**
 * Server-only reads and writes of a user's AI settings. Not a server action
 * module: `loadAgentSettings` returns decrypted keys and must never be
 * callable from the client.
 */

const isProviderId = (value: string): value is ProviderId =>
  (providerIds as string[]).includes(value);

const isRole = (value: string): value is ModelRole =>
  (MODEL_ROLES as readonly string[]).includes(value);

const toReasoning = (value: string | null): ReasoningLevel | null =>
  value && (REASONING_LEVELS as readonly string[]).includes(value)
    ? (value as ReasoningLevel)
    : null;

/** Stored preferences, falling back to defaults for anything invalid. */
const toPreferences = (row: Record<string, unknown> | null): Preferences => {
  if (!row) return DEFAULT_PREFERENCES;
  const parsed = preferencesInputSchema.safeParse(row);
  return parsed.success ? parsed.data : DEFAULT_PREFERENCES;
};

/** Settings as shown on the AI settings page; API keys are never included. */
export async function getSettingsView(userId: string) {
  const [connections, assignments, preferences] = await Promise.all([
    prisma.aiConnection.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.aiModelAssignment.findMany({ where: { userId } }),
    prisma.aiPreferences.findUnique({ where: { userId } }),
  ]);

  return {
    connections: connections
      .filter((c) => isProviderId(c.provider))
      .map(
        (c): ConnectionView => ({
          id: c.id,
          label: c.label,
          provider: c.provider as ProviderId,
          baseURL: c.baseURL,
          apiKeyHint: c.apiKeyHint,
          structuredOutputs: c.structuredOutputs,
        })
      ),
    assignments: assignments
      .filter((a) => isRole(a.role))
      .map(
        (a): AssignmentView => ({
          role: a.role as ModelRole,
          connectionId: a.connectionId,
          model: a.model,
          temperature: a.temperature,
          maxOutputTokens: a.maxOutputTokens,
          reasoning: toReasoning(a.reasoning),
        })
      ),
    preferences: toPreferences(preferences),
  };
}

export type SettingsView = Awaited<ReturnType<typeof getSettingsView>>;

/**
 * A connection with its decrypted key, owned by `userId`, or `null`.
 */
export async function getRuntimeConnection(
  userId: string,
  connectionId: string
): Promise<RuntimeConnection | null> {
  const row = await prisma.aiConnection.findFirst({
    where: { id: connectionId, userId },
  });
  if (!row || !isProviderId(row.provider)) return null;

  return {
    id: row.id,
    provider: row.provider,
    apiKey: decryptSecret(row.apiKeyCipher, connectionContext(userId, row.id)),
    baseURL: row.baseURL,
    structuredOutputs: row.structuredOutputs,
  };
}

/**
 * Everything a chat request needs: connections with decrypted keys, role
 * assignments and preferences. A key that no longer decrypts (for example
 * after MAVEN_ENCRYPTION_KEY changed) drops its connection, and its roles
 * fall back to the default models.
 */
export async function loadAgentSettings(
  userId: string
): Promise<{ settings: AgentSettings; trackUsage: boolean }> {
  const [connections, assignments, preferencesRow] = await Promise.all([
    prisma.aiConnection.findMany({ where: { userId } }),
    prisma.aiModelAssignment.findMany({ where: { userId } }),
    prisma.aiPreferences.findUnique({ where: { userId } }),
  ]);

  const runtime = new Map<string, RuntimeConnection>();
  for (const row of connections) {
    if (!isProviderId(row.provider)) continue;
    try {
      runtime.set(row.id, {
        id: row.id,
        provider: row.provider,
        apiKey: decryptSecret(row.apiKeyCipher, connectionContext(userId, row.id)),
        baseURL: row.baseURL,
        structuredOutputs: row.structuredOutputs,
      });
    } catch (error) {
      logger.warn("AI connection key could not be decrypted", {
        connectionId: row.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const byRole: Partial<Record<ModelRole, RuntimeAssignment>> = {};
  for (const a of assignments) {
    if (!isRole(a.role)) continue;
    byRole[a.role] = {
      connectionId: a.connectionId,
      model: a.model,
      temperature: a.temperature,
      maxOutputTokens: a.maxOutputTokens,
      reasoning: toReasoning(a.reasoning),
    };
  }

  const preferences = toPreferences(preferencesRow);

  return {
    settings: { connections: runtime, assignments: byRole, preferences },
    trackUsage: preferences.trackUsage,
  };
}

/** Stores the token usage of one request. Failures are logged, never thrown. */
export async function saveUsage(
  userId: string,
  chatId: string | null,
  records: UsageRecord[]
) {
  if (records.length === 0) return;

  try {
    await prisma.aiUsage.createMany({
      data: records.map((r) => ({
        id: v4(),
        userId,
        chatId,
        role: r.role,
        provider: r.provider,
        model: r.model,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        reasoningTokens: r.reasoningTokens,
        cachedTokens: r.cachedTokens,
      })),
    });
  } catch (error) {
    logger.error("Saving AI usage failed", { error });
  }
}

/** Usage totals of the last `days` days, by model, role and day. */
export async function getUsageSummary(userId: string, days = 30): Promise<UsageSummary> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const where = { userId, createdAt: { gte: since } };
  const sum = {
    inputTokens: true,
    outputTokens: true,
    reasoningTokens: true,
    cachedTokens: true,
  } as const;

  const [totals, byModel, byRole, daily] = await Promise.all([
    prisma.aiUsage.aggregate({ where, _count: { _all: true }, _sum: sum }),
    prisma.aiUsage.groupBy({
      by: ["provider", "model"],
      where,
      _count: { _all: true },
      _sum: { inputTokens: true, outputTokens: true },
      orderBy: { _sum: { inputTokens: "desc" } },
      take: 20,
    }),
    prisma.aiUsage.groupBy({
      by: ["role"],
      where,
      _count: { _all: true },
      _sum: { inputTokens: true, outputTokens: true },
    }),
    prisma.$queryRaw<{ day: Date; input: bigint | null; output: bigint | null }[]>`
      SELECT date_trunc('day', "created_at") AS day,
             SUM("input_tokens") AS input,
             SUM("output_tokens") AS output
      FROM "ai_usage"
      WHERE "user_id" = ${userId} AND "created_at" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `,
  ]);

  return {
    days,
    totals: {
      calls: totals._count._all,
      input: totals._sum.inputTokens ?? 0,
      output: totals._sum.outputTokens ?? 0,
      reasoning: totals._sum.reasoningTokens ?? 0,
      cached: totals._sum.cachedTokens ?? 0,
    },
    byModel: byModel.map((m) => ({
      provider: m.provider,
      model: m.model,
      calls: m._count._all,
      input: m._sum.inputTokens ?? 0,
      output: m._sum.outputTokens ?? 0,
    })),
    byRole: byRole
      .map((r) => ({
        role: r.role,
        calls: r._count._all,
        input: r._sum.inputTokens ?? 0,
        output: r._sum.outputTokens ?? 0,
      }))
      .sort((a, b) => b.input + b.output - (a.input + a.output)),
    daily: daily.map((d) => ({
      day: d.day.toISOString().slice(0, 10),
      input: Number(d.input ?? 0),
      output: Number(d.output ?? 0),
    })),
  };
}
