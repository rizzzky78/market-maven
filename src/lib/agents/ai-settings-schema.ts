import { z } from "zod";
import { needsBaseURL, ProviderId, providerIds } from "./providers";

/**
 * Parts of the agent pipeline that can run on their own connection and
 * model. `default` drives the chat reply and every role without its own
 * assignment; `light` writes follow-ups (related queries, chat titles).
 */
export const MODEL_ROLES = [
  "default",
  "light",
  "searchProduct",
  "getProductDetails",
  "productsComparison",
  "recommendator",
  "webResearch",
  "inquireUser",
] as const;

export type ModelRole = (typeof MODEL_ROLES)[number];

/** Roles that map to an agent tool (the orchestrator's toolset keys). */
export type ToolRole = Exclude<ModelRole, "default" | "light">;

export const MODEL_ROLE_INFO: Record<ModelRole, { label: string; description: string }> = {
  default: {
    label: "Default",
    description:
      "Routes each message and writes the chat reply. Every tool without its own model uses this one. Must support tool calling.",
  },
  light: {
    label: "Follow-ups",
    description:
      "Related questions, inquiry options and chat titles. A small, fast model fits best.",
  },
  searchProduct: {
    label: "Product search",
    description: "Validates the query, extracts marketplace listings and writes the search insight.",
  },
  getProductDetails: {
    label: "Product details",
    description: "Researches one product, extracts its specifications and writes the details insight.",
  },
  productsComparison: {
    label: "Comparison",
    description: "Builds the side-by-side table and the verdict for two products.",
  },
  recommendator: {
    label: "Recommendations",
    description: "Researches candidates for a need and budget and ranks them.",
  },
  webResearch: {
    label: "Web research",
    description: "Answers factual questions with web-grounded sources.",
  },
  inquireUser: {
    label: "Clarifying questions",
    description: "Crafts the question and options shown when a request is too vague.",
  },
};

/** AI SDK reasoning levels; `provider-default` leaves the provider's own default. */
export const REASONING_LEVELS = [
  "provider-default",
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const;

export type ReasoningLevel = (typeof REASONING_LEVELS)[number];

export const CHAT_STYLES = ["concise", "balanced", "detailed"] as const;
export const CHAT_TONES = ["neutral", "friendly", "professional"] as const;
export const ANALYSIS_DEPTHS = ["quick", "standard", "deep"] as const;

export const ANALYSIS_PRIORITIES = {
  price: "Price and value for money",
  performance: "Performance",
  battery: "Battery life",
  display: "Display quality",
  camera: "Camera",
  build: "Build quality and durability",
  reviews: "User reviews and reputation",
  warranty: "Warranty and after-sales service",
  availability: "Local availability and seller trust",
} as const;

export type AnalysisPriority = keyof typeof ANALYSIS_PRIORITIES;

const analysisPriorityIds = Object.keys(ANALYSIS_PRIORITIES) as [
  AnalysisPriority,
  ...AnalysisPriority[],
];

export const INSTRUCTIONS_MAX_LENGTH = 4000;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null)
    .nullable()
    .optional();

/**
 * A connection the user adds or edits. `apiKey` may be empty on edit to keep
 * the stored key.
 */
export const connectionInputSchema = z
  .object({
    id: z.string().min(1).max(64).optional(),
    label: z.string().trim().min(1).max(60),
    provider: z.enum(providerIds as [ProviderId, ...ProviderId[]]),
    apiKey: z.string().trim().max(500).optional(),
    baseURL: optionalText(500),
    structuredOutputs: z.boolean().nullable().optional(),
  })
  .refine((c) => !needsBaseURL(c.provider) || !!c.baseURL, {
    message: "A custom endpoint needs a base URL",
    path: ["baseURL"],
  })
  .refine((c) => !!c.id || !!c.apiKey, {
    message: "Enter the API key",
    path: ["apiKey"],
  });

export type ConnectionInput = z.input<typeof connectionInputSchema>;

/** Model and generation parameters for one pipeline role. */
export const assignmentInputSchema = z.object({
  role: z.enum(MODEL_ROLES),
  connectionId: z.string().min(1).max(64),
  model: z.string().trim().min(1).max(200),
  temperature: z.number().min(0).max(2).nullable().optional(),
  maxOutputTokens: z.number().int().min(16).max(200_000).nullable().optional(),
  reasoning: z.enum(REASONING_LEVELS).nullable().optional(),
});

export type AssignmentInput = z.input<typeof assignmentInputSchema>;

/** Custom instructions, chat style and analysis preferences. */
export const preferencesInputSchema = z.object({
  instructions: optionalText(INSTRUCTIONS_MAX_LENGTH),
  style: z.enum(CHAT_STYLES),
  tone: z.enum(CHAT_TONES),
  language: optionalText(40),
  depth: z.enum(ANALYSIS_DEPTHS),
  priorities: z.array(z.enum(analysisPriorityIds)).max(analysisPriorityIds.length),
  currency: optionalText(8),
  budgetMax: z.number().int().positive().max(1_000_000_000_000).nullable().optional(),
  trackUsage: z.boolean(),
});

export type PreferencesInput = z.input<typeof preferencesInputSchema>;
export type Preferences = z.output<typeof preferencesInputSchema>;

export const DEFAULT_PREFERENCES: Preferences = {
  instructions: null,
  style: "balanced",
  tone: "neutral",
  language: null,
  depth: "standard",
  priorities: [],
  currency: null,
  budgetMax: null,
  trackUsage: true,
};

/** A connection as shown to the client: the key is never included. */
export type ConnectionView = {
  id: string;
  label: string;
  provider: ProviderId;
  baseURL: string | null;
  apiKeyHint: string;
  structuredOutputs: boolean | null;
};

export type AssignmentView = z.output<typeof assignmentInputSchema>;

/** Token usage totals for the AI settings usage section. */
export type UsageSummary = {
  days: number;
  totals: { calls: number; input: number; output: number; reasoning: number; cached: number };
  byModel: { provider: string; model: string; calls: number; input: number; output: number }[];
  byRole: { role: string; calls: number; input: number; output: number }[];
  daily: { day: string; input: number; output: number }[];
};

/** Result of a server action called from the settings page. */
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };
