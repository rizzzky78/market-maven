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
