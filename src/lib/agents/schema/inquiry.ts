import { DeepPartial } from "ai";
import { z } from "zod";

/**
 * Represents a schema for creating user inquiries with customizable options and input fields.
 *
 * @interface Inquiry
 *
 * @property {string} question - The main inquiry question presented to the user
 * @property {Array<{value: string, label: string}>} options - The list of selectable options for the inquiry
 * @property {boolean} allowsInput - Indicates whether additional free-form input is permitted
 * @property {string} [inputLabel] - Optional label for the additional input field
 * @property {string} [inputPlaceholder] - Optional placeholder text for the additional input field
 * @property {"single" | "multiple"} [type="single"] - The type of selection allowed (single or multiple options)
 *
 * @example
 * const inquiry: Inquiry = {
 *   question: "What is your preferred contact method?",
 *   options: [
 *     { value: "email", label: "Email" },
 *     { value: "phone", label: "Phone" }
 *   ],
 *   allowsInput: true,
 *   type: "single"
 * };
 */
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
