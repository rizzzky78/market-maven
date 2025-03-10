import { cache } from "react";

// Base URL for fetching markdown files
const BASE_URL = "https://fxzeigptgmxrh96p.public.blob.vercel-storage.com";

// Utility function to fetch and cache markdown content
// Using React's built-in cache() function which is stable in Next.js
export const fetchMarkdownContent = cache(
  async (url: string): Promise<string> => {
    try {
      const response = await fetch(url, {
        next: {
          revalidate: 86400, // 24 hours in seconds
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch markdown from ${url}: ${response.statusText}`
        );
      }

      return await response.text();
    } catch (error) {
      console.error(`Error fetching markdown from ${url}:`, error);
      return "Error loading content. Please try again later.";
    }
  }
);

// Define the SYSTEM_INSTRUCTION object with remote fetching
const SYSTEM_INSTRUCTION = {
  /**
   * LLM Instruct for main Agent (orchestrator)
   */
  CORE_ORCHESTRATOR: fetchMarkdownContent(
    `${BASE_URL}/maven-llm-instruct/orchestrator-XNz4torSWQSds5n3GECbspIJoJRf4W.md`
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
