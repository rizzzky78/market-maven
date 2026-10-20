import { groundingPolicy } from "./grounding";
import { INQUIRY_CRAFTER_SYSTEM_INSTRUCTION } from "./inquiry-crafter";
import { PRODUCT_DETAILS_EXTRACTOR_SYSTEM_INSTRUCTION } from "./product-details-extractor";
import { PRODUCT_DETAILS_INSIGHT_SYSTEM_INSTRUCTION } from "./product-details-insight";
import { PRODUCT_RESEARCHER_SYSTEM_INSTRUCTION } from "./product-researcher";
import { PRODUCT_SEARCH_EXTRACTOR_SYSTEM_INSTRUCTION } from "./product-search-extractor";
import { PRODUCT_SEARCH_INSIGHT_SYSTEM_INSTRUCTION } from "./product-search-insight";
import { RECOMMENDATOR_EXTRACTOR_SYSTEM_INSTRUCTION } from "./recommendator-extractor";
import { RECOMMENDATOR_INSIGHT_SYSTEM_INSTRUCTION } from "./recommendator-insight";
import { RELATED_QUERY_CRAFTER_SYSTEM_INSTRUCTION } from "./related-query-crafter";
import { TITLE_CRAFTER_SYSTEM_INSTRUCTION } from "./title-crafter";

/**
 * Sub-agent instructions, bundled with the app. Each getter appends the
 * grounding policy at access time so it always carries the current date.
 */
const SYSTEM_INSTRUCTION = {
  /**
   * LLM Instruct for **Product Search Extractor**
   *
   * Output: Structured Data (JSON)
   */
  get PRODUCT_SEARCH_EXTRACTOR() {
    return PRODUCT_SEARCH_EXTRACTOR_SYSTEM_INSTRUCTION + groundingPolicy();
  },
  /**
   * LLM Instruct for **Product Search Insight**
   *
   * Output: Markdown
   */
  get PRODUCT_SEARCH_INSIGHT() {
    return PRODUCT_SEARCH_INSIGHT_SYSTEM_INSTRUCTION + groundingPolicy();
  },
  /**
   * LLM Instruct for **Product Details Extractor**
   *
   * Output: Structured Data (JSON)
   */
  get PRODUCT_DETAILS_EXTRACTOR() {
    return PRODUCT_DETAILS_EXTRACTOR_SYSTEM_INSTRUCTION + groundingPolicy();
  },
  /**
   * LLM Instruct for **Product Details Insight**
   *
   * Output: Markdown
   */
  get PRODUCT_DETAILS_INSIGHT() {
    return PRODUCT_DETAILS_INSIGHT_SYSTEM_INSTRUCTION + groundingPolicy();
  },
  /**
   * LLM Instruct for **Related Query Crafter**
   *
   * Output: Structured Data (JSON)
   */
  get RELATED_QUERY_CRAFTER() {
    return RELATED_QUERY_CRAFTER_SYSTEM_INSTRUCTION + groundingPolicy();
  },
  /**
   * LLM Instruct for **Inquiry Crafter**
   *
   * Output: Structured Data (JSON)
   */
  get INQUIRY_CRAFTER() {
    return INQUIRY_CRAFTER_SYSTEM_INSTRUCTION + groundingPolicy();
  },
  /**
   * LLM Instruct for **Product Researcher**
   *
   * Output: Markdown
   */
  get PRODUCT_RESEARCHER() {
    return PRODUCT_RESEARCHER_SYSTEM_INSTRUCTION + groundingPolicy();
  },
  /**
   * LLM Instruct for **Recommendator Extractor**
   *
   * Output: Structured Data (JSON)
   */
  get RECOMMENDATOR_EXTRACTOR() {
    return RECOMMENDATOR_EXTRACTOR_SYSTEM_INSTRUCTION + groundingPolicy();
  },
  /**
   * LLM Instruct for **Recommendator Insight**
   *
   * Output: Markdown
   */
  get RECOMMENDATOR_INSIGHT() {
    return RECOMMENDATOR_INSIGHT_SYSTEM_INSTRUCTION + groundingPolicy();
  },
  /**
   * LLM Instruct for **Title Crafter**
   *
   * Output: String
   */
  get TITLE_CRAFTER() {
    return TITLE_CRAFTER_SYSTEM_INSTRUCTION;
  },
} as const;

export default SYSTEM_INSTRUCTION;
