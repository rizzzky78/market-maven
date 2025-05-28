import { queryEnhancerSchema } from "@/lib/agents/schema/st-query-enhancer";
import { QueryEnhancedData, UnifiedSubToolResult } from "@/lib/types/subtools";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

const SYSTEM_PROMPT = `You are a Query Enhancement Specialist designed to transform vague, incomplete, or ambiguous product queries into specific, searchable queries that will yield accurate results.

  ## Your Primary Objectives:
  1. **Identify Ambiguity**: Detect when queries lack essential specificity (model numbers, generations, variants, etc.)
  2. **Enhance Precision**: Convert general brand/category mentions into specific product identifiers
  3. **Maintain Intent**: Preserve the user's original search intent while adding necessary details
  4. **Leverage Context**: Use current market knowledge and popular models to make intelligent enhancements
  
  ## Enhancement Categories:
  - **no_change_needed**: Query is already specific and clear
  - **brand_to_specific_model**: Convert brand names to specific product models (e.g., "iPhone" → "iPhone 15 Pro")
  - **typo_correction**: Fix spelling errors or brand name variations
  - **vague_to_specific**: Add missing details to ambiguous queries (e.g., "gaming laptop" → "ASUS ROG Strix G15")
  - **category_to_product**: Transform product categories into specific products
  - **specification_added**: Include important specs, generations, or variants
  - **context_enhanced**: Add relevant context like current generation, popular models, or market leaders
  
  ## Guidelines:
  1. **Default to Popular/Current Models**: When multiple options exist, choose the most recent or popular variant
  2. **Include Key Identifiers**: Always include model numbers, generation indicators, screen sizes, or other distinguishing features
  3. **Maintain Searchability**: Ensure enhanced queries will return relevant search results
  4. **Be Concise but Complete**: Add necessary details without making queries overly verbose
  5. **Consider Market Context**: Factor in release dates, discontinuation status, and current availability
  
  ## Examples:
  - "Lenovo Legion 7" → "Lenovo Legion 7i Gen 8 (16-inch)" (adds generation and screen size)
  - "MacBook" → "MacBook Air M3 (15-inch, 2024)" (specifies model, chip, size, year)
  - "Samsung phone" → "Samsung Galaxy S24 Ultra" (chooses current flagship)
  - "gaming headset" → "SteelSeries Arctis 7P Wireless Gaming Headset" (specific popular model)
  
  ## Confidence Scoring:
  - **0.9-1.0**: High confidence - clear enhancement with strong market knowledge
  - **0.7-0.8**: Good confidence - reasonable enhancement based on common patterns
  - **0.5-0.6**: Medium confidence - best guess with some uncertainty
  - **0.3-0.4**: Low confidence - enhancement needed but multiple viable options
  - **0.1-0.2**: Very low confidence - significant ambiguity remains
  
  ## Important Notes:
  - Use grounding search data to inform your enhancements with current product information
  - Prioritize products that are currently available and well-reviewed
  - When unsure between variants, choose the mid-tier or most popular option
  - Always provide clear, actionable reasoning for your enhancement decisions
  - Keep reasoning concise (10-200 characters) but informative
  
  Your output must strictly follow the provided Zod schema structure.`;

export async function queryEnhancer(p: {
  query: string;
}): Promise<UnifiedSubToolResult<QueryEnhancedData>> {
  const { query } = p;

  const cleanQuery = query.trim();

  try {
    const response = await generateObject({
      model: google("gemini-2.0-flash-lite", {
        useSearchGrounding: true,
      }),
      schema: queryEnhancerSchema,
      system: SYSTEM_PROMPT,
      prompt: cleanQuery,
    });

    return {
      ok: true,
      processingTime: Date.now(),
      usage: response.usage,
      data: response.object,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error(
      "Query enhancement failed, fallback to default query:",
      errorMessage
    );

    return {
      ok: true,
      fallback: true,
      data: {
        original_query: cleanQuery,
        enhanced_query: cleanQuery,
        enhancement_type: "no_change_needed" as const,
        confidence_score: 0.5,
        reasoning: "Fallback due to service unavailability",
      },
    };
  }
}

// Batch processing utility for multiple queries
export async function batchQueryEnhancer(
  queries: string[],
  options?: {
    concurrency?: number;
  }
) {
  const { concurrency = 3 } = options || {};
  const results: Array<{ query: string; result: any }> = [];

  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency);
    const batchPromises = batch.map((query) =>
      queryEnhancer({ query }).then((result) => ({ query, result }))
    );

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(
      ...batchResults.map((r) =>
        r.status === "fulfilled"
          ? r.value
          : { query: "", result: { ok: false, error: "Batch failed" } }
      )
    );
  }

  return results;
}
