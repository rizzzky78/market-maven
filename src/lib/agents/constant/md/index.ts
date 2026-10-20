import { cache } from "react";
import { groundingPolicy } from "./grounding";

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
      // An error string must never become the model's instruction; the
      // grounding policy appended by `load` still keeps the agent on track.
      return "";
    }
  }
);

/**
 * Loads an instruction and appends the grounding policy. Resolved on every
 * access (via the getters below) so a failed fetch is retried on the next
 * request instead of being pinned for the server's lifetime, and the policy
 * carries the current date. Fetches are deduplicated by the `revalidate` cache.
 */
const load = async (file: string, grounded = true) =>
  (await fetchMarkdownContent(`${BASE_URL}/maven-llm-instruct/${file}`)) +
  (grounded ? groundingPolicy() : "");

// Define the SYSTEM_INSTRUCTION object with remote fetching
const SYSTEM_INSTRUCTION = {
  /**
   * LLM Instruct for main Agent (orchestrator)
   */
  get CORE_ORCHESTRATOR() {
    return load("orchestrator-XNz4torSWQSds5n3GECbspIJoJRf4W.md");
  },
  /**
   * LLM Instruct for **Product Search Extractor**
   *
   * Output: Structured Data (JSON)
   */
  get PRODUCT_SEARCH_EXTRACTOR() {
    return load("product-search-extractor-3iXOnB2oGaIaem1FSO241Ge4BZ004m.md");
  },
  /**
   * LLM Instruct for **Product Search Insight**
   *
   * Output: Markdown
   */
  get PRODUCT_SEARCH_INSIGHT() {
    return load("product-search-insight-gi5jXJhs2l2AYAJJr9lYghGxHekyj5.md");
  },
  /**
   * LLM Instruct for **Product Details Extractor**
   *
   * Output: Structured Data (JSON)
   */
  get PRODUCT_DETAILS_EXTRACTOR() {
    return load("product-details-extractor-6sNVEkkOtdMEndXZHwET0gbq6H3Ih6.md");
  },
  /**
   * LLM Instruct for **Product Details Insight**
   *
   * Output: Markdown
   */
  get PRODUCT_DETAILS_INSIGHT() {
    return load("product-details-insight-aWeXPvb3h39YWjQcj88ZjvPan2zRM1.md");
  },
  /**
   * LLM Instruct for **Product Compare Extractor**
   *
   * Output: Structured Data (JSON)
   */
  get PRODUCT_COMPARE_EXTRACTOR() {
    return load("product-compare-extractor-481kCAXNdw16LCwowraHzPbfRCF4Fb.md");
  },
  /**
   * LLM Instruct for **Product Compare Insight**
   *
   * Output: Markdown
   */
  get PRODUCT_COMPARE_INSIGHT() {
    return load("product-compare-insight-jlQHDK3QhpEiTA4qp58V7ue7W7xd4n.md");
  },
  /**
   * LLM Instruct for **Related Query Crafter**
   *
   * Output: Structured Data (JSON)
   */
  get RELATED_QUERY_CRAFTER() {
    return load("related-query-crafter-FuvwBynfDDVB4lEJc9W4rp5wibXeUi.md");
  },
  /**
   * LLM Instruct for **Inquiry Crafter**
   *
   * Output: Structured Data (JSON)
   */
  get INQUIRY_CRAFTER() {
    return load("inquiry-crafter-DOZluqCs7rlnklX9HyTHdzTo73Umei.md");
  },
  /**
   * LLM Instruct for **Product Researcher**
   *
   * Output: Markdown
   */
  get PRODUCT_RESEARCHER() {
    return load("product-researcher-w5yla9ixFsxL5COQXEtM1hgJWyYlnf.md");
  },
  /**
   * LLM Instruct for **Recommendator Extractor**
   *
   * Output: Structured Data (JSON)
   */
  get RECOMMENDATOR_EXTRACTOR() {
    return load("recommendator-extractor-FhIeGKtYcoDnIlkTynKzKsE9PVWx4x.md");
  },
  /**
   * LLM Instruct for **Recommendator Insight**
   *
   * Output: Markdown
   */
  get RECOMMENDATOR_INSIGHT() {
    return load("recommendator-insight-y9QNq5CKtyWRQbCVLp7wqakgF7xXKU.md");
  },
  /**
   * LLM Instruct for **Title Crafter**
   *
   * Output: String
   */
  get TITLE_CRAFTER() {
    return load("title-crafter-TdkYJqUuMNm8inmZZnTT4ufgqe58zP.md", false);
  },
} as const;

export default SYSTEM_INSTRUCTION;
