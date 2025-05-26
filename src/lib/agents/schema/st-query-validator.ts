import { z } from "zod";

export const queryValidatorSchema = z.object({
  query_input: z.string().describe("The original query that was analyzed"),

  is_electronic_product: z
    .boolean()
    .describe(
      "Indicates whether the query represents a legitimate electronic product"
    ),

  product_exists: z
    .boolean()
    .describe(
      "Confirms if verifiable information about this specific electronic product is available through web search"
    ),

  product_category: z
    .enum([
      "smartphone",
      "laptop",
      "tablet",
      "desktop",
      "wearable",
      "audio_device",
      "display_device",
      "gaming_device",
      "smart_home",
      "computer_component",
      "mobile_accessory",
      "professional_equipment",
      "other_electronic",
      "not_electronic",
    ])
    .describe("The specific category of electronic product identified"),

  brand_verified: z
    .boolean()
    .describe(
      "Whether the brand/manufacturer mentioned in the query is verified as legitimate"
    ),

  market_availability: z
    .enum([
      "widely_available",
      "limited_availability",
      "pre_order",
      "discontinued",
      "not_released",
      "unknown",
      "not_applicable",
    ])
    .describe("Current market availability status of the product"),

  information_sources: z
    .array(
      z.enum([
        "official_manufacturer",
        "major_retailer",
        "tech_review_sites",
        "specification_databases",
        "user_forums",
        "social_media",
        "news_articles",
        "no_reliable_sources",
      ])
    )
    .describe("Types of sources where product information was found"),

  confidence_level: z
    .enum(["very_high", "high", "medium", "low", "very_low"])
    .describe("Overall confidence in the product validation results"),

  validation_score: z
    .number()
    .min(1, "Validation score must be at least 1")
    .max(10, "Validation score cannot exceed 10")
    .describe(
      "Comprehensive score (1-10) reflecting information quality, source reliability, market presence, and verification certainty"
    ),

  detailed_reasoning: z
    .string()
    .describe(
      "Comprehensive explanation covering product verification status, information sources found, market availability assessment, and any notable findings or concerns. Detailed reasoning maximum length cannot exceed 400 characters."
    ),

  specifications_found: z
    .boolean()
    .describe("Whether detailed technical specifications were discoverable"),

  alternative_suggestions: z
    .array(z.string())
    .max(3)
    .describe(
      "Up to 3 alternative or similar products if the original query needs clarification"
    ),

  red_flags: z
    .array(
      z.enum([
        "potential_counterfeit",
        "discontinued_product",
        "unreliable_sources",
        "conflicting_information",
        "no_official_sources",
        "suspicious_branding",
        "none_detected",
      ])
    )
    .describe("Any concerns or warning signs identified during validation"),
});
