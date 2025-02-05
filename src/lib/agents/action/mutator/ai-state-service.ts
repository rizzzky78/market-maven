"use server";

import { AIState, ValueOrUpdater } from "@/lib/types/ai";
import { Redis } from "@upstash/redis";
import { v4 as uuidv4 } from "uuid";

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
