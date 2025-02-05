"use server";

import { AIState, ChatProperties, ValueOrUpdater } from "@/lib/types/ai";
import { Redis } from "@upstash/redis";
import { getServerSession } from "next-auth";
import { cache } from "react";
import { v4 as uuidv4, v4 } from "uuid";
import { getChats } from "../chat-service";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CACHE_DURATION = 86400;
const getRedisKey = (username: string) => `ai_state:${username}`;

export async function getServerState(
  username: string
): Promise<AIState | null> {
  try {
    return await redis.get<AIState>(getRedisKey(username));
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

  await updateServerState(username, defaultState);
  return defaultState;
}

export async function updateServerState(
  username: string,
  newState: ValueOrUpdater<AIState>
): Promise<void> {
  try {
    const currentState = await getServerState(username);
    const updatedState =
      typeof newState === "function" && currentState
        ? newState(currentState)
        : newState;

    await redis.set(getRedisKey(username), updatedState, {
      ex: CACHE_DURATION,
    });
  } catch (error) {
    console.error("Failed to update server state:", error);
    throw new Error("Failed to update state");
  }
}

export const getInitialState = cache(
  async (): Promise<{
    username: string;
    chats: ChatProperties[];
    initialState: AIState;
  }> => {
    const session = await getServerSession();
    const username = session?.user?.email || "anonymous@gmail.com";
    const chats = await getChats(username);

    // Try to get existing state first
    const existingState = await getServerState(username);

    if (existingState) {
      return { username, chats, initialState: existingState };
    }

    // Initialize new state if none exists
    const initialState = await initializeServerState(username, {
      chatId: v4(),
      username,
      messages: [],
    });

    return { username, chats, initialState };
  }
);
