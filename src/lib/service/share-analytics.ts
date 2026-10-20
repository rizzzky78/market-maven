"use server";

import { prisma } from "@/database/prisma";
import { ComponentType, ShareAnalytics, ShareRecord } from "../types/neon";
import { createShareReferenceId } from "./share";
import { createId } from "@paralleldrive/cuid2";

export async function createShare(
  userEmail: string,
  componentId: string,
  componentType: ComponentType
): Promise<string> {
  const referenceId = createShareReferenceId(userEmail);

  await prisma.share.create({
    data: {
      id: createId(),
      userEmail,
      referenceId,
      componentId,
      componentType,
    },
  });

  return referenceId;
}

export async function getShareByReferenceId(
  referenceId: string
): Promise<ShareRecord | null> {
  const share = await prisma.share.findUnique({ where: { referenceId } });
  return share as ShareRecord | null;
}

export async function incrementShareAccess(referenceId: string): Promise<void> {
  await prisma.share.update({
    where: { referenceId },
    data: {
      accessCount: { increment: 1 },
      lastAccessedAt: new Date(),
    },
  });
}

export async function getShareAnalytics(
  userId?: string
): Promise<ShareAnalytics[]> {
  // COUNT(DISTINCT ...) has no groupBy equivalent in Prisma, so this stays SQL.
  const rows = await prisma.$queryRaw<
    {
      componentType: ComponentType;
      totalShares: bigint;
      totalAccesses: bigint | null;
      uniqueSharers: bigint;
    }[]
  >`
    SELECT
      component_type AS "componentType",
      COUNT(*) AS "totalShares",
      SUM(access_count) AS "totalAccesses",
      COUNT(DISTINCT user_id) AS "uniqueSharers"
    FROM shares
    WHERE ${userId ?? null}::text IS NULL OR user_id = ${userId ?? null}
    GROUP BY component_type
    ORDER BY "totalAccesses" DESC
  `;

  return rows.map((row) => ({
    componentType: row.componentType,
    totalShares: Number(row.totalShares),
    totalAccesses: Number(row.totalAccesses ?? 0),
    uniqueSharers: Number(row.uniqueSharers),
  }));
}
