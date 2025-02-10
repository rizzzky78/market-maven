import { sql } from "@/database/neon";
import { CachedScrape, QueryKey, ResultedScrapeOperation } from "../types/neon";

/**
 * Saves scraped content to the database cache.
 * If a record with the same query exists, it will be updated with the new response.
 *
 * @param payload - Contains the query string used for scraping
 * @param data - The scraped content response
 * @returns Promise<CachedScrape> - The saved cache entry
 * @throws {Error} If database operation fails
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
    INSERT INTO scrape_cache (query, response)
    VALUES (${payload.query}, ${JSON.stringify(data)})
    ON CONFLICT (query) 
    DO UPDATE SET 
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
 * Retrieves cached scrape content for a given query.
 *
 * @param query - The query string to look up in the cache
 * @returns Promise<CachedScrape | null> - The cached response or null if not found
 * @throws {Error} If database operation fails
 */
export async function getScrapeCache<T>(
  query: string
): Promise<CachedScrape<T> | null> {
  const result = await sql`
    SELECT query, markdown
    FROM scrape_cache
    WHERE query = ${query};
  `;

  if (!result[0]) {
    return null;
  }

  return {
    payload: { query: result[0].query },
    data: result[0].markdown,
  };
}

/**
 * Handles scraping operation with caching capability.
 * Checks cache first and only performs scraping if no cached data exists.
 *
 * @param query - The search query to scrape
 * @param scrapeFn - The function that performs the actual scraping
 * @returns Promise<CachedScrape> - Either cached or freshly scraped data
 */
export async function handleScrapingWithCache<T>(
  query: string,
  scrapeFn: (query: string) => Promise<ResultedScrapeOperation<T>>
): Promise<CachedScrape<T>> {
  // Check cache first
  const cached = await getScrapeCache<T>(query);
  if (cached) {
    return cached;
  }

  // If not in cache, perform scraping
  const scrapedData = await scrapeFn(query);

  // Save to cache and return
  return await saveScrapeCache({ query }, scrapedData);
}
