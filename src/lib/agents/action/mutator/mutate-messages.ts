import {
  MessageProperty,
  PayloadData,
  UserContentMessage,
} from "@/lib/types/ai";
import { CoreMessage } from "ai";

/**
 * Converts an array of `MessageProperty` objects to an array of `CoreMessage` objects.
 *
 * @param messages - Array of objects adhering to the `MessageProperty` interface.
 * @returns An array of `CoreMessage` objects with `role` and `content` properties.
 */
export const toCoreMessage = (m: MessageProperty[]): CoreMessage[] => {
  return m.map((m) => ({ role: m.role, content: m.content } as CoreMessage));
};

/**
 * Converts payload object data to unified user content message
 *
 * @param payload - A payload of optional properties
 * @returns An object contain at least one property of UserContentMessage
 */
export const toUnifiedUserMessage = (payload: PayloadData) => {
  const { textInput, attachProduct, productCompare, inquiryResponse } = payload;

  return {
    text_input: textInput ?? null,
    attach_product: attachProduct ?? null,
    product_compare: productCompare ?? null,
    inquiry_response: inquiryResponse ?? null,
  } as UserContentMessage;
};

/**
 * Filters an array of messages to return only the last 4 items.
 *
 * @param {MessageProperty} messages - Array of messages to be filtered
 * @param {number} slice - The last index messages to be filtered
 * @returns `CoreMessage` Array containing only the last 4 messages, or all messages if less than 4
 *
 * @example
 * const messages: MessageProperty[] = [
 *   { id: "1", role: "user", content: "Hello" },
 *   { id: "2", role: "assistant", content: "Hi" },
 *   // ... more messages
 * ];
 * const lastFourMessages = toPayloadRelatedMessage(messages, 4);
 */
export function toPayloadRelatedMessage(
  messages: MessageProperty[],
  slice: number = 4
): CoreMessage[] {
  // If array is empty or undefined, return empty array
  if (!messages || messages.length === 0) {
    return [];
  }

  // Calculate start index to get last 4 items
  const startIndex = Math.max(messages.length - slice, 0);

  return toCoreMessage(messages.slice(startIndex));
}
