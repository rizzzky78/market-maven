"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRedisClient, RedisWrapper } from "@/database/redis";
import { ChatProperties } from "@/lib/types/ai";
import logger from "@/lib/utility/logger";

async function getRedis(): Promise<RedisWrapper> {
  return await getRedisClient();
}

export async function getChats(userId: string | null = "anonymous") {
  if (!userId) {
    return [];
  }

  try {
    const redis = await getRedis();
    const chats = await redis.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true,
    });

    if (chats.length === 0) {
      return [];
    }

    const results = await Promise.all(
      chats.map(async (chatKey) => {
        const chat = await redis.hgetall(chatKey);
        return chat;
      })
    );

    const userChat = results
      .filter((result): result is Record<string, any> => {
        if (result === null || Object.keys(result).length === 0) {
          return false;
        }
        return true;
      })
      .map((chat) => {
        const plainChat = { ...chat };
        if (typeof plainChat.messages === "string") {
          try {
            plainChat.messages = JSON.parse(plainChat.messages);
          } catch (error) {
            console.error(error);
            logger.error("Error when parsing plain chat in <getChats()>");

            plainChat.messages = [];
          }
        }
        if (plainChat.createdAt && !(plainChat.createdAt instanceof Date)) {
          plainChat.createdAt = new Date(plainChat.createdAt);
        }
        return plainChat as ChatProperties;
      });

    logger.info("User chat saved!", { userId });

    return userChat;
  } catch (error) {
    console.error(error);
    logger.error("Error getting the user chat in <getChats()>");

    return [];
  }
}

export async function getChat(id: string) {
  const redis = await getRedis();
  const chat = await redis.hgetall<ChatProperties>(`chat:${id}`);

  if (!chat) {
    return null;
  }

  // Parse the messages if they're stored as a string
  if (typeof chat.messages === "string") {
    try {
      chat.messages = JSON.parse(chat.messages);
    } catch (error) {
      console.error(error);
      logger.error("Error when parsing chat messages in <getChat()>");

      chat.messages = [];
    }
  }

  // Ensure messages is always an array
  if (!Array.isArray(chat.messages)) {
    chat.messages = [];
  }

  return chat;
}

export async function clearChats(
  userId: string = "anonymous"
): Promise<{ error?: string }> {
  const redis = await getRedis();
  const chats = await redis.zrange(`user:chat:${userId}`, 0, -1);
  if (!chats.length) {
    return { error: "No chats to clear" };
  }
  const pipeline = redis.pipeline();

  for (const chat of chats) {
    pipeline.del(chat);
    pipeline.zrem(`user:chat:${userId}`, chat);
  }

  await pipeline.exec();

  revalidatePath("/chat");
  redirect("/chat");
}

export async function saveChat(userId: string, chat: ChatProperties) {
  if (!userId) {
    userId = "anonymous";
  }
  try {
    const redis = await getRedis();
    const pipeline = redis.pipeline();

    const chatToSave = {
      ...chat,
      messages: JSON.stringify(chat.messages, null, 2),
    };

    pipeline.hmset(`chat:${chat.chatId}`, chatToSave);
    pipeline.zadd(`user:chat:${userId}`, Date.now(), `chat:${chat.chatId}`);

    const results = await pipeline.exec();
    logger.info("User chat saved successfully!");
    return results;
  } catch (error) {
    console.error(error);
    logger.error("Error when save the chat properties in <saveChat()>");
  }
}

export async function getSharedChat(id: string) {
  const redis = await getRedis();
  const chat = await redis.hgetall<ChatProperties>(`chat:${id}`);

  if (!chat || !chat.sharePath) {
    return null;
  }

  return chat;
}

export async function shareChat(id: string, userId: string = "anonymous") {
  const redis = await getRedis();
  const chat = await redis.hgetall<ChatProperties>(`chat:${id}`);

  if (!chat || chat.userId !== userId) {
    return null;
  }

  const payload = {
    ...chat,
    sharePath: `/share/c/${id}`,
  };

  await redis.hmset(`chat:${id}`, payload);

  return payload;
}
