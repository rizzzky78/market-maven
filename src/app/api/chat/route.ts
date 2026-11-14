import { createMutableState, orchestrate } from "@/app/server/orchestrator";
import { getChat } from "@/lib/agents/action/chat-service";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import {
  createModelRegistry,
  type ModelRegistry,
  type UsageRecord,
} from "@/lib/agents/models";
import { loadAgentSettings, saveUsage } from "@/lib/service/ai-settings/repository";
import { ChatRequestBody, MavenUIMessage } from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { getSession } from "@/lib/auth";

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

  const session = await getSession();
  const userId = session?.user?.id ?? null;
  const username = session?.user?.email || "anonymous@gmail.com";

  /**
   * Signed-in users run on their own AI settings (connections, per-role
   * models, preferences); decrypted keys live for this request only and are
   * never logged. Token usage is collected here and saved once the reply ends.
   */
  const usage: UsageRecord[] = [];
  let registry: ModelRegistry;
  try {
    if (userId) {
      const { settings, trackUsage } = await loadAgentSettings(userId);
      registry = createModelRegistry({
        settings,
        onUsage: trackUsage ? (record) => usage.push(record) : undefined,
      });
    } else {
      registry = createModelRegistry();
    }
  } catch (error) {
    logger.error("Loading AI settings failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response(
      error instanceof Error && error.message === "This base URL is not allowed"
        ? "One of your AI connections uses a base URL that is not allowed. Update it in AI settings."
        : "Your AI settings could not be loaded. Please try again.",
      { status: 400 }
    );
  }

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
          models: registry,
        });
      } finally {
        await saveAIState(state.get(), registry.forRole("default"));
        if (userId) await saveUsage(userId, chatId, usage);
      }
    },
    onError: (error) => {
      logger.error("Chat stream failed", { error });
      return "Maven couldn't finish this reply. Please try again.";
    },
  });

  return createUIMessageStreamResponse({ stream });
}
