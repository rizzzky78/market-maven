import { z } from "zod";
import { Document } from "@mendable/firecrawl-js";
import { scrapeInputSchema } from "../api/schema/firecrawl";

/**
 * Type definition for a scrape request.
 */
export type ScrapeRequest = z.infer<typeof scrapeInputSchema>;

/**
 * A successful scrape: the Firecrawl v2 `Document` plus the `success` flag of
 * the v1 response shape, which scrape results already cached in Redis use.
 *
 * @template T - The type of the structured `json` output, when requested.
 */
export type ScrapeResponse<T = unknown> = Document & {
  success: true;
  json?: T;
};

/**
 * Defines the structure of an error response in the Firecrawl system.
 */
export type ErrorResponse = {
  /**
   * Indicates whether the operation was successful (always false for errors).
   */
  success: false;

  /**
   * The type or category of error.
   */
  error: string;

  /**
   * A descriptive error message.
   */
  message: string;
};

/**
 * Configuration options for server actions in the Firecrawl system.
 */
export type FirecrawlConfig = {
  /**
   * Default wait time for requests in milliseconds.
   */
  defaultWaitTime: number;

  /**
   * Maximum number of retries for a request.
   */
  maxRetries: number;

  /**
   * Delay between retry attempts in milliseconds.
   */
  retryDelay: number;
};
