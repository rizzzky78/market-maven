import { z } from "zod";

/**
 * The schema for validating inputs for crawling a URL.
 * Defines properties to configure crawling behavior and constraints.
 */
export const crawlUrlInputSchema = z.object({
  /**
   * The base URL to start crawling. Must be a valid and reachable URL.
   */
  url: z
    .string()
    .describe(
      "The base URL to start crawling. Must be a valid and reachable URL."
    ),

  /**
   * The maximum depth to traverse during crawling. This represents the maximum link distance from the base URL.
   */
  maxDepth: z
    .number()
    .min(1)
    .describe(
      "The maximum depth to traverse during crawling. This represents the maximum link distance from the base URL."
    ),

  /**
   * The maximum number of pages to crawl. Ensures the process doesn't overwhelm resources or fetch unnecessary data.
   */
  limit: z
    .number()
    .min(1)
    .describe(
      "The maximum number of pages to crawl. Ensures the process doesn't overwhelm resources or fetch unnecessary data."
    ),

  /**
   * Whether to allow backward links during crawling. Defaults to false if not provided.
   */
  allowBackwardLinks: z
    .boolean()
    .optional()
    .describe(
      "Whether to allow backward links during crawling. Defaults to false if not provided."
    ),

  /**
   * Whether to allow external links during crawling. Defaults to false if not provided.
   */
  allowExternalLinks: z
    .boolean()
    .optional()
    .describe(
      "Whether to allow external links during crawling. Defaults to false if not provided."
    ),

  /**
   * Whether to ignore the sitemap during crawling. Defaults to false. Useful for discovering hidden links.
   */
  ignoreSitemap: z
    .boolean()
    .optional()
    .describe(
      "Whether to ignore the sitemap during crawling. Defaults to false. Useful for discovering hidden links."
    ),

  /**
   * Wait time in milliseconds for each page to load. Minimum value is 100ms.
   */
  waitFor: z
    .number()
    .min(100)
    .optional()
    .describe(
      "Wait time in milliseconds for each page to load. Minimum value is 100ms."
    ),

  /**
   * An array of desired content formats to extract during crawling.
   */
  formats: z
    .array(
      z.enum([
        "markdown",
        "content",
        "screenshot",
        "screenshot@fullPage",
        "extract",
      ])
    )
    .min(1, "At least one format must be specified")
    .default(["markdown"])
    .describe(
      "An array of desired content formats to extract during crawling."
    ),
});

/**
 * The schema for validating inputs for mapping a URL.
 * Defines properties to configure mapping behavior and constraints.
 */
export const mapUrlInputSchema = z.object({
  /**
   * The target URL to map. Must be a valid and reachable URL.
   */
  url: z
    .string()
    .describe("The target URL to map. Must be a valid and reachable URL."),

  /**
   * The maximum number of pages to map. Ensures that the mapping process doesn't overwhelm resources.
   */
  limit: z
    .number()
    .min(1)
    .describe(
      "The maximum number of pages to map. Ensures that the mapping process doesn't overwhelm resources."
    ),
});

/**
 * The schema for validating inputs for scraping a URL.
 * Defines properties to configure scraping behavior and constraints.
 */
export const scrapeInputSchema = z
  .object({
    /**
     * The URL to scrape. Must be a valid URL.
     */
    url: z.string().describe("Must be a valid URL"),

    /**
     * Wait time in milliseconds for the page to load. Minimum is 500ms, maximum is 30 seconds.
     */
    waitFor: z
      .number()
      .min(500, "Minimum wait time is 500 milliseconds")
      .max(30000, "Maximum wait time is 30 seconds")
      .optional(),

    /**
     * An array of desired content output formats. At least one format must be specified.
     */
    formats: z
      .array(
        z.enum([
          "markdown",
          "content",
          "screenshot",
          "screenshot@fullPage",
          "extract",
        ])
      )
      .min(1, "At least one format must be specified")
      .default(["markdown"])
      .describe(
        "An array of desired content output formats. At least one format must be specified. For 'extract' format, additional prompting properties are required."
      ),

    /**
     * A flag to indicate if AI prompts should be used for extraction formats. Enable this when using 'extract' format.
     */
    usePrompt: z
      .boolean()
      .optional()
      .describe(
        "A flag to indicate if AI prompts should be used for extraction formats. Enable this when using 'extract' format."
      ),

    /**
     * A system-level instruction for extraction. Required when 'extract' is in formats.
     */
    systemPrompt: z
      .string()
      .optional()
      .refine((val) => val === undefined || val.trim().length > 0, {
        message: "System prompt cannot be an empty string",
      })
      .describe(
        "A system-level instruction for extraction. Required when 'extract' is in formats."
      ),

    /**
     * A custom user prompt for extraction. Required when 'extract' is in formats.
     */
    prompt: z
      .string()
      .optional()
      .refine((val) => val === undefined || val.trim().length > 0, {
        message: "User prompt cannot be an empty string",
      })
      .describe(
        "A custom user prompt for extraction. Required when 'extract' is in formats."
      ),
  })
  .refine(
    (data) => {
      // Additional validation when 'extract' is in formats
      if (data.formats.includes("extract")) {
        return (
          data.usePrompt === true &&
          data.systemPrompt !== undefined &&
          data.prompt !== undefined
        );
      }
      return true;
    },
    {
      message:
        "When 'extract' format is used, usePrompt must be true, and both systemPrompt and prompt must be provided",
      path: ["formats"],
    }
  );
