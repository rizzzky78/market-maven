"use server";

import { prisma } from "@/database/prisma";
import { Prisma } from "@/generated/prisma/client";
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

  const entry = await prisma.markdownStore.create({
    data: {
      key: payload.key,
      chatId: payload.chatId,
      owner: payload.owner,
      type: payload.type,
      markdown: payload.markdown,
    },
  });
  return entry as MarkdownStore<T>;
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
  const entry = await prisma.markdownStore.findUnique({ where: { key } });

  logger.info("Retrieving Value", {
    on: "getMarkdownEntry",
    reffKey: key,
    exists: Boolean(entry),
  });

  return entry as MarkdownStore<T> | null;
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

  const entry = await prisma.objectStore.create({
    data: {
      key: payload.key,
      chatId: payload.chatId,
      owner: payload.owner,
      type: payload.type,
      object: payload.object as Prisma.InputJsonValue,
    },
  });
  return entry as TypedObjectStore<T>;
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
  const entry = await prisma.objectStore.findUnique({ where: { key } });

  logger.info("Retrieving Value", {
    on: "getObjectEntry",
    reffKey: key,
    exists: Boolean(entry),
  });

  return entry as TypedObjectStore<T> | null;
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

  const row = await prisma.toolDataStore.create({
    data: {
      key,
      chatId,
      owner,
      toolSuccess: tool.success,
      toolName: tool.name,
      toolArgs: tool.args as Prisma.InputJsonValue,
      toolData: tool.data as Prisma.InputJsonValue,
    },
  });

  return toToolDataStore<ARGS, DATA>(row);
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
  const row = await prisma.toolDataStore.findUnique({ where: { key } });

  logger.info("Retrieving Value", {
    on: "getToolDataEntryByKey",
    reffKey: key,
    exists: Boolean(row),
  });

  return row ? toToolDataStore<ARGS, DATA>(row) : null;
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
  const rows = await prisma.toolDataStore.findMany({
    where: { chatId },
    orderBy: { timestamp: "desc" },
  });

  logger.info("Retrieving Value", {
    on: "getToolDataEntryByChatId",
    reffChatId: chatId,
    exists: rows.length > 0,
  });

  return rows.map((row) => toToolDataStore<ARGS, DATA>(row));
}

/**
 * Maps a `tool_data_store` row to the nested `ToolDataStore` shape.
 */
function toToolDataStore<ARGS, DATA>(
  row: Prisma.ToolDataStoreGetPayload<object>
): ToolDataStore<ARGS, DATA> {
  return {
    key: row.key,
    chatId: row.chatId,
    owner: row.owner,
    timestamp: row.timestamp,
    tool: {
      success: row.toolSuccess,
      name: row.toolName,
      args: row.toolArgs as ARGS,
      data: row.toolData as DATA,
    },
  };
}
