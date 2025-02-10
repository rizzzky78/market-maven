"use server";

import { sql } from "@/database/neon";
import {
  MarkdownStore,
  MarkdownStoreDTO,
  MarkdownType,
  ObjectStoreDTO,
  ObjectType,
  ObjectTypeMap,
  StoredValue,
  StoreValue,
  ToolDataStore,
  TypedObjectStore,
} from "../types/neon";
import logger from "../utility/logger";

/**
 * Stores a key-value pair in the database with associated metadata.
 * This function provides a generic way to persist any JSON-serializable data
 * with additional contextual information.
 *
 * @template T - The type of value being stored
 * @param {Object} params - The parameters for storing the value
 * @param {string} params.key - Unique identifier for the stored value
 * @param {Record<string, unknown>} params.metadata - Additional contextual information about the stored value
 * @param {T} params.value - The actual value to be stored
 * @returns {Promise<StoredValue<T>>} - Returns the stored key and value
 */
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

/**
 * Retrieves a previously stored value from the database using its key.
 * Returns null if no value is found for the given key.
 *
 * @template T - The expected type of the stored value
 * @param {Object} params - The parameters for retrieving the value
 * @param {string} params.key - The unique identifier of the value to retrieve
 * @returns {Promise<StoredValue<T> | null>} - Returns the stored value and key if found, null otherwise
 */
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

/**
 * Creates a new markdown entry in the database.
 * This function is used to store markdown content with associated metadata such as
 * chat ID, owner, and type classification.
 *
 * @template T - The specific markdown type, defaults to MarkdownType
 * @param {MarkdownStoreDTO} payload - The markdown entry data to be stored
 * @returns {Promise<MarkdownStore<T>>} - Returns the created markdown entry
 */
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

/**
 * Retrieves a markdown entry from the database using its key.
 * Returns null if no entry is found for the given key.
 *
 * @template T - The expected markdown type, defaults to MarkdownType
 * @param {string} key - The unique identifier of the markdown entry
 * @returns {Promise<MarkdownStore<T> | null>} - Returns the markdown entry if found, null otherwise
 */
export async function getMarkdownEntry<T = MarkdownType>(
  key: string
): Promise<MarkdownStore<T> | null> {
  const result = await sql`
      SELECT * FROM markdown_store WHERE key = ${key}
  `;
  return (result[0] as MarkdownStore<T>) || null;
}

/**
 * Creates a new typed object entry in the database.
 * This function provides type-safe storage for different kinds of objects,
 * ensuring that objects are stored with their correct type classification.
 *
 * @template T - The specific object type extending ObjectType
 * @param {Omit<ObjectStoreDTO, "object"> & { object: ObjectTypeMap[T] }} payload - The object entry data to be stored
 * @returns {Promise<TypedObjectStore<T>>} - Returns the created object entry
 */
export async function createObjectEntry<T extends ObjectType>(
  payload: Omit<ObjectStoreDTO, "object"> & { object: ObjectTypeMap[T] }
): Promise<TypedObjectStore<T>> {
  const result = await sql`
      INSERT INTO object_store (key, chat_id, owner, type, object)
      VALUES (${payload.key}, ${payload.chatId}, ${payload.owner}, ${
    payload.type
  }, ${JSON.stringify(payload.object)})
      RETURNING *
  `;
  return result[0] as TypedObjectStore<T>;
}

/**
 * Retrieves a typed object entry from the database using its key and type.
 * Returns null if no entry is found matching both the key and type.
 *
 * @template T - The specific object type extending ObjectType
 * @param {string} key - The unique identifier of the object entry
 * @returns {Promise<TypedObjectStore<T> | null>} - Returns the object entry if found, null otherwise
 */
export async function getObjectEntry<T extends ObjectType>(
  key: string
): Promise<TypedObjectStore<T> | null> {
  const result = await sql`
      SELECT * FROM object_store 
      WHERE key = ${key}
  `;
  return (result[0] as TypedObjectStore<T>) || null;
}

/**
 * Creates a new tool data entry in the database
 * @template ARGS - Type of tool arguments
 * @template DATA - Type of tool data
 * @param {ToolDataStore<ARGS, DATA>} data - Tool data to store
 * @returns {Promise<ToolDataStore<ARGS, DATA>>} - Stored tool data
 */
export async function createToolDataStore<ARGS, DATA>(
  data: ToolDataStore<ARGS, DATA>
): Promise<ToolDataStore<ARGS, DATA>> {
  const result = await sql`
    INSERT INTO tool_data_store (
      key,
      chat_id,
      owner,
      tool_success,
      tool_name,
      tool_args,
      tool_data
    ) VALUES (
      ${data.key},
      ${data.chatId},
      ${data.owner},
      ${data.tool.success},
      ${data.tool.name},
      ${JSON.stringify(data.tool.args)},
      ${JSON.stringify(data.tool.data)}
    )
    RETURNING 
      key,
      chat_id as "chatId",
      owner,
      timestamp,
      tool_success as "tool.success",
      tool_name as "tool.name",
      tool_args as "tool.args",
      tool_data as "tool.data"
  `;

  return result[0] as ToolDataStore<ARGS, DATA>;
}

/**
 * Retrieves tool data by its key
 * @template ARGS - Type of tool arguments
 * @template DATA - Type of tool data
 * @param {string} key - The unique identifier of the tool data
 * @returns {Promise<ToolDataStore<ARGS, DATA> | null>} - The tool data or null if not found
 */
export async function getToolDataStoreByKey<ARGS, DATA>(
  key: string
): Promise<ToolDataStore<ARGS, DATA> | null> {
  const result = await sql`
    SELECT
      key,
      chat_id as "chatId",
      owner,
      timestamp,
      tool_success as "tool.success",
      tool_name as "tool.name",
      tool_args as "tool.args",
      tool_data as "tool.data"
    FROM tool_data_store
    WHERE key = ${key}
  `;

  return (result[0] as ToolDataStore<ARGS, DATA>) || null;
}

/**
 * Retrieves all tool data for a specific chat
 * @template ARGS - Type of tool arguments
 * @template DATA - Type of tool data
 * @param {string} chatId - The chat identifier
 * @returns {Promise<ToolDataStore<ARGS, DATA>[]>} - Array of tool data entries
 */
export async function getToolDataStoreByChatId<ARGS, DATA>(
  chatId: string
): Promise<ToolDataStore<ARGS, DATA>[]> {
  const result = await sql`
    SELECT
      key,
      chat_id as "chatId",
      owner,
      timestamp,
      tool_success as "tool.success",
      tool_name as "tool.name",
      tool_args as "tool.args",
      tool_data as "tool.data"
    FROM tool_data_store
    WHERE chat_id = ${chatId}
    ORDER BY timestamp DESC
  `;

  return result as ToolDataStore<ARGS, DATA>[];
}
