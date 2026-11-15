import { Redis } from "@upstash/redis";

/**
 * Shared Upstash Redis REST client. Stateless over HTTP, so one module-level
 * instance is safe to reuse across requests and hot reloads.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});
