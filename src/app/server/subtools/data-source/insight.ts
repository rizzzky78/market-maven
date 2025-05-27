import { dataSourceInsightSchema } from "@/lib/agents/schema/ds-insight";
import {
  imagesSearch,
  shoppingSearch,
  videosSearch,
  webSearch,
} from "@/lib/agents/tools/api/serper";
import {
  SerperImagesSearchResponse,
  SerperShoppingSearchResponse,
  SerperVideosSearchResponse,
  SerperWebSearchResponse,
} from "@/lib/types/serper";
import { DataSourceInsight, UnifiedSubToolResult } from "@/lib/types/subtools";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

// Types and interfaces
export type MarketSource = "global" | "shopee";

export type InsightPayload = {
  query: string;
  marketSource: MarketSource;
  options?: SearchOptions;
};

export type SearchOptions = {
  maxRetries?: number;
  timeout?: number;
  includeImages?: boolean;
  includeVideos?: boolean;
  includeShopping?: boolean;
};

export type SearchQueryPayload = {
  q: string;
  gl?: string;
  hl?: string;
  num?: number;
};

export type SearchResults = {
  web_search: SerperWebSearchResponse;
  shopping: SerperShoppingSearchResponse;
  images: SerperImagesSearchResponse;
  videos: SerperVideosSearchResponse;
};

export type ModelPayload = {
  query: string;
  useShopee: boolean;
  marketSource: MarketSource;
  payloadDataset: SearchResults;
  timestamp: string;
};

// Error classes
export class ProductInsightError extends Error {
  constructor(message: string, public code: string, public cause?: Error) {
    super(message);
    this.name = "ProductInsightError";
  }
}

export class SearchTimeoutError extends ProductInsightError {
  constructor(searchType: string, timeout: number) {
    super(
      `${searchType} search timed out after ${timeout}ms`,
      "SEARCH_TIMEOUT"
    );
  }
}

export class InvalidQueryError extends ProductInsightError {
  constructor(query: string) {
    super(`Invalid query provided: ${query}`, "INVALID_QUERY");
  }
}

// Constants
const DEFAULT_OPTIONS: Required<SearchOptions> = {
  maxRetries: 3,
  timeout: 10000,
  includeImages: true,
  includeVideos: true,
  includeShopping: true,
};

const SHOPEE_MARKETS = {
  indonesia: "id",
  singapore: "sg",
  malaysia: "my",
  thailand: "th",
  philippines: "ph",
  vietnam: "vn",
} as const;

// Utility functions
function validateQuery(query: string): void {
  if (!query || typeof query !== "string") {
    throw new InvalidQueryError(query);
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    throw new InvalidQueryError("Query cannot be empty");
  }

  if (trimmedQuery.length > 500) {
    throw new InvalidQueryError("Query too long (max 500 characters)");
  }
}

function buildSearchQuery(
  query: string,
  marketSource: MarketSource
): SearchQueryPayload {
  const isGlobalSource = marketSource === "global";

  let searchQuery = query.trim();

  if (!isGlobalSource) {
    // Add Shopee-specific terms for better targeting
    searchQuery = `${searchQuery} shopee marketplace`;
  } else {
    // Exclude Shopee for global searches to get diverse results
    searchQuery = `${searchQuery} -shopee`;
  }

  return {
    q: searchQuery,
    gl: !isGlobalSource ? SHOPEE_MARKETS.indonesia : undefined,
    hl: !isGlobalSource ? "id" : "en",
    num: 10,
  };
}

async function executeWithTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  operation: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new SearchTimeoutError(operation, timeout));
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]);
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  operation: string
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw new ProductInsightError(
          `Failed ${operation} after ${maxRetries} attempts`,
          "MAX_RETRIES_EXCEEDED",
          lastError
        );
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

