import { z } from "zod";
import {
  SerperWebSearchResponse,
  SerperImagesSearchResponse,
  SerperVideosSearchResponse,
  SerperNewsSearchResponse,
  SerperShoppingSearchResponse,
} from "@/lib/types/serper";

// Base schema for common parameters
const baseSearchSchema = z.object({
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

// Web Search Function
export async function webSearch({
  q,
  gl,
  hl,
  num,
  page,
  autocorrect,
  safe,
  tbs,
  filter,
}: z.infer<typeof baseSearchSchema> & {
  type?: "search";
  tbs?: string;
  filter?: string;
}): Promise<SerperWebSearchResponse> {
  // Added return type
  const schema = baseSearchSchema.extend({
    type: z.literal("search").optional().describe("Search type"),
    tbs: z.string().optional().describe("Time-based search filters"),
    filter: z.string().optional().describe("Additional filters"),
  });
  const params = schema.parse({
    q,
    gl,
    hl,
    num,
    page,
    autocorrect,
    safe,
    tbs,
    filter,
  });

  const urlParams = new URLSearchParams({
    q: params.q,
    ...(params.gl && { gl: params.gl }),
    ...(params.hl && { hl: params.hl }),
    ...(params.num && { num: params.num.toString() }),
    ...(params.page && { page: params.page.toString() }),
    ...(params.autocorrect !== undefined && {
      autocorrect: params.autocorrect.toString(),
    }),
    ...(params.safe && { safe: params.safe }),
    ...(params.tbs && { tbs: params.tbs }),
    ...(params.filter && { filter: params.filter }),
  });

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(urlParams)),
  });

  return await response.json();
}

// Images Search Function
export async function imagesSearch({
  q,
  gl,
  hl,
  num,
  page,
  autocorrect,
  safe,
  tbs,
  imgSize,
  imgType,
  imgColorType,
  imgDominantColor,
}: z.infer<typeof baseSearchSchema> & {
  type?: "images";
  tbs?: string;
  imgSize?: "small" | "medium" | "large" | "xlarge";
  imgType?: "face" | "photo" | "clipart" | "lineart";
  imgColorType?: "color" | "gray" | "mono";
  imgDominantColor?:
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "teal"
    | "blue"
    | "purple"
    | "pink"
    | "white"
    | "gray"
    | "black"
    | "brown";
}): Promise<SerperImagesSearchResponse> {
  // Added return type
  const schema = baseSearchSchema.extend({
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
  const params = schema.parse({
    q,
    gl,
    hl,
    num,
    page,
    autocorrect,
    safe,
    tbs,
    imgSize,
    imgType,
    imgColorType,
    imgDominantColor,
  });

  const urlParams = new URLSearchParams({
    q: params.q,
    ...(params.gl && { gl: params.gl }),
    ...(params.hl && { hl: params.hl }),
    ...(params.num && { num: params.num.toString() }),
    ...(params.page && { page: params.page.toString() }),
    ...(params.autocorrect !== undefined && {
      autocorrect: params.autocorrect.toString(),
    }),
    ...(params.safe && { safe: params.safe }),
    ...(params.tbs && { tbs: params.tbs }),
    ...(params.imgSize && { imgSize: params.imgSize }),
    ...(params.imgType && { imgType: params.imgType }),
    ...(params.imgColorType && { imgColorType: params.imgColorType }),
    ...(params.imgDominantColor && {
      imgDominantColor: params.imgDominantColor,
    }),
  });

  const response = await fetch("https://google.serper.dev/images", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(urlParams)),
  });

  return await response.json();
}

// Videos Search Function
export async function videosSearch({
  q,
  gl,
  hl,
  num,
  page,
  autocorrect,
  safe,
  tbs,
}: z.infer<typeof baseSearchSchema> & {
  type?: "videos";
  tbs?: string;
}): Promise<SerperVideosSearchResponse> {
  // Added return type
  const schema = baseSearchSchema.extend({
    type: z.literal("videos").optional().describe("Search type"),
    tbs: z
      .string()
      .optional()
      .describe("Video filters (duration, quality, source, etc.)"),
  });
  const params = schema.parse({ q, gl, hl, num, page, autocorrect, safe, tbs });

  const urlParams = new URLSearchParams({
    q: params.q,
    ...(params.gl && { gl: params.gl }),
    ...(params.hl && { hl: params.hl }),
    ...(params.num && { num: params.num.toString() }),
    ...(params.page && { page: params.page.toString() }),
    ...(params.autocorrect !== undefined && {
      autocorrect: params.autocorrect.toString(),
    }),
    ...(params.safe && { safe: params.safe }),
    ...(params.tbs && { tbs: params.tbs }),
  });

  const response = await fetch("https://google.serper.dev/videos", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(urlParams)),
  });

  return await response.json();
}

// News Search Function
export async function newsSearch({
  q,
  gl,
  hl,
  num,
  page,
  autocorrect,
  safe,
  tbs,
  tbm,
}: z.infer<typeof baseSearchSchema> & {
  type?: "news";
  tbs?: string;
  tbm?: "nws";
}): Promise<SerperNewsSearchResponse> {
  // Added return type
  const schema = baseSearchSchema.extend({
    type: z.literal("news").optional().describe("Search type"),
    tbs: z.string().optional().describe("Time-based news filters"),
    tbm: z.literal("nws").optional().describe("News search mode"),
  });
  const params = schema.parse({
    q,
    gl,
    hl,
    num,
    page,
    autocorrect,
    safe,
    tbs,
    tbm,
  });

  const urlParams = new URLSearchParams({
    q: params.q,
    ...(params.gl && { gl: params.gl }),
    ...(params.hl && { hl: params.hl }),
    ...(params.num && { num: params.num.toString() }),
    ...(params.page && { page: params.page.toString() }),
    ...(params.autocorrect !== undefined && {
      autocorrect: params.autocorrect.toString(),
    }),
    ...(params.safe && { safe: params.safe }),
    ...(params.tbs && { tbs: params.tbs }),
    ...(params.tbm && { tbm: params.tbm }),
  });

  const response = await fetch("https://google.serper.dev/news", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(urlParams)),
  });

  return await response.json();
}

// Shopping Search Function
export async function shoppingSearch({
  q,
  gl,
  hl,
  num,
  page,
  autocorrect,
  safe,
  tbs,
  location,
}: z.infer<typeof baseSearchSchema> & {
  type?: "shopping";
  tbs?: string;
  location?: string;
}): Promise<SerperShoppingSearchResponse> {
  // Added return type
  const schema = baseSearchSchema.extend({
    type: z.literal("shopping").optional().describe("Search type"),
    tbs: z
      .string()
      .optional()
      .describe("Shopping filters (price, rating, etc.)"),
    location: z
      .string()
      .optional()
      .describe("Location for local shopping results"),
  });
  const params = schema.parse({
    q,
    gl,
    hl,
    num,
    page,
    autocorrect,
    safe,
    tbs,
    location,
  });

  const urlParams = new URLSearchParams({
    q: params.q,
    ...(params.gl && { gl: params.gl }),
    ...(params.hl && { hl: params.hl }),
    ...(params.num && { num: params.num.toString() }),
    ...(params.page && { page: params.page.toString() }),
    ...(params.autocorrect !== undefined && {
      autocorrect: params.autocorrect.toString(),
    }),
    ...(params.safe && { safe: params.safe }),
    ...(params.tbs && { tbs: params.tbs }),
    ...(params.location && { location: params.location }),
  });

  const response = await fetch("https://google.serper.dev/shopping", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(urlParams)),
  });

  return await response.json();
}
