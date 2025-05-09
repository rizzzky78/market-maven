"use server";

import { Redis } from "@upstash/redis";
import { AIState, RateLimitResponse } from "@/lib/types/ai";
import { getServerSession } from "next-auth";

/**
 * Configuration for the rate limiting system.
 */
const RATE_LIMIT_CONFIG = {
  /** Maximum number of requests allowed per day for standard users */
  MAX_REQUESTS_PER_DAY: 10,

  /** Maximum allowed messages in a single conversation */
  MAX_CONVERSATION_LENGTH: 14,

  /** Additional request quota for first-time users */
  FIRST_TIME_BONUS_REQUESTS: 5,

  /** Cache TTL for rate limit data (in seconds) */
  CACHE_TTL: 60, // 1 minute cache
};

/**
 * Redis client instance for performing rate limit operations
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

/**
 * Formats the time remaining until rate limit reset
 *
 * @param millisecondsUntilReset - Milliseconds until the rate limit resets
 * @returns A string in format "Xh Ym" representing hours and minutes until reset
 */
function formatResetTime(millisecondsUntilReset: number): string {
  const hoursUntilReset = Math.floor(millisecondsUntilReset / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor(
    (millisecondsUntilReset % (1000 * 60 * 60)) / (1000 * 60)
  );
  return `${hoursUntilReset}h ${minutesUntilReset}m`;
}

/**
 * Calculates the end of the current day in UTC
 *
 * @returns Date object representing the end of the current day (23:59:59.999 UTC)
 */
function getEndOfDayUTC(): Date {
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  return endOfDay;
}

/**
 * Gets the cached rate limit status for a user if available
 *
 * @param userEmail - User's email address
 * @param today - Today's date in YYYY-MM-DD format
 * @returns Cached rate limit response or null if not found
 */
async function getCachedRateLimit(
  userEmail: string,
  today: string
): Promise<RateLimitResponse | null> {
  const cacheKey = `ratelimit:cache:${userEmail}:${today}`;
  const cachedData = await redis.get<RateLimitResponse>(cacheKey);
  return cachedData || null;
}

/**
 * Cache the rate limit response for a user
 *
 * @param userEmail - User's email address
 * @param today - Today's date in YYYY-MM-DD format
 * @param response - Rate limit response to cache
 */
async function cacheRateLimit(
  userEmail: string,
  today: string,
  response: RateLimitResponse
): Promise<void> {
  const cacheKey = `ratelimit:cache:${userEmail}:${today}`;
  await redis.set(cacheKey, response, { ex: RATE_LIMIT_CONFIG.CACHE_TTL });
}

/**
 * Asynchronously increments the user's request counter without blocking
 *
 * @param userEmail - User's email address
 * @param today - Today's date in YYYY-MM-DD format
 * @param isFirstTimeUser - Whether this is the user's first time using the service
 */
async function incrementRequestCounterAsync(
  userEmail: string,
  today: string,
  isFirstTimeUser: boolean
): Promise<void> {
  try {
    const userExistsKey = `user:${userEmail}:exists`;
    const rateLimitKey = `ratelimit:${userEmail}:${today}`;

    // For first-time users, mark them as existing
    if (isFirstTimeUser) {
      await redis.set(userExistsKey, 1);
    }

    // Increment the request counter
    await redis.incr(rateLimitKey);

    // Set expiry to end of day if not already set
    const ttl = await redis.ttl(rateLimitKey);
    if (ttl < 0) {
      const millisecondsUntilReset = getEndOfDayUTC().getTime() - Date.now();
      const secondsUntilEndOfDay = Math.floor(millisecondsUntilReset / 1000);
      await redis.expire(rateLimitKey, secondsUntilEndOfDay);
    }

    // Invalidate the cache to force a refresh on next check
    const cacheKey = `ratelimit:cache:${userEmail}:${today}`;
    await redis.del(cacheKey);
  } catch (error) {
    console.error("Error incrementing request counter:", error);
  }
}

/**
 * Checks if a user is eligible to make a request based on rate limits
 * Uses cached data when available to improve performance
 *
 * @param aiState - Current AI state containing the conversation messages
 * @returns A RateLimitResponse object with detailed eligibility information
 */
export async function checkRateLimit(
  aiState: AIState
): Promise<RateLimitResponse> {
  const filterUserMessage = aiState.messages.filter((m) => m.role === "user");

  try {
    // Get today's date in YYYY-MM-DD format for daily rate limiting
    const today = new Date().toISOString().split("T")[0];

    // Extract user identity information
    const session = await getServerSession();
    const userEmail = session?.user?.email || "anonymous";

    // Check for cached rate limit data
    const cachedResponse = await getCachedRateLimit(userEmail, today);
    if (cachedResponse) {
      // Update conversation length in cached response
      cachedResponse.current.conversationLength = filterUserMessage.length + 1;
      cachedResponse.remaining.messages =
        RATE_LIMIT_CONFIG.MAX_CONVERSATION_LENGTH -
        filterUserMessage.length +
        1;

      // Check conversation length limit
      if (
        filterUserMessage.length + 1 >=
        RATE_LIMIT_CONFIG.MAX_CONVERSATION_LENGTH
      ) {
        cachedResponse.eligible = false;
        cachedResponse.reason = "CONVERSATION_LIMIT_EXCEEDED";
      }

      return cachedResponse;
    }

    // Create compound identifier and Redis keys
    const userExistsKey = `user:${userEmail}:exists`;
    const rateLimitKey = `ratelimit:${userEmail}:${today}`;

    // Check if this is a first-time user
    const userExists = await redis.exists(userExistsKey);
    const isFirstTimeUser = userExists === 0;

    // Get current request count for today
    const currentCount = (await redis.get<number>(rateLimitKey)) || 0;

    // Calculate time until rate limit reset
    const endOfDay = getEndOfDayUTC();
    const millisecondsUntilReset = endOfDay.getTime() - Date.now();
    const resetFormatted = formatResetTime(millisecondsUntilReset);

    // Calculate effective limit (with first-time bonus if applicable)
    const effectiveLimit = isFirstTimeUser
      ? RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY +
        RATE_LIMIT_CONFIG.FIRST_TIME_BONUS_REQUESTS
      : RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY;

    // Create base response object
    const response: RateLimitResponse = {
      eligible: true,
      limits: {
        requestsPerDay: effectiveLimit,
        conversationLength: RATE_LIMIT_CONFIG.MAX_CONVERSATION_LENGTH,
      },
      current: {
        requests: currentCount,
        conversationLength: filterUserMessage.length + 1,
        isFirstTimeUser: isFirstTimeUser,
      },
      remaining: {
        requests: effectiveLimit - currentCount,
        messages:
          RATE_LIMIT_CONFIG.MAX_CONVERSATION_LENGTH -
          filterUserMessage.length +
          1,
      },
      reset: {
        timestamp: endOfDay.getTime(),
        formatted: resetFormatted,
      },
    };

    // Check conversation length limit
    if (
      filterUserMessage.length + 1 >=
      RATE_LIMIT_CONFIG.MAX_CONVERSATION_LENGTH
    ) {
      response.eligible = false;
      response.reason = "CONVERSATION_LIMIT_EXCEEDED";
    }

    // Check requests per day limit
    if (currentCount >= effectiveLimit) {
      response.eligible = false;
      response.reason = "RPD_LIMIT_EXCEEDED";
    }

    // Cache the response for future checks
    await cacheRateLimit(userEmail, today, response);

    return response;
  } catch (error) {
    console.error("Rate limit check error:", error);

    // Default to allowing the request in case of error
    return {
      eligible: true,
      limits: {
        requestsPerDay: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY,
        conversationLength: RATE_LIMIT_CONFIG.MAX_CONVERSATION_LENGTH,
      },
      current: {
        requests: 0,
        conversationLength: filterUserMessage.length + 1,
        isFirstTimeUser: false,
      },
      remaining: {
        requests: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY,
        messages:
          RATE_LIMIT_CONFIG.MAX_CONVERSATION_LENGTH -
          filterUserMessage.length +
          1,
      },
    };
  }
}

/**
 * Records a successful request asynchronously without blocking the user request
 * This function should be called after a successful request has been processed
 *
 * @param aiState - Current AI state containing the conversation messages
 */
export async function recordSuccessfulRequest(aiState: AIState): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const session = await getServerSession();
    const userEmail = session?.user?.email || "anonymous";

    // Check if this is a first-time user
    const userExistsKey = `user:${userEmail}:exists`;
    const userExists = await redis.exists(userExistsKey);
    const isFirstTimeUser = userExists === 0;

    // Increment counter asynchronously
    incrementRequestCounterAsync(userEmail, today, isFirstTimeUser).catch(
      (error) => {
        console.error("Failed to increment request counter:", error);
      }
    );
  } catch (error) {
    console.error("Error recording successful request:", error);
  }
}
