import { z } from "zod";
import {
  SerperWebSearchResponse,
  SerperImagesSearchResponse,
  SerperVideosSearchResponse,
  SerperNewsSearchResponse,
  SerperShoppingSearchResponse,
} from "@/lib/types/serper";
import { getEnv } from "@/lib/utility/get-env";
import {
  baseSearchSchema,
  imageSearchSchema,
  newsSearchSchema,
  shoppingSearchSchema,
  videoSearchSchema,
  webSearchSchema,
} from "@/lib/agents/schema/serper-api";

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
  const params = webSearchSchema.parse({
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
      "X-API-KEY": getEnv("SERPER_API_KEY"),
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
  const params = imageSearchSchema.parse({
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
      "X-API-KEY": getEnv("SERPER_API_KEY"),
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

  const params = videoSearchSchema.parse({
    q,
    gl,
    hl,
    num,
    page,
    autocorrect,
    safe,
    tbs,
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
  });

  const response = await fetch("https://google.serper.dev/videos", {
    method: "POST",
    headers: {
      "X-API-KEY": getEnv("SERPER_API_KEY"),
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

  const params = newsSearchSchema.parse({
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
      "X-API-KEY": getEnv("SERPER_API_KEY"),
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

  const params = shoppingSearchSchema.parse({
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
      "X-API-KEY": getEnv("SERPER_API_KEY"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(urlParams)),
  });

  return await response.json();
}
