import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getEnv } from "./utility/get-env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function processURLQuery(query: string) {
  const encodedQuery = encodeURIComponent(query.replace(/\s+/g, "+")).replace(
    /%2B/g,
    "+"
  );
  return `${getEnv("TOKOPEDIA_SEARCH_BASE_URL")}${encodedQuery}`;
}
