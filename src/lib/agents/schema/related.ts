import { DeepPartial } from "ai";
import { z } from "zod";

/**
 * Schema definition for the output of related items.
 * This schema ensures that the data contains exactly 3 items, each with a query string.
 */
export const relatedSchema = z.object({
  items: z
    .array(
      z.object({
        /**
         * @property {string} query - A search query related to the main context.
         */
        query: z.string(),
      })
    )
    .length(3), // Ensures exactly 3 items are present in the array.
});

/**
 * A partial type derived from `relatedSchema`.
 * Allows for deep partial application of the schema structure,
 * making all properties optional at any depth.
 */
export type PartialRelated = DeepPartial<typeof relatedSchema>;

/**
 * Type inferred from the `relatedSchema` schema.
 * Represents the validated structure of the related query output.
 */
export type RelatedQuery = z.infer<typeof relatedSchema>;
