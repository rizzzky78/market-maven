import { z } from "zod";

export const searchProductSchema = z.object({
  query: z
    .string()
    .describe(
      "A search query containing either the complete product name or partial product name to enable flexible product discovery and matching"
    ),
});

export const getProductDetailsSchema = z.object({
  query: z
    .string()
    .describe(
      "The exact product title or product name as displayed in the marketplace or search results"
    ),
  link: z
    .string()
    .describe(
      "The complete product URL from a supported marketplace platform. Must be a valid, accessible URL that follows the pattern 'https://www.tokopedia.com/'"
    ),
});

export const productsComparionSchema = z.object({
  compare: z.array(
    z.object({
      title: z
        .string()
        .describe("The given full product title or product name"),
      callId: z
        .string()
        .describe("The given callId as key to access product data details"),
    })
  ),
});

export const inquireUserSchema = z.object({
  question: z
    .string()
    .describe(
      "The primary question or prompt presented to the user to gather additional information. Must be clear, concise, and limited to 500 characters to ensure optimal user engagement"
    ),

  options: z
    .array(
      z.object({
        value: z
          .string()
          .describe(
            "The internal value identifier for the option, used for processing user selections. Must not exceed 200 characters"
          ),
        label: z
          .string()
          .describe(
            "The human-readable text displayed to the user for this option. Should be descriptive yet concise, limited to 250 characters"
          ),
      })
    )
    .describe(
      "An array of selectable options presented to the user. Must contain a minimum of 1 option and cannot exceed 10 options to maintain usability and prevent choice overload"
    ),

  allowsInput: z
    .boolean()
    .describe(
      "Determines whether users can provide additional free-form text input beyond the predefined options. Set to true to enable custom input, false to restrict to only predefined options"
    ),

  inputLabel: z
    .string()
    .optional()
    .describe(
      "The descriptive text label displayed above the custom input field when allowsInput is true. Should clearly indicate what type of input is expected"
    ),

  inputPlaceholder: z
    .string()
    .optional()
    .describe(
      "Example or hint text displayed within the custom input field when empty. Should provide guidance on the expected input format or content"
    ),

  isMultiSelection: z
    .boolean()
    .describe(
      "Controls the option selection behavior. When set to false, users can select only one option. When set to true, users can select multiple options simultaneously"
    ),
});

export type Inquiry = z.infer<typeof inquireUserSchema>;