async function performSearches(
  queryPayload: SearchQueryPayload,
  options: Required<SearchOptions>
): Promise<SearchResults> {
  const searchPromises: Record<keyof SearchResults, Promise<any>> = {
    web_search: executeWithRetry(
      () =>
        executeWithTimeout(
          webSearch(queryPayload),
          options.timeout,
          "web search"
        ),
      options.maxRetries,
      "web search"
    ),
    shopping: options.includeShopping
      ? executeWithRetry(
          () =>
            executeWithTimeout(
              shoppingSearch(queryPayload),
              options.timeout,
              "shopping search"
            ),
          options.maxRetries,
          "shopping search"
        )
      : Promise.resolve(null),
    images: options.includeImages
      ? executeWithRetry(
          () =>
            executeWithTimeout(
              imagesSearch(queryPayload),
              options.timeout,
              "images search"
            ),
          options.maxRetries,
          "images search"
        )
      : Promise.resolve(null),
    videos: options.includeVideos
      ? executeWithRetry(
          () =>
            executeWithTimeout(
              videosSearch(queryPayload),
              options.timeout,
              "videos search"
            ),
          options.maxRetries,
          "videos search"
        )
      : Promise.resolve(null),
  };

  const results = await Promise.allSettled([
    searchPromises.web_search,
    searchPromises.shopping,
    searchPromises.images,
    searchPromises.videos,
  ]);

  const [webResult, shoppingResult, imagesResult, videosResult] = results;

  return {
    web_search: webResult.status === "fulfilled" ? webResult.value : null,
    shopping:
      shoppingResult.status === "fulfilled" ? shoppingResult.value : null,
    images: imagesResult.status === "fulfilled" ? imagesResult.value : null,
    videos: videosResult.status === "fulfilled" ? videosResult.value : null,
  };
}

function buildModelPayload(
  query: string,
  marketSource: MarketSource,
  searchResults: SearchResults
): ModelPayload {
  return {
    query: query.trim(),
    useShopee: marketSource === "shopee",
    marketSource,
    payloadDataset: searchResults,
    timestamp: new Date().toISOString(),
  };
}

function buildSystemInstruction(marketSource: MarketSource): string {
  const baseInstruction = `You are an expert product data extraction specialist with deep knowledge of e-commerce markets and consumer behavior.

Your primary task is to analyze comprehensive search results and extract detailed product information with high accuracy according to the provided schema and ruleset.

Key Requirements:
1. Extract the most relevant and accurate product data from the payload dataset
2. Prioritize recent and authoritative sources
3. Ensure data consistency and completeness
4. Handle missing or incomplete data gracefully`;

  const marketSpecificInstruction =
    marketSource === "shopee"
      ? `

SHOPEE MODE ACTIVATED:
- Focus on Shopee marketplace data and Southeast Asian market context
- When extracting availableStore data, prioritize sources with Shopee platform URLs
- Consider local market preferences, pricing in local currencies, and regional availability
- Account for Shopee-specific features like vouchers, flash sales, and seller ratings`
      : `

GLOBAL MODE ACTIVATED:
- Analyze data from diverse global e-commerce platforms and sources
- Exclude Shopee-specific data to maintain global market perspective
- Consider international market trends, global pricing, and worldwide availability
- Focus on major international retailers and marketplaces`;

  return baseInstruction + marketSpecificInstruction;
}

/**
 * Searches for product insights across multiple data sources
 * @param payload - The search parameters including query and market source
 * @returns Promise resolving to the generated product insight object
 * @throws {ProductInsightError} When search or generation fails
 * @throws {InvalidQueryError} When query validation fails
 * @throws {SearchTimeoutError} When searches timeout
 */
