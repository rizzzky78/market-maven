import { createMutableState, orchestrate } from "@/app/server/orchestrator";
import { getChat } from "@/lib/agents/action/chat-service";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { ChatRequestBody, MavenUIMessage } from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { getServerSession } from "next-auth";

/**
 * Streams the reply to one chat message for `useChat`. The chat history is
 * read from the database, not from the client, and saved when the reply ends.
 * Stopping the reply on the client aborts `req.signal`, which cancels the
 * model calls and stops the running tool.
 */
export async function POST(req: Request) {
  const { chatId, payload, requestOption } =
    (await req.json()) as ChatRequestBody;

  if (typeof chatId !== "string" || !chatId || !payload) {
    return new Response("Invalid chat request", { status: 400 });
  }

  const session = await getServerSession();
  const username = session?.user?.email || "anonymous@gmail.com";

  const chat = await getChat(chatId);
  if (chat && chat.userId !== username) {
    return new Response("Forbidden", { status: 403 });
  }

  const state = createMutableState({
    chatId,
    username,
    messages: chat?.messages ?? [],
  });

  const stream = createUIMessageStream<MavenUIMessage>({
    execute: async ({ writer }) => {
      try {
        await orchestrate({
          writer,
          state,
          payload,
          requestOption,
          abortSignal: req.signal,
        });
      } finally {
        await saveAIState(state.get());
      }
    },
    onError: (error) => {
      logger.error("Chat stream failed", { error });
      return "Maven couldn't finish this reply. Please try again.";
    },
  });

  return createUIMessageStreamResponse({ stream });
}
