import { ChatHistoryGrid } from "@/components/maven/chat-history-grid";
import { getChats } from "@/lib/agents/action/chat-service";
import { History } from "lucide-react";
import { getServerSession } from "next-auth";
import { cache } from "react";

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

export default async function ChatHistoryPage() {
  const session = await getServerSession();
  const chats = await loadChats(session?.user?.email || "anonymous@gmail.com");
  return (
    <div className="mx-auto py-8 max-w-3xl">
      <div className="py-5 px-6 mb-4 rounded-[2rem] bg-[#1A1A1D]">
        <div className="flex items-center">
          <History className="size-8 mr-4 shrink-0 text-purple-400" />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-white/90">User Chat History</h1>
            <p className="text-xs text-white/70">*click to go to chat</p>
          </div>
        </div>
      </div>
      <ChatHistoryGrid chats={chats} />
    </div>
  );
}
