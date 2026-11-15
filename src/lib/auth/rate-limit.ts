import type { BetterAuthOptions } from "better-auth";
import { redis } from "@/database/redis";

/**
 * Fixed-window counter: increments the key, starts its TTL on the first hit
 * and returns the count with the seconds left. One script keeps it atomic,
 * so concurrent requests cannot all pass a stale read.
 */
const CONSUME_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('TTL', KEYS[1])
if ttl < 0 then redis.call('EXPIRE', KEYS[1], ARGV[1]) ttl = tonumber(ARGV[1]) end
return {count, ttl}
`;

/**
 * Records one hit against `key` and reports whether it is within `max` per
 * `window` seconds. Shared by Better Auth's rate limiter and the signup
 * server actions, so limits hold across every app instance.
 */
export async function consumeRateLimit(
  key: string,
  rule: { window: number; max: number }
): Promise<{ allowed: boolean; retryAfter: number | null }> {
  const [count, ttl] = await redis.eval<[string], [number, number]>(
    CONSUME_SCRIPT,
    [`auth-rl:${key}`],
    [String(rule.window)]
  );
  return count <= rule.max
    ? { allowed: true, retryAfter: null }
    : { allowed: false, retryAfter: Math.max(ttl, 1) };
}

/** Better Auth rate limit storage backed by Upstash Redis. */
export const redisRateLimitStorage: NonNullable<
  NonNullable<BetterAuthOptions["rateLimit"]>["customStorage"]
> = {
  consume: consumeRateLimit,
};

/** Formats a retry delay for user-facing messages. */
export function formatRetryAfter(seconds: number | null): string {
  if (!seconds || seconds < 60) return "a minute";
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minutes`;
}
