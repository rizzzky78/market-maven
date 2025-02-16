import { readFileSync } from "fs";

const SYSTEM_INSTRUCTION = {
  CORE_ORCHESTRATOR: readFileSync(
    "./src/lib/agents/constant/md/orchestrator.md",
    "utf-8"
  ),
  PRODUCT_SEARCH_INSIGHT: readFileSync(
    "./src/lib/agents/constant/md/search-product-insight.md",
    "utf-8"
  ),
  PRODUCT_DETAILS_EXTRACTOR: readFileSync(
    "./src/lib/agents/constant/md/product-details-extractor.md",
    "utf-8"
  ),
  PRODUCT_COMPARE_EXTRACTOR: readFileSync(
    "./src/lib/agents/constant/md/product-compare-extractor.md",
    "utf-8"
  ),
  PRODUCT_COMPARE_INSIGHT: readFileSync(
    "./src/lib/agents/constant/md/product-compare-insight.md",
    "utf-8"
  ),
} as const;

export default SYSTEM_INSTRUCTION;
