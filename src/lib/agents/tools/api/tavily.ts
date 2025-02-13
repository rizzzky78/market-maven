"use server";

import { TavilySearchOptions, TavilySearchResponse } from "@/lib/types/tavily";
import { getEnv } from "@/lib/utility/get-env";
import logger from "@/lib/utility/logger";
import { tavily } from "@tavily/core";

/**
 * Interface for search request parameters
 */
interface SearchRequest {
  query: string;
  options?: TavilySearchOptions;
}

/**
 * Interface for the API response including error handling
 */
interface SearchResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Performs a conditional external search using the Tavily API
 * @param trigger - Boolean flag to determine if search should be executed
 * @param request - Object containing search query and optional configuration
 * @returns Promise containing the search results with error handling
 */
export async function externalTavilySearch(
  trigger: boolean,
  request: SearchRequest
): Promise<SearchResponse<TavilySearchResponse>> {
  /**
   * Initialize Tavily API client with API key from environment variables
   */
  const tavilyClient = tavily({ apiKey: getEnv("TAVILY_API_KEY") });

  if (!trigger) {
    return {
      data: null,
      error: null,
      success: true,
    };
  }

  try {
    const data = await tavilyClient.search(request.query, {
      searchDepth: "advanced",
      includeAnswer: true,
      includeImages: true,
      includeImageDescriptions: true,
    });

    return {
      data,
      error: null,
      success: true,
    };
  } catch (error) {
    const err =
      error instanceof Error ? error.message : "An unknown error occurred";

    logger.error(err, request);

    return {
      data: null,
      error: err,
      success: false,
    };
  }
}
