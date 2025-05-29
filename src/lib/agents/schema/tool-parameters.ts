import { z } from "zod";

export const recommendatorSchema = z.object({
  intent: z
    .string()
    .describe(
      "A narative natural language description of the user's intent or what they are seeking in the product recommendations. Think this as for guide the agent to search the exact product. Example: 'The user looking a laptop for daily usage with long lasting battery as wel as color accuracy for editing'"
    ),
  scope: z
    .array(z.string())
    .describe(
      "An array of strings representing additional context, such as categories, brands, or other filters, to refine the product recommendations."
    ),
});

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
    .optional()
    .describe(
      "The complete product URL, if the source is `tokopedia` then the link will be available. Must be a valid, accessible URL that follows the pattern 'https://www.tokopedia.com/'"
    ),
  source: z
    .enum(["tokopedia", "global"])
    .describe(
      "The source platform from which the product details are being requested. Must be either 'tokopedia' or 'global' to ensure compatibility with the respective data retrieval methods."
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

export const inputInquirySchema = z.object({
  purpose: z
    .string()
    .describe(
      "The primary purpose of the inquiry, describing what information needs to be gathered from the user. Must be clear and concise, limited to 300 characters."
    ),

  scope: z
    .array(z.string())
    .describe(
      "An array of topics or areas the inquiry should cover. Each topic should be specific and relevant to the purpose. Limited to 5 topics to maintain focus."
    ),

  data: z
    .array(
      z.object({
        focus: z
          .string()
          .describe(
            "The specific aspect or feature the data relates to (e.g., 'budget', 'brand preference', 'usage type'). Must be clear and concise, limited to 100 characters."
          ),
        data: z
          .string()
          .describe(
            "The actual data or context related to the focus. Must be relevant and concise, limited to 500 characters."
          ),
      })
    )
    .describe(
      "An array of additional data points to be injected into the inquiry. Each object should contain a focus and corresponding data to guide the inquiry crafting process."
    ),
});

export const inquireUserSchema = z.object({
  inquiry: z.object({
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
  }),
});

export type Inquiry = z.infer<typeof inquireUserSchema>;
