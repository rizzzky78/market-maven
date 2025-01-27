import { DeepPartial } from "ai";
import { z } from "zod";

export const inquirySchema = z.object({
  question: z
    .string()
    .describe(
      "The main inquiry question presented to the user. Question must be less than 500 characters"
    ),

  options: z
    .array(
      z.object({
        value: z
          .string()
          .describe("Option value must be less than 200 characters"),
        label: z
          .string()
          .describe("Option label must be less than 250 characters"),
      })
    )
    .describe(
      "The list of selectable options for the inquiry. At least one option and maximum of 10 options allowed"
    ),

  allowsInput: z
    .boolean()
    .describe("Whether additional free-form input is permitted"),

  inputLabel: z
    .string()
    .optional()
    .describe("The label for the additional input field"),

  inputPlaceholder: z
    .string()
    .optional()
    .describe("The placeholder text for the additional input field"),

  isMultiSelection: z
    .boolean()
    .describe(
      "The type of selection allowed (`false` if only allow single selection and `true` when allow multiple options)"
    ),
});

export type Inquiry = z.infer<typeof inquirySchema>;

export type PartialInquiry = DeepPartial<typeof inquirySchema>;
