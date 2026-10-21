"use server";

import { defaultModels, Models } from "@/lib/agents/models";
import { AIState, ChatProperties, MessageProperty } from "@/lib/types/ai";
import { generateText, TextPart } from "ai";
import { getChatMeta, saveChat } from "../chat-service";
import logger from "@/lib/utility/logger";
import SYSTEM_INSTRUCTION from "../../constant/md";

const generateChatTitle = async (
  messages: MessageProperty[],
  models: Models
): Promise<string> => {
  const { text } = await generateText({
    model: models.light,
    prompt: JSON.stringify(messages),
    instructions: await SYSTEM_INSTRUCTION.TITLE_CRAFTER,
  });
  // Models sometimes wrap the title in quotes or markdown; keep a plain title.
  return (
    text
      .trim()
      .replace(/^[#*"'\s]+|[*"'\s]+$/g, "")
      .slice(0, 100) || getFallbackTitle(messages)
  );
};

const getFallbackTitle = (messages: MessageProperty[]): string => {
  const [firstMessage] = messages;
  if (!firstMessage) return "Untitled";

  if (typeof firstMessage.content === "string") {
    return firstMessage.content.substring(0, 100) || "Untitled";
  }

  const firstTextPart = firstMessage.content.find(
    (part): part is TextPart => part.type === "text"
  );
  return firstTextPart?.text.substring(0, 100) || "Untitled";
};

const getGeneratedTitle = async (
  messages: MessageProperty[],
  models: Models
): Promise<string> => {
  try {
    const filteredMessages = messages.filter(
      (message) => message.role !== "tool"
    );
    return await generateChatTitle(filteredMessages, models);
  } catch (error) {
    logger.error("Failed to generate chat title:", { error });
    return getFallbackTitle(messages);
  }
};

/**
 * Saves the chat; the title of a new chat is written by `models.light` (the
 * request's own models when the user brought a key).
 */
export const saveAIState = async (
  state: AIState,
  models: Models = defaultModels
): Promise<void> => {
  const { chatId, username, messages } = state;
  const currentChat = await getChatMeta(chatId);

  const title = currentChat?.title || (await getGeneratedTitle(messages, models));
  const createdDate = currentChat?.createdAt || new Date();

  const savePayload: ChatProperties = {
    chatId,
    userId: username,
    created: createdDate,
    title,
    messages,
  };

  await saveChat(username, savePayload);
};
