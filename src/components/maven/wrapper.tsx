import { cache, FC } from "react";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { getChats } from "@/lib/agents/action/chat-service";
import { Chat } from "@/components/maven/chat";
import { AIProvider } from "@/lib/utility/provider/ai-provider";

export const maxDuration = 60;

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

export async function Wrapper() {
  const id = uuidv4();
  const session = await getServerSession();

  const chats = await loadChats(session?.user?.email || "anonymous");

  return (
    <AIProvider initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} chats={chats} />
    </AIProvider>
  );
}
