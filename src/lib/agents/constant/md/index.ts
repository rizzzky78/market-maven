import { unstable_cache } from "next/cache";

// Base URL for fetching markdown files (from your blob metadata)
const BASE_URL = "https://fxzeigptgmxrh96p.public.blob.vercel-storage.com";

// Cache configuration
const CACHE_TTL = 24 * 60 * 60; // Cache for 1 day (in seconds)
const REVALIDATE_INTERVAL = 24 * 60 * 60; // Revalidate every day (in seconds)

// Utility function to fetch and cache markdown content
async function fetchMarkdownContent(url: string): Promise<string> {
  const cacheKey = `markdown:${url}`;

  // Use unstable_cache to cache the fetch result on the server
  const cachedFetch = unstable_cache(
    async () => {
      const response = await fetch(url, {
        // Ensure we don't cache the HTTP response itself, only the result in unstable_cache
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch markdown from ${url}: ${response.statusText}`
        );
      }

      return await response.text();
    },
    [cacheKey], // Cache key for this specific URL
    {
      revalidate: REVALIDATE_INTERVAL, // Revalidate cache after this interval
      tags: [cacheKey], // Tag for manual revalidation if needed
    }
  );

  return cachedFetch();
}

// Define the SYSTEM_INSTRUCTION object with remote fetching
const SYSTEM_INSTRUCTION = {
  /**
   * LLM Instruct for main Agent (orchestrator)
   */
  CORE_ORCHESTRATOR: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/orchestrator-gaoUzAQL6ghscCB5pvA9aP1FmJdRT4.md`
  ),
  /**
   * LLM Instruct for **Product Search Extractor**
   *
   * Output: Structured Data (JSON)
   */
  PRODUCT_SEARCH_EXTRACTOR: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/product-search-extractor-3iXOnB2oGaIaem1FSO241Ge4BZ004m.md`
  ),
  /**
   * LLM Instruct for **Product Search Insight**
   *
   * Output: Markdown
   */
  PRODUCT_SEARCH_INSIGHT: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/product-search-insight-gi5jXJhs2l2AYAJJr9lYghGxHekyj5.md`
  ),
  /**
   * LLM Instruct for **Product Details Extractor**
   *
   * Output: Structured Data (JSON)
   */
  PRODUCT_DETAILS_EXTRACTOR: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/product-details-extractor-6sNVEkkOtdMEndXZHwET0gbq6H3Ih6.md`
  ),
  /**
   * LLM Instruct for **Product Details Insight**
   *
   * Output: Markdown
   */
  PRODUCT_DETAILS_INSIGHT: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/product-details-insight-aWeXPvb3h39YWjQcj88ZjvPan2zRM1.md`
  ),
  /**
   * LLM Instruct for **Product Compare Extractor**
   *
   * Output: Structured Data (JSON)
   */
  PRODUCT_COMPARE_EXTRACTOR: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/product-compare-extractor-481kCAXNdw16LCwowraHzPbfRCF4Fb.md`
  ),
  /**
   * LLM Instruct for **Product Compare Insight**
   *
   * Output: Markdown
   */
  PRODUCT_COMPARE_INSIGHT: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/product-compare-insight-jlQHDK3QhpEiTA4qp58V7ue7W7xd4n.md`
  ),
  /**
   * LLM Instruct for **Related Query Crafter**
   *
   * Output: Structured Data (JSON)
   */
  RELATED_QUERY_CRAFTER: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/related-query-crafter-FuvwBynfDDVB4lEJc9W4rp5wibXeUi.md`
  ),
  /**
   * LLM Instruct for **Inquiry Crafter**
   *
   * Output: Structured Data (JSON)
   */
  INQUIRY_CRAFTER: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/inquiry-crafter-DOZluqCs7rlnklX9HyTHdzTo73Umei.md`
  ),
  /**
   * LLM Instruct for **Product Researcher**
   *
   * Output: Markdown
   */
  PRODUCT_RESEARCHER: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/product-researcher-w5yla9ixFsxL5COQXEtM1hgJWyYlnf.md`
  ),
  /**
   * LLM Instruct for **Recommendator Extractor**
   *
   * Output: Structured Data (JSON)
   */
  RECOMMENDATOR_EXTRACTOR: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/recommendator-extractor-FhIeGKtYcoDnIlkTynKzKsE9PVWx4x.md`
  ),
  /**
   * LLM Instruct for **Recommendator Insight**
   *
   * Output: Markdown
   */
  RECOMMENDATOR_INSIGHT: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/recommendator-insight-y9QNq5CKtyWRQbCVLp7wqakgF7xXKU.md`
  ),
  /**
   * LLM Instruct for **Title Crafter**
   *
   * Output: String
   */
  TITLE_CRAFTER: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/title-crafter-TdkYJqUuMNm8inmZZnTT4ufgqe58zP.md`
  ),
} as const;

export default SYSTEM_INSTRUCTION;
