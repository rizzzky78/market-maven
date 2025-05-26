import { z } from "zod";

export const queryEnhancerSchema = z.object({
  original_query: z.string().min(1),
  enhanced_query: z.string().min(1),
  enhancement_type: z.enum([
    "no_change_needed",
    "brand_to_specific_model",
    "typo_correction",
    "vague_to_specific",
    "category_to_product",
    "specification_added",
    "context_enhanced",
  ]),
  confidence_score: z.number().min(0).max(1),
  reasoning: z.string().min(10).max(200), // Enforce concise reasoning
});
