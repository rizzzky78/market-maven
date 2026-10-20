import { z } from "zod";

/**
 * The schema for validating inputs for scraping a URL.
 * Defines properties to configure scraping behavior and constraints.
 */
export const scrapeInputSchema = z.object({
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
    .array(z.enum(["markdown", "screenshot"]))
    .min(1, "At least one format must be specified")
    .default(["markdown"])
    .describe(
      "An array of desired content output formats. At least one format must be specified."
    ),
});
