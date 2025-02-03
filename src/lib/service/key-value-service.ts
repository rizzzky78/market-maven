"use server";

import { sql } from "@/database/neon";
import { StoredValue, StoreValue } from "../types/neon";
import logger from "../utility/logger";

export async function storeKeyValue(data: StoreValue): Promise<void> {
  logger.info("Storing value", {
    key: data.key,
    metadata: data.metadata,
    operation: "store",
  });

  await sql`
    INSERT INTO key_value_store (key, metadata, value)
    VALUES (
      ${data.key},
      ${JSON.stringify(data.metadata)}::jsonb,
      ${data.value}
    )
  `;
}

export async function retrieveKeyValue(
  key: string
): Promise<StoredValue | null> {
  logger.info("Retrieving value", { key, operation: "retrieve" });

  const result = await sql`
    SELECT key, value
    FROM key_value_store
    WHERE key = ${key}
  `;

  if (result.length === 0) {
    return null;
  }

  try {
    return {
      key: result[0].key,
      value: JSON.parse(result[0].value),
    };
  } catch (error) {
    logger.warn("Failed to parse stored JSON value", {
      key,
      error: (error as Error).message,
      operation: "parse",
    });

    return result[0] as StoredValue;
  }
}
