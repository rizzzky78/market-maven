"use server";

import {
  crawlUrlInputSchema,
  mapUrlInputSchema,
  scrapeInputSchema,
} from "@/lib/api/schema/firecrawl";
/**
 * This module is run on server
 */

import {
  ScrapeRequest,
  FireCrawlResponse,
  FirecrawlAction,
  CrawlRequest,
  MapRequest,
  RequestProperties,
  FirecrawlConfig,
  ErrorResponse,
} from "@/lib/types/firecrawl";
import logger from "@/lib/utility/logger";
import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

const DEFAULT_CONFIG: FirecrawlConfig = {
  defaultWaitTime: 2000,
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * Initializes the Firecrawl app with the API key from environment variables.
 * Throws an error if the API key is not found.
 * @returns  Instance of FirecrawlApp.
 */
function initializeFirecrawl() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("Firecrawl API key is required");
  }
  return new FirecrawlApp({ apiKey });
}

/**
 * Executes an asynchronous operation with retry logic.
 * @template T
 * @param {() => Promise<T>} operation - The asynchronous operation to execute.
 * @param {string} actionType - A label for the action being executed.
 * @param {Record<string, any>} context - Additional context for logging purposes.
 * @param {FirecrawlConfig} [config=DEFAULT_CONFIG] - Configuration for retries.
 * @returns {Promise<T>} The result of the operation or an error response after retries.
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  actionType: string,
  context: Record<string, any>,
  config: FirecrawlConfig = DEFAULT_CONFIG
): Promise<T> {
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await operation();
      if (!result) {
        throw new Error(`${actionType} returned no data`);
      }
      return result;
    } catch (error) {
      if (attempt === config.maxRetries) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: actionType,
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
        return errorResponse as T;
      }

      logger.warn(`${actionType} attempt ${attempt} failed`, {
        ...context,
        error: error instanceof Error ? error.message : error,
        nextAttemptIn: config.retryDelay * attempt,
      });

      await new Promise((resolve) =>
        setTimeout(resolve, config.retryDelay * attempt)
      );
    }
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: actionType,
    message: "Operation failed after max retries",
  };
  return errorResponse as T;
}

/**
 * Scrapes a URL using the provided payload and configuration.
 * @param {ScrapeRequest} payload - The payload containing scrape parameters.
 * @param {Partial<FirecrawlConfig>} [config={}] - Optional configuration overrides.
 * @returns The response of the scrape operation.
 */
export async function scrapeUrl(
  payload: ScrapeRequest,
  config: Partial<FirecrawlConfig> = {}
) {
  try {
    const validatedPayload = scrapeInputSchema.parse(payload);
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const app = initializeFirecrawl();

    const scrapeOptions = {
      waitFor: validatedPayload.waitFor ?? mergedConfig.defaultWaitTime,
      formats: validatedPayload.formats,
      extract: validatedPayload.formats.includes("extract")
        ? {
            systemPrompt: validatedPayload.systemPrompt,
            prompt: validatedPayload.prompt,
          }
        : undefined,
    };

    const response = await executeWithRetry(
      () => app.scrapeUrl(validatedPayload.url, scrapeOptions),
      "Scrape",
      { url: validatedPayload.url },
      mergedConfig
    );

    if (!response.success) {
      throw new Error("Scrape operation failed");
    }

    return response as FireCrawlResponse<FirecrawlAction.Scrape>;
  } catch (error) {
    return handleError(error, {
      action: FirecrawlAction.Scrape,
      properties: payload,
    });
  }
}

/**
 * Crawls a URL using the provided payload and configuration.
 * @param {CrawlRequest} payload - The payload containing crawl parameters.
 * @param {Partial<FirecrawlConfig>} [config={}] - Optional configuration overrides.
 * @returns The response of the crawl operation.
 */
export async function crawlUrl(
  payload: CrawlRequest,
  config: Partial<FirecrawlConfig> = {}
) {
  try {
    const validatedPayload = crawlUrlInputSchema.parse(payload);
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const app = initializeFirecrawl();

    const crawlOptions = {
      maxDepth: validatedPayload.maxDepth ?? 1,
      limit: validatedPayload.limit ?? 10,
      allowBackwardLinks: validatedPayload.allowBackwardLinks ?? false,
      allowExternalLinks: validatedPayload.allowExternalLinks ?? false,
      ignoreSitemap: validatedPayload.ignoreSitemap ?? false,
      scrapeOptions: {
        waitFor: validatedPayload.waitFor ?? mergedConfig.defaultWaitTime,
        formats: validatedPayload.formats,
      },
    };

    const response = await executeWithRetry(
      () => app.crawlUrl(validatedPayload.url, crawlOptions),
      "Crawl",
      { url: validatedPayload.url },
      mergedConfig
    );

    if (!response.success) {
      throw new Error("Crawl operation failed");
    }

    return response as FireCrawlResponse<FirecrawlAction.Crawl>;
  } catch (error) {
    return handleError(error, {
      action: FirecrawlAction.Crawl,
      properties: payload,
    });
  }
}

/**
 * Maps a URL using the provided payload and configuration.
 * @param {MapRequest} payload - The payload containing map parameters.
 * @param {Partial<FirecrawlConfig>} [config={}] - Optional configuration overrides.
 * @returns The response of the map operation.
 */
export async function mapUrl(
  payload: MapRequest,
  config: Partial<FirecrawlConfig> = {}
) {
  try {
    const validatedPayload = mapUrlInputSchema.parse(payload);
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const app = initializeFirecrawl();

    const mapOptions = {
      limit: validatedPayload.limit ?? 10,
    };

    const response = await executeWithRetry(
      () => app.mapUrl(validatedPayload.url, mapOptions),
      "Map",
      { url: validatedPayload.url },
      mergedConfig
    );

    if (!response.success) {
      throw new Error("Map operation failed");
    }

    return response as FireCrawlResponse<FirecrawlAction.Map>;
  } catch (error) {
    return handleError(error, {
      action: FirecrawlAction.Map,
      properties: payload,
    });
  }
}

/**
 * Handles errors during operations, logging the error and returning a standardized response.
 * @param {unknown} error - The error encountered.
 * @param {RequestProperties} input - The input that caused the error.
 * @returns {ErrorResponse} A standardized error response.
 */
function handleError(error: unknown, input: RequestProperties): ErrorResponse {
  if (error instanceof z.ZodError) {
    logger.error("Input validation failed", {
      errors: error.errors,
      input,
    });

    return {
      success: false,
      error: "ValidationError",
      message: JSON.stringify(error.errors),
    };
  }

  logger.error("Firecrawl operation error", {
    error: error instanceof Error ? error.message : error,
    input,
  });

  return {
    success: false,
    error: "OperationError",
    message: error instanceof Error ? error.message : "Unknown error occurred",
  };
}
