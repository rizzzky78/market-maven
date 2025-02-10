import { sql } from "@/database/neon";
import {
  CachedScrape,
  CacheResultedScrape,
  QueryKey,
  ResultedScrapeOperation,
} from "../types/neon";

/**
 * Saves scraped content to the database cache.
 * Requires a UUID key for storage and retrieval.
 * If a record with the same query exists, it will be updated with the new response.
 *
 * @param payload - Contains the query string and UUID key
 * @param data - The scraped content response
 * @returns Promise<ScrapeResponse> - The saved cache entry
 * @throws {Error} If database operation fails or if UUID is invalid
 */
export async function saveScrapeCache<T>(
  payload: QueryKey,
  data: ResultedScrapeOperation<T>
): Promise<CachedScrape<T>> {
  const response: CachedScrape<T> = {
    payload,
    data,
  };

  const result = await sql`
    INSERT INTO scrape_cache (key, query, response)
    VALUES (${payload.key}::uuid, ${payload.query}, ${JSON.stringify(data)})
    ON CONFLICT (key) 
    DO UPDATE SET 
      query = ${payload.query},
      response = ${JSON.stringify(data)},
      created_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  if (!result[0]) {
    throw new Error("Failed to save scrape cache");
  }

  return response;
}
/**
 * Retrieves cached scrape content by UUID key.
 *
 * @param key - The UUID key to look up in the cache
 * @returns Promise<ScrapeResponse | null> - The cached response or null if not found
 * @throws {Error} If database operation fails
 */
export async function getScrapeCacheByKey<T>(
  key: string
): Promise<CachedScrape<T> | null> {
  const result = await sql`
    SELECT key, query, response
    FROM scrape_cache
    WHERE key = ${key}::uuid;
  `;

  if (!result[0]) {
    return null;
  }

  return {
    payload: {
      key: result[0].key,
      query: result[0].query,
    },
    data: result[0].response,
  };
}

/**
 * Retrieves cached scrape content by query string.
 *
 * @param query - The query string to look up in the cache
 * @returns Promise<ScrapeResponse | null> - The cached response or null if not found
 */
export async function getScrapeCacheByQuery<T>(
  query: string
): Promise<CachedScrape<T> | null> {
  const result = await sql`
    SELECT key, query, response
    FROM scrape_cache
    WHERE query = ${query};
  `;

  if (!result[0]) {
    return null;
  }

  return {
    payload: {
      key: result[0].key,
      query: result[0].query,
    },
    data: result[0].response,
  };
}

/**
 * Handles scraping operation with caching capability.
 * Checks cache first and only performs scraping if no cached data exists.
 *
 * @param payload - Contains query string and UUID key
 * @param scrapeFunction - The function that performs the actual scraping
 * @returns Promise<ScrapeResponse> - Either cached or freshly scraped data
 */
export async function handleScrapingWithCache<T>(
  payload: QueryKey,
  scrapeFunction: (query: string) => Promise<ResultedScrapeOperation<T>>
): Promise<CacheResultedScrape<T>> {
  // Check cache first by query
  const cached = await getScrapeCacheByQuery<T>(payload.query);
  if (cached) {
    return {
      cached: true,
      response: cached,
    };
  }

  // If not in cache, perform scraping
  const scrapedData = await scrapeFunction(payload.query);

  const noCached = await saveScrapeCache(payload, scrapedData);
  // Save to cache with provided key and return
  return {
    cached: false,
    response: noCached,
  };
}
