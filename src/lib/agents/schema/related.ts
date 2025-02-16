import { DeepPartial } from "ai";
import { z } from "zod";

/**
 * Zod schema for the Related Query Output format
 *
 * This schema validates an object containing an array of related query items.
 * Each item has a label (short descriptive title) and a query (the actual query text).
 */
export const relatedQueryItemSchema = z.object({
  /**
   * A short, descriptive title for the related query
   */
  label: z
    .string()
    .describe("A short, descriptive title for the related query"),

  /**
   * The actual query text that represents a user message
   */
  query: z
    .string()
    .describe("The actual query text that represents a user message"),
});

export type RelatedItem = z.infer<typeof relatedQueryItemSchema>;

/**
 * The main schema for the Related Query Output
 *
 * Contains an array of related query items, with a maximum of 3 items allowed.
 */
export const relatedQuerySchema = z.object({
  /**
   * Array of related query items, limited to maximum 3 items
   */
  items: z
    .array(relatedQueryItemSchema)
    .max(3, "Maximum of 3 related query items allowed")
    .describe("Array of related query items, limited to maximum 3 items"),
});

/**
 * A partial type derived from `relatedSchema`.
 * Allows for deep partial application of the schema structure,
 * making all properties optional at any depth.
 */
export type PartialRelated = DeepPartial<typeof relatedQuerySchema>;

/**
 * Type inferred from the `relatedSchema` schema.
 * Represents the validated structure of the related query output.
 */
export type RelatedQuery = z.infer<typeof relatedQuerySchema>;
