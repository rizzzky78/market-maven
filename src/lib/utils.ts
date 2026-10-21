import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getEnv } from "./utility/get-env";
import type { Streamed } from "./types/ai";
import {
  ProductDetailsToolResult,
  ProductDetailsInsightToolResult,
  UnionProductDetails,
} from "./types/product";

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

export function formatDateWithTime(date: Date | string) {
  const parsedDate = new Date(date);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (
    parsedDate.getDate() === now.getDate() &&
    parsedDate.getMonth() === now.getMonth() &&
    parsedDate.getFullYear() === now.getFullYear()
  ) {
    return `Today, ${formatTime(parsedDate)}`;
  } else if (
    parsedDate.getDate() === yesterday.getDate() &&
    parsedDate.getMonth() === yesterday.getMonth() &&
    parsedDate.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday, ${formatTime(parsedDate)}`;
  } else {
    return parsedDate.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
}

/**
 * Type guard to check if result is a basic ProductDetailsToolResult
 * @param result - The tool result to check
 * @returns True if result contains screenshot and no previousData
 */
export function isProductDetailsToolResult(
  result: UnionProductDetails
): result is ProductDetailsToolResult {
  return "screenshot" in result && !("previousData" in result);
}

/**
 * Type guard to check if result is a ProductDetailsInsightToolResult
 * @param result - The tool result to check
 * @returns True if result contains previousData and snapshots
 */
export function isProductDetailsInsightToolResult(
  result: UnionProductDetails
): result is ProductDetailsInsightToolResult {
  return "previousData" in result && "snapshots" in result;
}

/**
 * Unpacks a streamed prop into `[value, error, pending]`, the tuple the
 * stream components used to get from `useStreamableValue`.
 */
export function readStreamed<T>(
  streamed: Streamed<T>
): [T | undefined, boolean, boolean] {
  return [
    streamed.value,
    streamed.status === "error",
    streamed.status === "streaming",
  ];
}