export async function searchProductInsight({
  query,
  marketSource,
  options = {},
}: InsightPayload): Promise<UnifiedSubToolResult<DataSourceInsight>> {
  try {
    // Validate input
    validateQuery(query);

    if (!["global", "shopee"].includes(marketSource)) {
      throw new ProductInsightError(
        `Invalid market source: ${marketSource}`,
        "INVALID_MARKET_SOURCE"
      );
    }

    // Merge options with defaults
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Build search query
    const queryPayload = buildSearchQuery(query, marketSource);

    // Perform searches
    const searchResults = await performSearches(queryPayload, mergedOptions);

    // Check if we have any successful search results
    const hasResults = Object.values(searchResults).some(
      (result) => result !== null
    );

    if (!hasResults) {
      throw new ProductInsightError(
        "All search operations failed - no data available",
        "NO_SEARCH_RESULTS"
      );
    }

    // Build model payload
    const modelPayload = buildModelPayload(query, marketSource, searchResults);

    // Generate system instruction
    const systemInstruction = buildSystemInstruction(marketSource);

    // Generate insight using AI model
    const modelResponse = await executeWithRetry(
      async () => {
        return await generateObject({
          model: google("gemini-2.0-flash-lite", {
            useSearchGrounding: true,
          }),
          schema: dataSourceInsightSchema,
          system: systemInstruction,
          prompt: JSON.stringify(modelPayload),
        });
      },
      mergedOptions.maxRetries,
      "AI model generation"
    );

    return {
      ok: true,
      usage: modelResponse.usage,
      processingTime: Date.now(),
      data: modelResponse.object,
      metadata: {
        query: query.trim(),
        marketSource,
        timestamp: new Date().toISOString(),
        searchResultsAvailable: {
          webSearch: searchResults.web_search !== null,
          shopping: searchResults.shopping !== null,
          images: searchResults.images !== null,
          videos: searchResults.videos !== null,
        },
      },
    };
  } catch (error) {
    if (error instanceof ProductInsightError) {
      throw error;
    }

    throw new ProductInsightError(
      `Unexpected error during product insight search: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      "UNEXPECTED_ERROR",
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Batch search for multiple product queries
 * @param queries - Array of search queries
 * @param marketSource - Market source to use for all queries
 * @param options - Search options
 * @returns Promise resolving to array of results
 */
export async function batchSearchProductInsights(
  queries: string[],
  marketSource: MarketSource,
  options: SearchOptions = {}
): Promise<Array<{ query: string; result: any; error?: ProductInsightError }>> {
  const results = await Promise.allSettled(
    queries.map((query) =>
      searchProductInsight({ query, marketSource, options })
    )
  );

  return queries.map((query, index) => {
    const result = results[index];
    return {
      query,
      result: result.status === "fulfilled" ? result.value : null,
      error: result.status === "rejected" ? result.reason : undefined,
    };
  });
}

/**
 * Health check function to verify service dependencies
 * @returns Promise resolving to health status
 */
export async function healthCheck(): Promise<{
  status: "healthy" | "unhealthy";
  services: Record<string, boolean>;
  timestamp: string;
}> {
  const testQuery = { q: "test", num: 1 };

  const serviceChecks = await Promise.allSettled([
    webSearch(testQuery)
      .then(() => true)
      .catch(() => false),
    shoppingSearch(testQuery)
      .then(() => true)
      .catch(() => false),
    imagesSearch(testQuery)
      .then(() => true)
      .catch(() => false),
    videosSearch(testQuery)
      .then(() => true)
      .catch(() => false),
  ]);

  const services = {
    webSearch:
      serviceChecks[0].status === "fulfilled" && serviceChecks[0].value,
    shoppingSearch:
      serviceChecks[1].status === "fulfilled" && serviceChecks[1].value,
    imagesSearch:
      serviceChecks[2].status === "fulfilled" && serviceChecks[2].value,
    videosSearch:
      serviceChecks[3].status === "fulfilled" && serviceChecks[3].value,
  };

  const allHealthy = Object.values(services).every(Boolean);

  return {
    status: allHealthy ? "healthy" : "unhealthy",
    services,
    timestamp: new Date().toISOString(),
  };
}
