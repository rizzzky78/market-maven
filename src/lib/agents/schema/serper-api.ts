import { z } from "zod";

// Base schema for common parameters
export const baseSearchSchema = z.object({
  q: z.string().describe("Search query"),
  gl: z
    .string()
    .optional()
    .describe('Country code for geolocation (e.g., "us", "uk")'),
  hl: z.string().optional().describe('Language code (e.g., "en", "es")'),
  num: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Number of results (1-100)"),
  page: z.number().min(1).optional().describe("Page number for pagination"),
  autocorrect: z.boolean().optional().describe("Enable/disable autocorrect"),
  safe: z.enum(["active", "off"]).optional().describe("Safe search setting"),
});

export const webSearchSchema = baseSearchSchema.extend({
  type: z.literal("search").optional().describe("Search type"),
  tbs: z.string().optional().describe("Time-based search filters"),
  filter: z.string().optional().describe("Additional filters"),
});

export const imageSearchSchema = baseSearchSchema.extend({
  type: z.literal("images").optional().describe("Search type"),
  tbs: z
    .string()
    .optional()
    .describe("Image filters (size, color, type, etc.)"),
  imgSize: z
    .enum(["small", "medium", "large", "xlarge"])
    .optional()
    .describe("Image size filter"),
  imgType: z
    .enum(["face", "photo", "clipart", "lineart"])
    .optional()
    .describe("Image type filter"),
  imgColorType: z
    .enum(["color", "gray", "mono"])
    .optional()
    .describe("Image color type"),
  imgDominantColor: z
    .enum([
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "blue",
      "purple",
      "pink",
      "white",
      "gray",
      "black",
      "brown",
    ])
    .optional()
    .describe("Dominant color filter"),
});

export const videoSearchSchema = baseSearchSchema.extend({
  type: z.literal("videos").optional().describe("Search type"),
  tbs: z
    .string()
    .optional()
    .describe("Video filters (duration, quality, source, etc.)"),
});

export const newsSearchSchema = baseSearchSchema.extend({
  type: z.literal("news").optional().describe("Search type"),
  tbs: z.string().optional().describe("Time-based news filters"),
  tbm: z.literal("nws").optional().describe("News search mode"),
});

export const shoppingSearchSchema = baseSearchSchema.extend({
  type: z.literal("shopping").optional().describe("Search type"),
  tbs: z.string().optional().describe("Shopping filters (price, rating, etc.)"),
  location: z
    .string()
    .optional()
    .describe("Location for local shopping results"),
});
