"use server";

import { sql } from "@/database/neon";
import { ComponentType, ShareAnalytics, ShareRecord } from "../types/neon";
import { createShareReferenceId } from "./share";
import { createId } from "@paralleldrive/cuid2";

export async function createShare(
  userEmail: string,
  componentId: string,
  componentType: ComponentType
): Promise<string> {
  const id = createId();
  const referenceId = createShareReferenceId(userEmail);

  await sql`
      INSERT INTO shares (
          id, user_email, reference_id, 
          component_id, component_type
      ) VALUES (
          ${id}, ${userEmail}, ${referenceId}, 
          ${componentId}, ${componentType}
      )
  `;

  return referenceId;
}

export async function getShareByReferenceId(
  referenceId: string
): Promise<ShareRecord | null> {
  const result = await sql`
      SELECT * FROM shares WHERE reference_id = ${referenceId} LIMIT 1
  `;
  return (result[0] as ShareRecord) || null;
}

export async function incrementShareAccess(referenceId: string): Promise<void> {
  await sql`
      UPDATE shares 
      SET 
          access_count = access_count + 1,
          last_accessed_at = CURRENT_TIMESTAMP
      WHERE reference_id = ${referenceId}
  `;
}

export async function getShareAnalytics(
  userId?: string
): Promise<ShareAnalytics[]> {
  const query = userId
    ? await sql`
          SELECT 
              component_type,
              COUNT(*) as total_shares,
              SUM(access_count) as total_accesses,
              COUNT(DISTINCT user_id) as unique_sharers
          FROM shares
          WHERE user_id = ${userId}
          GROUP BY component_type
          ORDER BY total_accesses DESC
      `
    : await sql`
          SELECT 
              component_type,
              COUNT(*) as total_shares,
              SUM(access_count) as total_accesses,
              COUNT(DISTINCT user_id) as unique_sharers
          FROM shares
          GROUP BY component_type
          ORDER BY total_accesses DESC
      `;

  return query as ShareAnalytics[];
}
