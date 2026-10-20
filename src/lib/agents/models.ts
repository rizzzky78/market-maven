import { google } from "@ai-sdk/google";
import { defaultSettingsMiddleware, wrapLanguageModel } from "ai";

const REASONING_MODEL = process.env.MAVEN_REASONING_MODEL || "gemini-2.5-flash";
const LIGHT_MODEL = process.env.MAVEN_LIGHT_MODEL || "gemini-2.5-flash-lite";

/**
 * Model tiers used across the agent pipeline. Pick by the job, not by habit:
 *
 * - `reasoning`: routing, research and user-facing analysis (thinking on).
 * - `extract`: same model with thinking off, for turning scraped pages or
 *   search results into JSON/tables. The answer is in the input, so thinking
 *   only adds latency and cost.
 * - `light`: small follow-ups (related queries, inquiry options, chat title).
 *
 * Override the model ids with MAVEN_REASONING_MODEL / MAVEN_LIGHT_MODEL.
 */
export const models = {
  reasoning: google(REASONING_MODEL),
  extract: wrapLanguageModel({
    model: google(REASONING_MODEL),
    middleware: defaultSettingsMiddleware({
      settings: {
        providerOptions: {
          google: { thinkingConfig: { thinkingBudget: 0 } },
        },
      },
    }),
  }),
  light: google(LIGHT_MODEL),
};
