import { readFileSync } from "fs";

const SYSTEM_INSTRUCTION = {
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
