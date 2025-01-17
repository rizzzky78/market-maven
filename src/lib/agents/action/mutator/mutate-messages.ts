import { MessageProperty } from "@/lib/types/ai";
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
