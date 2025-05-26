import { queryEnhancerSchema } from "@/lib/agents/schema/st-query-enhancer";
import { QueryEnhancedData, UnifiedSubToolResult } from "@/lib/types/subtools";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

// Common product patterns for quick identification
const PRODUCT_PATTERNS = {
  smartphones: /\b(iphone|samsung galaxy|pixel|oneplus|xiaomi|huawei)\b/i,
  laptops: /\b(macbook|thinkpad|dell xps|surface|gaming laptop|ultrabook)\b/i,
  gaming: /\b(ps5|xbox|nintendo switch|gaming|rtx|radeon)\b/i,
  audio: /\b(airpods|headphones|earbuds|speaker|soundbar)\b/i,
  tv: /\b(tv|television|oled|qled|4k|8k)\b/i,
  smartwatch: /\b(apple watch|galaxy watch|fitbit|smartwatch)\b/i,
};

// Quick brand validation
const MAJOR_BRANDS = new Set([
  "apple",
  "samsung",
  "google",
  "microsoft",
  "sony",
  "lg",
  "dell",
  "hp",
  "lenovo",
  "asus",
  "acer",
  "nintendo",
  "meta",
  "bose",
  "jbl",
  "nvidia",
  "amd",
  "intel",
  "xiaomi",
  "oneplus",
  "huawei",
  "canon",
  "nikon",
]);

// Pre-analysis to avoid unnecessary API calls
function preAnalyzeQuery(query: string): {
  needsEnhancement: boolean;
  category?: string;
  confidence: number;
  skipReason?: string;
} {
  const normalizedQuery = query.toLowerCase().trim();

  // Skip if query is already very specific (contains model numbers/detailed specs)
  if (
    /\b\d{2,4}(gb|tb|pro|max|plus|ultra)\b/i.test(query) &&
    query.length > 15
  ) {
    return {
      needsEnhancement: false,
      confidence: 0.9,
      skipReason: "Already specific",
    };
  }

  // Skip very short queries that are too vague
  if (normalizedQuery.length < 3) {
    return {
      needsEnhancement: false,
      confidence: 0.1,
      skipReason: "Too vague",
    };
  }

  // Detect category for targeted enhancement
  let category = "other";
  let confidence = 0.5;

  for (const [cat, pattern] of Object.entries(PRODUCT_PATTERNS)) {
    if (pattern.test(normalizedQuery)) {
      category = cat;
      confidence = 0.8;
      break;
    }
  }

  // Check if it's just a brand name
  const words = normalizedQuery.split(/\s+/);
  if (words.length <= 2 && words.some((word) => MAJOR_BRANDS.has(word))) {
    return { needsEnhancement: true, category, confidence: 0.9 };
  }

  return { needsEnhancement: true, category, confidence };
}

// Optimized system prompt based on pre-analysis
function buildSystemPrompt(category?: string, confidence?: number): string {
  const basePrompt = `You are an electronics query enhancer. Focus on 2024-2025 available products.`;

  const categorySpecific = category
    ? {
        smartphone:
          "Focus on current iPhone, Samsung Galaxy, Google Pixel, and OnePlus models.",
        laptop:
          "Prioritize MacBooks, ThinkPads, Dell XPS, Surface, and gaming laptops from major brands.",
        gaming:
          "Include PS5, Xbox Series, Nintendo Switch, and PC gaming components.",
        audio:
          "Cover AirPods, premium headphones, earbuds, and speakers from top brands.",
        tv: "Focus on OLED, QLED, and 4K/8K TVs from Samsung, LG, Sony.",
        smartwatch: "Include Apple Watch, Galaxy Watch, and fitness trackers.",
      }[category] || ""
    : "";

  return `${basePrompt} ${categorySpecific}

Rules:
- If query is specific (model + specs): minimal changes
- If brand only: suggest 2-3 current flagship models  
- If vague: interpret intent and suggest specific products
- Keep reasoning under 150 characters
- Add price context when relevant`;
}

export async function queryEnhancer(p: {
  query: string;
}): Promise<UnifiedSubToolResult<QueryEnhancedData>> {
  const { query } = p;

  const cleanQuery = query.trim();

  // Pre-analysis to optimize API usage
  const preAnalysis = preAnalyzeQuery(cleanQuery);

  try {
    const response = await generateObject({
      model: google("gemini-2.0-flash-lite", {
        useSearchGrounding: true,
      }),
      schema: queryEnhancerSchema,
      system: buildSystemPrompt(preAnalysis.category, preAnalysis.confidence),
      prompt: `Query: "${cleanQuery}"`,
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
