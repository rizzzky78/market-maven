import { AIState } from "@/lib/types/ai";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

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
 * Redis key format constants
 */
const REDIS_KEY_FORMAT = {
  USER_DAILY_REQUESTS: "user:{username}:daily-requests",
  USER_LAST_RESET: "user:{username}:last-reset",
};

/**
 * Response statuses for rate limit checks
 */
enum RateLimitStatus {
  OK = "OK",
  LIMIT_EXCEEDED = "LIMIT_EXCEEDED",
}

/**
 * Result of a rate limit check
 */
interface RateLimitResult {
  status: RateLimitStatus;
  remaining: number;
  reset: Date;
}

/**
 * Checks if a user has exceeded their rate limit
 * @param username User identifier
 * @returns Promise with rate limit check result
 */
async function checkUserRateLimit(username: string): Promise<RateLimitResult> {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const userRequestsKey = REDIS_KEY_FORMAT.USER_DAILY_REQUESTS.replace(
    "{username}",
    username
  );
  const userLastResetKey = REDIS_KEY_FORMAT.USER_LAST_RESET.replace(
    "{username}",
    username
  );

  // Check when the user's count was last reset
  const lastReset = await redis.get<number>(userLastResetKey);

  // If last reset was before today or doesn't exist, reset the counter
  if (!lastReset || lastReset < today) {
    await redis.set(userRequestsKey, 0);
    await redis.set(userLastResetKey, today);
  }

  // Get current request count
  const currentRequests = (await redis.get<number>(userRequestsKey)) || 0;

  // Check if user has exceeded their limit
  if (currentRequests >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY) {
    const resetDate = new Date();
    resetDate.setDate(resetDate.getDate() + 1);
    resetDate.setHours(0, 0, 0, 0);

    return {
      status: RateLimitStatus.LIMIT_EXCEEDED,
      remaining: 0,
      reset: resetDate,
    };
  }

  // User has not exceeded limit
  return {
    status: RateLimitStatus.OK,
    remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY - currentRequests,
    reset: new Date(today + 24 * 60 * 60 * 1000), // Next day
  };
}

/**
 * Increments a user's request count
 * @param username User identifier
 * @returns Promise with updated count
 */
async function incrementUserRequestCount(username: string): Promise<number> {
  const userRequestsKey = REDIS_KEY_FORMAT.USER_DAILY_REQUESTS.replace(
    "{username}",
    username
  );
  return await redis.incr(userRequestsKey);
}

/**
 * Middleware to check rate limits before processing requests
 * @param req Next.js request object
 * @param payload AI state containing user information
 * @returns Next.js response or null to continue processing
 */
export async function rateLimitMiddleware(req: Request, payload: AIState) {
  const { username } = payload;

  if (!username) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Check if user has exceeded rate limit
  const rateLimitResult = await checkUserRateLimit(username);

  // If rate limit exceeded, return error response
  if (rateLimitResult.status === RateLimitStatus.LIMIT_EXCEEDED) {
    const resetTime = rateLimitResult.reset.toISOString();
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: "You have reached your daily request limit.",
        reset: resetTime,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit":
            RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": resetTime,
        },
      }
    );
  }

  // Increment the user's request count since they haven't exceeded the limit
  await incrementUserRequestCount(username);

  // Continue with request processing
  return null;
}

/**
 * Gets the current rate limit status for a user
 * @param username User identifier
 * @returns Promise with rate limit information
 */
export async function getUserRateLimitStatus(username: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
}> {
  const result = await checkUserRateLimit(username);
  const userRequestsKey = REDIS_KEY_FORMAT.USER_DAILY_REQUESTS.replace(
    "{username}",
    username
  );
  const used = (await redis.get<number>(userRequestsKey)) || 0;

  return {
    used,
    limit: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY,
    remaining: result.remaining,
    resetAt: result.reset.toISOString(),
  };
}
