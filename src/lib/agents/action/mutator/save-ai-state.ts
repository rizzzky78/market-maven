"use server";

import { AIState, ChatProperties, MessageProperty } from "@/lib/types/ai";
import { generateText, TextPart } from "ai";
import { google } from "@ai-sdk/google";
import { getChat, saveChat } from "../chat-service";
import logger from "@/lib/utility/logger";
import SYSTEM_INSTRUCTION from "../../constant/md";

const generateChatTitle = async (
  messages: MessageProperty[]
): Promise<string> => {
  const { text } = await generateText({
    model: google("gemini-1.5-flash"),
    prompt: JSON.stringify(messages),
    system: await SYSTEM_INSTRUCTION.TITLE_CRAFTER,
  });
  return text;
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
  messages: MessageProperty[]
): Promise<string> => {
  try {
    const filteredMessages = messages.filter(
      (message) => message.role !== "tool"
    );
    return await generateChatTitle(filteredMessages);
  } catch (error) {
    logger.error("Failed to generate chat title:", { error });
    return getFallbackTitle(messages);
  }
};

export const saveAIState = async (state: AIState): Promise<void> => {
  const { chatId, username, messages } = state;
  const currentChat = await getChat(chatId);

  const title = currentChat?.title || (await getGeneratedTitle(messages));
  const createdDate = currentChat?.created || new Date();

  const savePayload: ChatProperties = {
    chatId,
    userId: username,
    created: createdDate,
    title,
    messages,
  };

  await saveChat(username, savePayload);
};
