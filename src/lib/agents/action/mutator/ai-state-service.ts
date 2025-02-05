"use server";

import {
  AIState,
  ChatProperties,
  MessageProperty,
  ValueOrUpdater,
} from "@/lib/types/ai";
import { Redis } from "@upstash/redis";
import { getServerSession } from "next-auth";
import { cache } from "react";
import { v4 as uuidv4, v4 } from "uuid";
import { getChat, getChats } from "../chat-service";
import { saveAIState } from "./save-ai-state";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CACHE_DURATION = 86400;

async function getRedisKey(override?: string) {
  const session = await getServerSession();
  const username = session?.user?.email;
  const fallback = "anonymous@gmail.com";

  const uniqueUserName = username ? username : override ? override : fallback;

  return `ai_state:${uniqueUserName}`;
}

export async function getServerState(
  username?: string
): Promise<AIState | null> {
  try {
    return await redis.get<AIState>(await getRedisKey(username));
  } catch (error) {
    console.error("Failed to get server state:", error);
    return null;
  }
}

export async function initializeServerState(
  username: string,
  initialState?: Partial<AIState>
): Promise<AIState> {
  const defaultState: AIState = {
    chatId: uuidv4(),
    username,
    messages: [],
    isSharedPage: false,
    ...initialState,
  };

  const existingState = await getServerState(username);
  if (existingState) {
    return existingState;
  }

  await updateServerState(defaultState);
  return defaultState;
}

export async function updateServerState(
  newState: ValueOrUpdater<AIState>
): Promise<void> {
  try {
    const currentState = await getServerState();
    const updatedState =
      typeof newState === "function" && currentState
        ? newState(currentState)
        : newState;

    await redis.set(await getRedisKey(), updatedState, {
      ex: CACHE_DURATION,
    });

    if (currentState) {
      await saveAIState(currentState);
    }
  } catch (error) {
    console.error("Failed to update server state:", error);
    throw new Error("Failed to update state");
  }
}

export const getInitialState = cache(
  async (
    slugChatId?: string
  ): Promise<{
    username: string;
    chats: ChatProperties[];
    initialState: AIState;
  }> => {
    const session = await getServerSession();
    const username = session?.user?.email || "anonymous@gmail.com";
    const chats = await getChats(username);

    let chatProp: {
      chatId: string;
      username: string;
      messages: MessageProperty[];
    } = {
      chatId: v4(),
      username,
      messages: [],
    };

    if (slugChatId) {
      const chat = await getChat(slugChatId);
      if (chat) {
        chatProp = {
          username,
          chatId: chat.chatId,
          messages: chat.messages,
        };
      }
    }

    // Try to get existing state first
    const existingState = await getServerState(username);

    if (existingState) {
      return {
        username,
        chats,
        initialState: {
          chatId: chatProp.chatId,
          username: chatProp.username,
          messages: chatProp.messages,
        },
      };
    }

    // Initialize new state if none exists
    const initialState = await initializeServerState(username, {
      chatId: v4(),
      username,
      messages: chatProp.messages,
    });

    return { username, chats, initialState };
  }
);
