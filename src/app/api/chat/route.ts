import { createMutableState, orchestrate } from "@/app/server/orchestrator";
import { getChat } from "@/lib/agents/action/chat-service";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { createModels } from "@/lib/agents/models";
import { modelConfigSchema } from "@/lib/agents/providers";
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
  const { chatId, payload, requestOption, model } =
    (await req.json()) as ChatRequestBody;

  if (typeof chatId !== "string" || !chatId || !payload) {
    return new Response("Invalid chat request", { status: 400 });
  }

  // The user's own provider settings, used for this request only: the API
  // key is never stored or logged.
  const modelConfig = model ? modelConfigSchema.safeParse(model) : undefined;
  if (modelConfig && !modelConfig.success) {
    return new Response("Invalid AI provider settings", { status: 400 });
  }

  let models;
  try {
    models = createModels(modelConfig?.data);
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Invalid AI provider settings",
      { status: 400 }
    );
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
          models,
        });
      } finally {
        await saveAIState(state.get(), models);
      }
    },
    onError: (error) => {
      logger.error("Chat stream failed", { error });
      return "Maven couldn't finish this reply. Please try again.";
    },
  });

  return createUIMessageStreamResponse({ stream });
}
