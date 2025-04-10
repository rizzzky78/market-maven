"use server";

import { sql } from "@/database/neon";
import {
  MarkdownStore,
  MarkdownStoreDTO,
  MarkdownType,
  ObjectStore,
  ToolDataStore,
  TypedObjectStore,
} from "../types/neon";
import logger from "../utility/logger";

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
  logger.info("Storing Value", {
    on: "createMarkdownEntry",
    reffKey: payload.key,
  });

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

  logger.info("Retrieving Value", {
    on: "getMarkdownEntry",
    reffKey: key,
    exists: Boolean(result[0]),
  });

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
export async function createObjectEntry<T>(
  payload: Omit<ObjectStore<T>, "timestamp">
): Promise<TypedObjectStore<T>> {
  logger.info("Storing Value", {
    on: "createObjectEntry",
    reffKey: payload.key,
  });

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
export async function getObjectEntry<T>(
  key: string
): Promise<TypedObjectStore<T> | null> {
  const result = await sql`
      SELECT * FROM object_store 
      WHERE key = ${key}
  `;

  logger.info("Retrieving Value", {
    on: "getObjectEntry",
    reffKey: key,
    exists: Boolean(result[0]),
  });

  return (result[0] as TypedObjectStore<T>) || null;
}

/**
 * Creates a new tool data entry in the database
 * @template ARGS - Type of tool arguments
 * @template DATA - Type of tool data
 * @param {ToolDataStore<ARGS, DATA>} data - Tool data to store
 * @returns {Promise<ToolDataStore<ARGS, DATA>>} - Stored tool data
 */
export async function createToolDataEntry<ARGS, DATA>(
  data: Omit<ToolDataStore<ARGS, DATA>, "timestamp">
): Promise<ToolDataStore<ARGS, DATA>> {
  const { key, chatId, owner, tool } = data;

  logger.info("Storing Value", {
    on: "createToolDataEntry",
    reffKey: key,
  });

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
      ${key},
      ${chatId},
      ${owner},
      ${tool.success},
      ${tool.name},
      ${JSON.stringify(tool.args)},
      ${JSON.stringify(tool.data)}
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
export async function getToolDataEntryByKey<ARGS, DATA>(
  key: string
): Promise<ToolDataStore<ARGS, DATA> | null> {
  const [row] = await sql`
    SELECT
      key,
      chat_id as "chatId",
      owner,
      timestamp,
      json_build_object(
        'success', tool_success,
        'name', tool_name,
        'args', tool_args,
        'data', tool_data
      ) as tool
    FROM tool_data_store
    WHERE key = ${key}
  `;

  logger.info("Retrieving Value", {
    on: "getToolDataEntryByKey",
    reffKey: key,
    exists: Boolean(row),
  });

  return row as ToolDataStore<ARGS, DATA> | null;
}

/**
 * Retrieves all tool data for a specific chat
 * @template ARGS - Type of tool arguments
 * @template DATA - Type of tool data
 * @param {string} chatId - The chat identifier
 * @returns {Promise<ToolDataStore<ARGS, DATA>[]>} - Array of tool data entries
 */
export async function getToolDataEntryByChatId<ARGS, DATA>(
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

  logger.info("Retrieving Value", {
    on: "getToolDataEntryByChatId",
    reffChatId: chatId,
    exists: Boolean(result[0]),
  });

  return result as ToolDataStore<ARGS, DATA>[];
}
