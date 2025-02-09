"use server";

import { sql } from "@/database/neon";
import {
  MarkdownStore,
  MarkdownStoreDTO,
  MarkdownType,
  StoredValue,
  StoreValue,
} from "../types/neon";
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

export async function createMarkdownEntry<T = MarkdownType>(
  payload: MarkdownStoreDTO
): Promise<MarkdownStore<T>> {
  const result = await sql`
      INSERT INTO markdown_store (key, chat_id, owner, type, markdown)
      VALUES (${payload.key}, ${payload.chatId}, ${payload.owner}, ${payload.type}, ${payload.markdown})
      RETURNING *
  `;
  return result[0] as MarkdownStore<T>;
}

export async function getMarkdownEntry<T = MarkdownType>(
  key: string
): Promise<MarkdownStore<T> | null> {
  const result = await sql`
      SELECT * FROM markdown_store WHERE key = ${key}
  `;
  return (result[0] as MarkdownStore<T>) || null;
}

export type KeyValueStore = {
  /** A type coresponding contained data */
  type: "markdown" | "object";
  /** A key to access this data, the key are in form of uuid v4 */
  key: string;
  /** Contained data, a string if the type is markdown and record if type is object*/
  data: string | Record<string, any>;
  metadata: {
    chatId: string;
    owner: string;
  };
};

export type ContainedBoth = {
  /** A key to access this data, the key are in form of uuid v4 */
  key: string;
  data: {
    markdown: string;
    object: Record<string, any>;
  };
  metadata: {
    chatId: string;
    owner: string;
  };
};
