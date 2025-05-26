import { queryValidatorSchema } from "@/lib/agents/schema/st-query-validator";
import {
  QueryValidationData,
  UnifiedSubToolResult,
} from "@/lib/types/subtools";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

const SYSTEM_PROMPT = `You are an advanced electronic product query analyzer and validator with comprehensive market knowledge and access to real-time web search capabilities.

**Core Mission:**
Perform thorough validation of electronic product queries through systematic web search analysis, focusing on accuracy, reliability, and comprehensive market intelligence.

**Primary Analysis Framework:**
1. **Product Legitimacy Verification**
   - Cross-reference multiple authoritative sources (manufacturer websites, official retailers, tech publications)
   - Verify product model numbers, SKUs, and official naming conventions
   - Distinguish between announced, released, and discontinued products
   - Identify potential variations, regional differences, or rebranding

2. **Market Intelligence Assessment**
   - Current availability across major retail channels
   - Pricing trends and market positioning analysis
   - Regional availability and distribution patterns
   - Competitive landscape positioning

3. **Information Quality Evaluation**
   - Source credibility and authority scoring
   - Specification completeness and accuracy
   - Review consensus and expert opinions
   - Official documentation availability

**Electronic Product Taxonomy:**
• **Consumer Electronics:** Smartphones, tablets, laptops, desktops, wearables, e-readers
• **Audio/Video Equipment:** Headphones, speakers, TVs, monitors, cameras, projectors, streaming devices
• **Gaming Hardware:** Consoles, controllers, gaming peripherals, VR/AR devices, gaming monitors
• **Smart Home Technology:** IoT devices, smart speakers, home automation, security systems, smart appliances
• **Computing Components:** CPUs, GPUs, motherboards, RAM, storage devices, cooling systems
• **Mobile Accessories:** Cases, chargers, power banks, wireless accessories, screen protectors
• **Professional Equipment:** Studio monitors, professional microphones, video production gear, networking equipment

**Enhanced Validation Methodology:**
- **Score 9-10:** Multiple official sources, complete specifications, wide availability, strong review consensus
- **Score 7-8:** Official presence confirmed, good specification coverage, reasonable availability
- **Score 5-6:** Limited official information, partial specifications, moderate market presence
- **Score 3-4:** Minimal reliable sources, basic information only, questionable availability
- **Score 1-2:** No credible sources, potential fake/discontinued products, non-electronic queries

**Critical Analysis Points:**
- Verify authentic brand associations and avoid counterfeit indicators
- Assess product lifecycle stage (pre-launch, current, end-of-life, discontinued)
- Evaluate specification accuracy and completeness
- Identify market segment and target audience
- Cross-validate information across multiple source types

**Output Requirements:**
Provide comprehensive, factual analysis with specific evidence supporting conclusions. Focus on actionable insights and clear validation status.`;

// Validation utilities
const validateQueryInput = (query: string): void => {
  if (!query || typeof query !== "string") {
    throw new Error("Query must be a non-empty string");
  }

  if (query.trim().length === 0) {
    throw new Error("Query cannot be empty or whitespace only");
  }

  if (query.length > 500) {
    throw new Error("Query length cannot exceed 500 characters");
  }
};

const createModelConfig = () => {
  return google("gemini-2.0-flash-lite", {
    useSearchGrounding: true,
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  });
};

/**
 * Enhanced query validator with comprehensive error handling and performance optimizations
 * @param p - Object containing the query string to validate
 * @returns Promise resolving to validation results or error information
 */
export async function queryValidator(p: {
  query: string;
}): Promise<UnifiedSubToolResult<QueryValidationData | null>> {
  const startTime = performance.now();

  try {
    // Input validation with detailed error messages
    validateQueryInput(p.query);

    const sanitizedQuery = p.query.trim();
    console.log(`[QueryValidator] Starting analysis for: "${sanitizedQuery}"`);

    // Generate analysis with enhanced error handling
    const result = await generateObject({
      model: createModelConfig(),
      schema: queryValidatorSchema,
      system: SYSTEM_PROMPT,
      prompt: sanitizedQuery,
    });

    // Validate and sanitize the response
    if (!result.object) {
      throw new Error("No analysis result received from the model");
    }

    // Post-processing validation
    const validationData = result.object;

    // Ensure detailed_reasoning doesn't exceed character limit
    if (validationData.detailed_reasoning.length > 400) {
      validationData.detailed_reasoning =
        validationData.detailed_reasoning.substring(0, 397) + "...";
    }

    const processingTime = performance.now() - startTime;
    console.log(
      `[QueryValidator] Analysis completed in ${processingTime.toFixed(2)}ms`
    );

    return {
      ok: true,
      processingTime: Date.now(),
      usage: result.usage,
      data: validationData,
    };
  } catch (error) {
    const processingTime = performance.now() - startTime;
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown validation error occurred";

    console.error(
      `[QueryValidator] Error after ${processingTime.toFixed(2)}ms:`,
      {
        error: errorMessage,
        query: p.query,
        timestamp: new Date().toISOString(),
      }
    );

    // Enhanced error categorization
    let enhancedErrorMessage = errorMessage;

    if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      enhancedErrorMessage =
        "Service temporarily unavailable due to rate limiting. Please try again later.";
    } else if (
      errorMessage.includes("network") ||
      errorMessage.includes("timeout")
    ) {
      enhancedErrorMessage =
        "Network connectivity issue. Please check your connection and try again.";
    } else if (errorMessage.includes("model") || errorMessage.includes("API")) {
      enhancedErrorMessage =
        "AI service temporarily unavailable. Please try again in a few moments.";
    }

    return {
      ok: false,
      processingTime: Date.now(),
      data: null,
      error: enhancedErrorMessage,
    };
  }
}

// Utility function for batch processing multiple queries
export async function batchQueryValidator(
  queries: string[],
  options: { maxConcurrent?: number; delayMs?: number } = {}
): Promise<UnifiedSubToolResult<QueryValidationData | null>[]> {
  const { maxConcurrent = 3, delayMs = 100 } = options;

  if (!Array.isArray(queries) || queries.length === 0) {
    throw new Error("Queries must be a non-empty array");
  }

  const results: UnifiedSubToolResult<QueryValidationData | null>[] = [];

  // Process queries in batches to avoid overwhelming the API
  for (let i = 0; i < queries.length; i += maxConcurrent) {
    const batch = queries.slice(i, i + maxConcurrent);

    const batchPromises = batch.map((query) =>
      queryValidator({ query }).catch((error) => ({
        ok: false as const,
        timestamp: new Date().toISOString(),
        data: null,
        error:
          error instanceof Error ? error.message : "Batch processing error",
      }))
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add delay between batches to respect rate limits
    if (i + maxConcurrent < queries.length && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
