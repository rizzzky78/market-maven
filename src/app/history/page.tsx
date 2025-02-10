import { ChatHistoryGrid } from "@/components/maven/chat-history-grid";
import { ClearChats } from "@/components/maven/clear-chats";
import { getChats } from "@/lib/agents/action/chat-service";
import { ChatProperties } from "@/lib/types/ai";
import { getServerSession } from "next-auth";
import { cache } from "react";

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

export default async function ChatHistoryPage() {
  // const chats = await getChatHistory();
  const session = await getServerSession();
  const chats = await loadChats(session?.user?.email || "anonymous");
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-md font-semibold mb-6 mx-4">Chat History</h1>
      <ChatHistoryGrid chats={chats} />
    </div>
  );
}
