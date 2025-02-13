"use server";

import {
  SerperConfig,
  SerperSearchParams,
  WebSearchParams,
  ImageSearchParams,
  NewsSearchParams,
  PlacesSearchParams,
} from "@/lib/types/serper";

/**
 * Creates a Serper API client instance
 * @param config - Configuration for the Serper API
 * @returns API client with search methods
 */
export const createSerperClient = (config: SerperConfig) => {
  const baseUrl = config.baseUrl || "https://google.serper.dev";

  /**
   * Makes a request to the Serper API
   * @param params - Search parameters
   * @returns Search results
   */
  const searchRequest = async (params: SerperSearchParams) => {
    try {
      const response = await fetch(`${baseUrl}/search`, {
        method: "POST",
        headers: {
          "X-API-KEY": config.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Serper API request failed:", error);
      throw error;
    }
  };

  /**
   * Performs a web search
   * @param {WebSearchParams} params - Web search parameters
   * @returns {Promise<any>} Web search results
   */
  const webSearch = (params: Omit<WebSearchParams, "type">): Promise<any> => {
    return searchRequest({ ...params, type: "search" });
  };

  /**
   * Performs an image search
   * @param {Omit<ImageSearchParams, 'type'>} params - Image search parameters
   * @returns {Promise<any>} Image search results
   */
  const imageSearch = (params: Omit<ImageSearchParams, "type">): Promise<any> => {
    return searchRequest({ ...params, type: "images" });
  };

  /**
   * Performs a news search
   * @param {Omit<NewsSearchParams, 'type'>} params - News search parameters
   * @returns {Promise<any>} News search results
   */
  const newsSearch = (params: Omit<NewsSearchParams, "type">): Promise<any> => {
    return searchRequest({ ...params, type: "news" });
  };

  /**
   * Performs a places search
   * @param {Omit<PlacesSearchParams, 'type'>} params - Places search parameters
   * @returns {Promise<any>} Places search results
   */
  const placesSearch = (params: Omit<PlacesSearchParams, "type">): Promise<any> => {
    return searchRequest({ ...params, type: "places" });
  };

  return {
    webSearch,
    imageSearch,
    newsSearch,
    placesSearch,
  };
};
