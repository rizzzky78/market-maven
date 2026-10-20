"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/database/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ChatProperties, MessageContent } from "@/lib/types/ai";
import logger from "@/lib/utility/logger";

const chatWithMessages = {
  include: { messages: { orderBy: { position: "asc" } } },
} satisfies Prisma.ChatDefaultArgs;

type ChatWithMessages = Prisma.ChatGetPayload<typeof chatWithMessages>;

/**
 * Maps a `chats` row and its ordered messages to the app's `ChatProperties`.
 */
function toChatProperties(chat: ChatWithMessages): ChatProperties {
  return {
    chatId: chat.id,
    title: chat.title ?? "Untitled",
    created: chat.createdAt,
    userId: chat.userId,
    messages: chat.messages.map((m) => ({
      id: m.messageId,
      role: m.role,
      content: m.content as MessageContent,
    })),
  };
}

/**
 * Lists a user's chats that have at least one message, most recently
 * updated first.
 */
export async function getChats(userId: string | null = "anonymous") {
  if (!userId) {
    return [];
  }

  try {
    // ponytail: loads every message for the sidebar teaser; select only the first user message if histories grow large.
    const chats = await prisma.chat.findMany({
      where: { userId, messages: { some: {} } },
      orderBy: { updatedAt: "desc" },
      ...chatWithMessages,
    });

    return chats.map(toChatProperties);
  } catch (error) {
    console.error(error);
    logger.error("Error getting the user chat in <getChats()>");

    return [];
  }
}

/**
 * Loads a chat with its messages, or `null` when it does not exist.
 */
export async function getChat(id: string) {
  const chat = await prisma.chat.findUnique({
    where: { id },
    ...chatWithMessages,
  });

  return chat ? toChatProperties(chat) : null;
}

/**
 * Creates the chat row if it does not exist yet. The orchestrator calls this
 * before any tool runs, because tool, object and markdown records reference
 * their chat.
 */
export async function ensureChat(id: string, userId: string) {
  await prisma.chat.upsert({
    where: { id },
    create: { id, userId },
    update: {},
  });
}

/**
 * Deletes all chats of a user; their messages and tool, object and markdown
 * records are removed by cascade.
 */
export async function clearChats(
  userId: string = "anonymous"
): Promise<{ error?: string }> {
  const { count } = await prisma.chat.deleteMany({ where: { userId } });

  if (count === 0) {
    return { error: "No chats to clear" };
  }

  revalidatePath("/chat");
  redirect("/chat");
}

/**
 * Persists a chat and replaces its messages with the given AI state messages.
 */
export async function saveChat(userId: string, chat: ChatProperties) {
  if (!userId) {
    userId = "anonymous";
  }
  try {
    // ponytail: rewrites the whole history per save (as the Redis hash did); append only new positions if chats get long.
    await prisma.$transaction([
      prisma.chat.upsert({
        where: { id: chat.chatId },
        create: {
          id: chat.chatId,
          userId,
          title: chat.title,
          createdAt: chat.created,
        },
        update: { title: chat.title },
      }),
      prisma.chatMessage.deleteMany({ where: { chatId: chat.chatId } }),
      prisma.chatMessage.createMany({
        data: chat.messages.map((message, position) => ({
          chatId: chat.chatId,
          position,
          messageId: message.id,
          role: message.role,
          content: message.content as Prisma.InputJsonValue,
        })),
      }),
    ]);

    logger.info("User chat saved successfully!");
  } catch (error) {
    console.error(error);
    logger.error("Error when save the chat properties in <saveChat()>");
  }
}

/**
 * Reads a chat's title and creation date without its messages; `title` is
 * `null` until it has been generated.
 */
export async function getChatMeta(id: string) {
  return prisma.chat.findUnique({
    where: { id },
    select: { title: true, createdAt: true },
  });
}
