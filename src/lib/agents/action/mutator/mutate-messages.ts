import {
  MessageProperty,
  PayloadData,
  UserContentMessage,
} from "@/lib/types/ai";
import {
  JSONValue,
  ModelMessage,
  TextPart,
  ToolCallPart,
  ToolResultPart,
} from "ai";

const toToolOutput = (result: unknown): ToolResultPart["output"] =>
  typeof result === "string"
    ? { type: "text", value: result }
    : { type: "json", value: (result ?? null) as JSONValue };

/**
 * Converts persisted `MessageProperty` objects to AI SDK `ModelMessage` objects.
 *
 * Persisted tool parts keep the AI SDK 4 shape (`args` / `result`) and are mapped
 * to the current `input` / `output` shape here. System messages are dropped:
 * system prompts are passed through `instructions`, and AI SDK 7 rejects them
 * inside `messages`.
 *
 * @param messages - Array of objects adhering to the `MessageProperty` interface.
 * @returns An array of `ModelMessage` objects.
 */
export const toModelMessages = (messages: MessageProperty[]): ModelMessage[] =>
  messages.flatMap((m): ModelMessage[] => {
    switch (m.role) {
      case "system":
        return [];
      case "user":
        return [
          {
            role: "user",
            content:
              typeof m.content === "string"
                ? m.content
                : m.content.flatMap((p) => (p.type === "text" ? [p] : [])),
          },
        ];
      case "assistant":
        return [
          {
            role: "assistant",
            content:
              typeof m.content === "string"
                ? m.content
                : m.content.flatMap((p): Array<TextPart | ToolCallPart> => {
                    if (p.type === "text") return [p];
                    if (p.type === "tool-call")
                      return [
                        {
                          type: "tool-call",
                          toolCallId: p.toolCallId,
                          toolName: p.toolName,
                          input: p.args,
                        },
                      ];
                    return [];
                  }),
          },
        ];
      case "tool":
        return typeof m.content === "string"
          ? []
          : [
              {
                role: "tool",
                content: m.content.flatMap((p) =>
                  p.type === "tool-result"
                    ? [
                        {
                          type: "tool-result" as const,
                          toolCallId: p.toolCallId,
                          toolName: p.toolName,
                          output: toToolOutput(p.result),
                        },
                      ]
                    : []
                ),
              },
            ];
    }
  });

/**
 * Shortens the results of all but the latest `keepFull` tool messages to
 * `maxChars` characters before they are sent to the model.
 *
 * Tool results are large (scraped listings, full spec sheets) and are
 * re-sent on every turn, so older ones dominate cost and latency while the
 * model only needs their identity: tool name, args and callId stay within
 * the first characters of the serialized result. The full data remains in
 * the stored AI state and the database.
 */
export const compactToolResults = (
  messages: MessageProperty[],
  { keepFull = 2, maxChars = 1500 } = {}
): MessageProperty[] => {
  let toolMessagesSeen = 0;

  return messages
    .slice()
    .reverse()
    .map((m) => {
      if (m.role !== "tool" || typeof m.content === "string") return m;
      if (++toolMessagesSeen <= keepFull) return m;

      return {
        ...m,
        content: m.content.map((p) =>
          p.type === "tool-result" &&
          typeof p.result === "string" &&
          p.result.length > maxChars
            ? {
                ...p,
                result: `${p.result.slice(0, maxChars)}… [truncated older tool result; full data was shown to the user earlier]`,
              }
            : p
        ),
      } as MessageProperty;
    })
    .reverse();
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
 * @returns `ModelMessage` Array containing only the last 4 messages, or all messages if less than 4
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
): ModelMessage[] {
  // If array is empty or undefined, return empty array
  if (!messages || messages.length === 0) {
    return [];
  }

  // Calculate start index to get last 4 items
  const startIndex = Math.max(messages.length - slice, 0);

  return toModelMessages(messages.slice(startIndex));
}
