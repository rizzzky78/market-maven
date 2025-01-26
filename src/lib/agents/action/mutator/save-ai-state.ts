"use server";

import { AIState, ChatProperties } from "@/lib/types/ai";
import { generateText, TextPart } from "ai";
import { Session } from "next-auth";
import { getChat, saveChat } from "../chat-service";
import { google } from "@ai-sdk/google";
import { SYSTEM_INSTRUCT_TITLE_CRAFTER } from "../../system-instructions";

/**
 * Saves the AI state to the database, including dynamically generating a chat title if not already set.
 *
 * @param state - The current AI state containing chat details.
 * @param session - The user session, or `null` for anonymous users.
 */
export const saveAIState = async (
  state: AIState,
  session: Session | null
): Promise<void> => {
  const { chatId, messages } = state;

  // Default to "anonymous" if the user is not authenticated
  const userId = session?.user?.email || "anonymous";

  let chatTitle = "";

  // Retrieve current chat data
  const currentChatData = await getChat(chatId);

  // Generate a title only if there is no existing title
  if (
    !currentChatData ||
    !currentChatData.title ||
    currentChatData.title === ""
  ) {
    try {
      // Filter out tool messages for title generation
      const payloadTitleMsg = messages.filter((m) => m.role !== "tool");

      // Generate the chat title using the AI model
      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: JSON.stringify(payloadTitleMsg),
        system: SYSTEM_INSTRUCT_TITLE_CRAFTER,
      });

      chatTitle = text;
    } catch (error) {
      console.error("Error generating chat title:", error);

      // Fallback to using the content of the first message
      const [userMsg] = messages;
      if (typeof userMsg.content === "string") {
        chatTitle = userMsg.content;
      } else {
        chatTitle =
          (userMsg.content[0] as TextPart).text.substring(0, 100) || "Untitled";
      }
    }
  }

  // Prepare the payload to save
  const savePayload: ChatProperties = {
    chatId,
    userId,
    created: new Date(),
    title: chatTitle,
    messages,
  };

  // Save the chat data
  await saveChat(userId, savePayload);
};
