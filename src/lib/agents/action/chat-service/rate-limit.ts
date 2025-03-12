"use server";

import { Redis } from "@upstash/redis";
import { AIState, RateLimitResponse } from "@/lib/types/ai";
import { getServerSession } from "next-auth";

/**
 * Configuration for the rate limiting system.
 */
const RATE_LIMIT_CONFIG = {
  /** Maximum number of requests allowed per day for standard users */
  MAX_REQUESTS_PER_DAY: 36,

  /** Maximum allowed messages in a single conversation */
  MAX_CONVERSATION_LENGTH: 24,

  /** Additional request quota for first-time users */
  FIRST_TIME_BONUS_REQUESTS: 5,
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
 * Checks if a user is eligible to make a request based on rate limits
 *
 * This function performs several checks:
 * 1. Identifies the user based on email and IP address
 * 2. Determines if this is a first-time user for bonus allocation
 * 3. Checks current usage against daily request limits
 * 4. Checks current conversation length against maximum allowed
 * 5. If eligible, increments the user's request counter
 *
 * @param aiState - Current UI state containing the conversation messages
 * @returns A RateLimitResponse object with detailed eligibility information
 */
export async function checkRateLimit(
  aiState: AIState
): Promise<RateLimitResponse> {
  const filterUserMessage = aiState.messages.filter((m) => m.role !== "tool");

  try {
    // Get today's date in YYYY-MM-DD format for daily rate limiting
    const today = new Date().toISOString().split("T")[0];

    // Extract user identity information
    const session = await getServerSession();
    const userEmail = session?.user?.email || "anonymous";


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
        conversationLength: filterUserMessage.length,
        isFirstTimeUser: isFirstTimeUser,
      },
      remaining: {
        requests: effectiveLimit - currentCount,
        messages:
          RATE_LIMIT_CONFIG.MAX_CONVERSATION_LENGTH - filterUserMessage.length,
      },
      reset: {
        timestamp: endOfDay.getTime(),
        formatted: resetFormatted,
      },
    };

    // Check conversation length limit
    if (filterUserMessage.length >= RATE_LIMIT_CONFIG.MAX_CONVERSATION_LENGTH) {
      return {
        ...response,
        eligible: false,
        reason: "CONVERSATION_LIMIT_EXCEEDED",
      };
    }

    // Check requests per day limit
    if (currentCount >= effectiveLimit) {
      return {
        ...response,
        eligible: false,
        reason: "RPD_LIMIT_EXCEEDED",
      };
    }

    // If user is eligible, update the counters
    if (response.eligible) {
      // For first-time users, mark them as existing
      if (isFirstTimeUser) {
        await redis.set(userExistsKey, 1);
      }

      // Increment the request counter
      await redis.incr(rateLimitKey);

      // Set expiry to end of day if not already set
      const ttl = await redis.ttl(rateLimitKey);
      if (ttl < 0) {
        const secondsUntilEndOfDay = Math.floor(millisecondsUntilReset / 1000);
        await redis.expire(rateLimitKey, secondsUntilEndOfDay);
      }

      // Update the response with incremented values
      response.current.requests += 1;
      response.remaining.requests -= 1;
    }

    console.log(JSON.stringify(response, null, 2));

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
        conversationLength: filterUserMessage.length,
        isFirstTimeUser: false,
      },
      remaining: {
        requests: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY,
        messages:
          RATE_LIMIT_CONFIG.MAX_CONVERSATION_LENGTH - filterUserMessage.length,
      },
    };
  }
}
