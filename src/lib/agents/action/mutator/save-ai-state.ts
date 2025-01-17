"use server";

import { AIState, ChatProperties } from "@/lib/types/ai";
import { generateText, TextPart } from "ai";
import { Session } from "next-auth";
import { getChat, saveChat } from "../chat-service";
import { google } from "@ai-sdk/google";
import { SYSTEM_INSTRUCT_TITLE_CRAFTER } from "../../system-instructions";

export const saveAIState = async (state: AIState, session: Session | null) => {
  const { chatId, messages } = state;

  const userId = session?.user?.email || "anonymous";

  let chatTitle: string = "";

  const currentChatData = await getChat(chatId);

  if (!currentChatData || currentChatData.title) {
    try {
      const payloadTitleMsg = messages.filter((m) => m.role !== "tool");

      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: JSON.stringify(payloadTitleMsg),
        system: SYSTEM_INSTRUCT_TITLE_CRAFTER,
      });
      chatTitle = text;
    } catch (error) {
      console.error(error);

      const [userMsg] = messages;
      if (typeof userMsg.content === "string") {
        chatTitle = userMsg.content;
      } else {
        chatTitle =
          (userMsg.content[0] as TextPart).text.substring(0, 100) || "Untitled";
      }
    }
  }

  const savePayload: ChatProperties = {
    chatId,
    userId,
    created: new Date(),
    title: chatTitle,
    messages,
  };

  await saveChat(userId, savePayload);
};
