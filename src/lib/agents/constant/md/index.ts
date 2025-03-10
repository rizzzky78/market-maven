import { readFileSync } from "fs";

const SYSTEM_INSTRUCTION = {
  /**
   * LLM Instruct for main Agent (orchestrator)
   */
  CORE_ORCHESTRATOR: readFileSync("./public/markdown/orchestrator.md", "utf-8"),
  /**
   * LLM Instruct for **Product Search Extractor**
   *
   * Output: Structured Data (JSON)
   */
  PRODUCT_SEARCH_EXTRACTOR: readFileSync(
    "./public/markdown/product-search-extractor.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Search Insight**
   *
   * Output: Markdown
   */
  PRODUCT_SEARCH_INSIGHT: readFileSync(
    "./public/markdown/product-search-insight.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Search Extractor**
   *
   * Output: Structured Data (JSON)
   */
  PRODUCT_DETAILS_EXTRACTOR: readFileSync(
    "./public/markdown/product-details-extractor.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Details Insight**
   *
   * Output: Markdown
   */
  PRODUCT_DETAILS_INSIGHT: readFileSync(
    "./public/markdown/product-details-insight.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Compare Extractor**
   *
   * Output: Structured Data (JSON)
   */
  PRODUCT_COMPARE_EXTRACTOR: readFileSync(
    "./public/markdown/product-compare-extractor.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Compare Insight**
   *
   * Output: Markdown
   */
  PRODUCT_COMPARE_INSIGHT: readFileSync(
    "./public/markdown/product-compare-insight.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Related Query Crafter**
   *
   * Output: Structured Data (JSON)
   */
  RELATED_QUERY_CRAFTER: readFileSync(
    "./public/markdown/related-query-crafter.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Inquiry Crafter**
   *
   * Output: Structured Data (JSON)
   */
  INQUIRY_CRAFTER: readFileSync(
    "./public/markdown/inquiry-crafter.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Researcher**
   *
   * Output: Markdown
   */
  PRODUCT_RESEARCHER: readFileSync(
    "./public/markdown/product-researcher.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Researcher**
   *
   * Output: Markdown
   */
  RECOMMENDATOR_EXTRACTOR: readFileSync(
    "./public/markdown/recommendator-extractor.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Researcher**
   *
   * Output: Markdown
   */
  RECOMMENDATOR_INSIGHT: readFileSync(
    "./public/markdown/recommendator-insight.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Title Crafter**
   *
   * Output: String
   */
  TITLE_CRAFTER: readFileSync("./public/markdown/title-crafter.md", "utf-8"),
} as const;

export default SYSTEM_INSTRUCTION;
