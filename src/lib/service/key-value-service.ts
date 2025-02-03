"use server";

import { sql } from "@/database/neon";
import { StoredValue, StoreValue } from "../types/neon";
import logger from "../utility/logger";

export async function storeKeyValue<T>({
  key,
  metadata,
  value,
}: StoreValue): Promise<StoredValue<T>> {
  logger.info("Storing value", {
    key: key,
    metadata: metadata,
    operation: "store",
  });

  await sql`
    INSERT INTO key_value_store (key, metadata, value)
    VALUES (
      ${key},  
      ${JSON.stringify(metadata)}::jsonb,
      ${JSON.stringify(value)}::jsonb
    )
  `;

  return {
    key: key,
    value: value as T,
  };
}

export async function retrieveKeyValue<T>({
  key,
}: {
  key: string;
}): Promise<StoredValue<T> | null> {
  logger.info("Retrieving value", { key, operation: "retrieve" });

  const result = await sql`
    SELECT key, value
    FROM key_value_store
    WHERE key = ${key}
  `;

  if (result.length === 0) {
    return null;
  }

  return {
    key: result[0].key,
    value: result[0].value,
  };
}
