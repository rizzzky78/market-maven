import { z } from "zod";

// Define reusable components
const metadataSchema = z.object({
  priority: z.number().min(1).max(5).describe("Priority level of this inquiry"),
  category: z
    .string()
    .describe(
      "Category of the inquiry (e.g., 'technical', 'preference', 'constraint')"
    ),
  dependsOn: z
    .array(z.string())
    .optional()
    .describe("IDs of inquiries this question depends on"),
  tags: z
    .array(z.string())
    .describe("Tags for categorizing and filtering inquiries"),
});

const validationRulesSchema = z.object({
  required: z.boolean().describe("Whether this inquiry requires an answer"),
  minSelections: z
    .number()
    .optional()
    .describe("Minimum number of selections required"),
  maxSelections: z
    .number()
    .optional()
    .describe("Maximum number of selections allowed"),
  customValidation: z
    .string()
    .optional()
    .describe("Custom validation logic expression"),
});

const optionSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the option"),
  value: z.string().max(200).describe("Option value"),
  label: z.string().max(250).describe("Display label for the option"),
  description: z
    .string()
    .optional()
    .describe("Additional context about this option"),
  metadata: z
    .record(z.unknown())
    .optional()
    .describe("Additional metadata for this option"),
  followUpInquiryId: z
    .string()
    .optional()
    .describe("ID of a follow-up inquiry if this option is selected"),
});

const customInputSchema = z.object({
  enabled: z.boolean().describe("Whether custom input is allowed"),
  label: z.string().optional().describe("Label for the custom input field"),
  placeholder: z
    .string()
    .optional()
    .describe("Placeholder text for the custom input field"),
  validation: z
    .object({
      type: z
        .enum(["text", "number", "email", "url"])
        .describe("Type of input validation"),
      pattern: z
        .string()
        .optional()
        .describe("Regular expression pattern for validation"),
      minLength: z.number().optional().describe("Minimum length of input"),
      maxLength: z.number().optional().describe("Maximum length of input"),
      customValidation: z
        .string()
        .optional()
        .describe("Custom validation logic expression"),
    })
    .optional(),
});

// Main inquiry schema
export const inquirySchema = z.object({
  id: z.string().uuid().describe("Unique identifier for this inquiry"),
  version: z.number().describe("Version number of this inquiry schema"),

  question: z.object({
    text: z.string().max(500).describe("The main inquiry question text"),
    context: z
      .string()
      .optional()
      .describe("Additional context or explanation for the question"),
    helpText: z
      .string()
      .optional()
      .describe("Helper text to assist user in answering"),
  }),

  options: z
    .array(optionSchema)
    .min(1)
    .max(10)
    .describe("Available options for this inquiry"),

  metadata: metadataSchema,
  validation: validationRulesSchema,
  customInput: customInputSchema,

  uiConfig: z
    .object({
      displayType: z
        .enum(["radio", "checkbox", "dropdown", "cards"])
        .describe("UI component type for displaying options"),
      layout: z
        .enum(["vertical", "horizontal", "grid"])
        .describe("Layout arrangement of options"),
      theme: z
        .object({
          primaryColor: z.string().optional(),
          backgroundColor: z.string().optional(),
          textColor: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

// Response schema to capture user answers
export const responseSchema = z.object({
  inquiryId: z.string().uuid().describe("ID of the inquiry being answered"),
  timestamp: z.string().datetime().describe("When the response was submitted"),

  selections: z.array(
    z.object({
      optionId: z.string().uuid().describe("ID of the selected option"),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("User's confidence in this selection"),
    })
  ),

  customInput: z
    .string()
    .optional()
    .describe("User's custom input if provided"),

  metadata: z.object({
    sessionId: z.string().uuid().describe("ID of the current session"),
    timeToAnswer: z.number().describe("Time taken to answer in milliseconds"),
    revisions: z
      .number()
      .describe("Number of times the user revised their answer"),
    context: z
      .record(z.unknown())
      .describe("Additional contextual data about the response"),
  }),
});
