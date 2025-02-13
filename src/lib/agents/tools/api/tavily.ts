"use server";

import { TavilySearchOptions } from "@/lib/types/tavily";
import { getEnv } from "@/lib/utility/get-env";
import { tavily } from "@tavily/core";

export const tavilyClient = tavily({ apiKey: getEnv("TAVILY_API_KEY") });

export async function tavilySearch(
  query: string,
  options?: TavilySearchOptions
) {
  const searchOptions: TavilySearchOptions = {
    ...options,
    searchDepth: "advanced",
    includeAnswer: true,
    includeImages: true,
    includeImageDescriptions: true,
  };

  return await tavilyClient.search(query, searchOptions);
}
