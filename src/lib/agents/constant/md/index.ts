import { readFileSync } from "fs";

const SYSTEM_INSTRUCTION = {
  /**
   * LLM Instruct for main Agent (orchestrator)
   */
  CORE_ORCHESTRATOR: readFileSync(
    "./src/lib/agents/constant/md/orchestrator.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Search Extractor**
   *
   * Output: Structured Data (JSON)
   */
  PRODUCT_SEARCH_EXTRACTOR: readFileSync(
    "./src/lib/agents/constant/md/product-search-extractor.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Search Insight**
   *
   * Output: Markdown
   */
  PRODUCT_SEARCH_INSIGHT: readFileSync(
    "./src/lib/agents/constant/md/product-search-insight.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Search Extractor**
   *
   * Output: Structured Data (JSON)
   */
  PRODUCT_DETAILS_EXTRACTOR: readFileSync(
    "./src/lib/agents/constant/md/product-details-extractor.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Details Insight**
   *
   * Output: Markdown
   */
  PRODUCT_DETAILS_INSIGHT: readFileSync(
    "./src/lib/agents/constant/md/product-details-insight.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Compare Extractor**
   *
   * Output: Structured Data (JSON)
   */
  PRODUCT_COMPARE_EXTRACTOR: readFileSync(
    "./src/lib/agents/constant/md/product-compare-extractor.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Product Compare Insight**
   *
   * Output: Markdown
   */
  PRODUCT_COMPARE_INSIGHT: readFileSync(
    "./src/lib/agents/constant/md/product-compare-insight.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Related Query Crafter**
   *
   * Output: Structured Data (JSON)
   */
  RELATED_QUERY_CRAFTER: readFileSync(
    "./src/lib/agents/constant/md/related-query-crafter.md",
    "utf-8"
  ),
  /**
   * LLM Instruct for **Inquiry Crafter**
   *
   * Output: Structured Data (JSON)
   */
  INQUIRY_CRAFTER: readFileSync(
    "./src/lib/agents/constant/md/inquiry-crafter.md",
    "utf-8"
  ),
} as const;

export default SYSTEM_INSTRUCTION;
