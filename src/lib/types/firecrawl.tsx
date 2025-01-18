import { z } from "zod";
import {
  crawlUrlInputSchema,
  mapUrlInputSchema,
  scrapeInputSchema,
} from "../api/schema/firecrawl";
import {
  ScrapeResponse,
  CrawlResponse,
  MapResponse,
} from "@mendable/firecrawl-js";

/**
 * Type definition for a scrape request.
 */
export type ScrapeRequest = z.infer<typeof scrapeInputSchema>;

/**
 * Type definition for a crawl request.
 */
export type CrawlRequest = z.infer<typeof crawlUrlInputSchema>;

/**
 * Type definition for a map request.
 */
export type MapRequest = z.infer<typeof mapUrlInputSchema>;

export type RequestProperties<T = FirecrawlAction> = {
  action: T;
  properties: ScrapeRequest | CrawlRequest | MapRequest;
};

/**
 * Represents the possible actions supported by the Firecrawl system.
 */
export enum FirecrawlAction {
  /**
   * Represents a scrape action.
   */
  Scrape = "scrape",

  /**
   * Represents a crawl action.
   */
  Crawl = "crawl",

  /**
   * Represents a map action.
   */
  Map = "map",
}

/**
 * Configuration options for the Firecrawl system.
 */
export type FireCrawlOptions = {
  /**
   * API key for authenticating Firecrawl requests.
   */
  apiKey?: string;

  /**
   * Configuration options for controlling retries and timeouts.
   */
  config?: Partial<{
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
  }>;
};

/**
 * Defines the structure of a Firecrawl response based on the action type.
 * @template T - The type of action for which the response is defined.
 */
export type FireCrawlResponse<T extends FirecrawlAction> =
  T extends FirecrawlAction.Scrape
    ? ScrapeResponse
    : T extends FirecrawlAction.Crawl
    ? CrawlResponse
    : T extends FirecrawlAction.Map
    ? MapResponse
    : never;

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
