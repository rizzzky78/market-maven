import { readFileSync } from "fs";

const SYSTEM_INSTRUCTION = {
  PRODUCT_DETAILS_EXTRACTOR: readFileSync(
    "./lib/agents/constant/md/product-details-extractor.md",
    "utf-8"
  ),
} as const;

export default SYSTEM_INSTRUCTION;
