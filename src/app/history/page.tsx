import { ChatHistoryGrid } from "@/components/maven/chat-history-grid";
import { Button } from "@/components/ui/button";
import { getChats } from "@/lib/agents/action/chat-service";
import { ArrowLeft, Plus } from "lucide-react";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { cache } from "react";

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

export default async function ChatHistoryPage() {
  const session = await getSession();
  const chats = await loadChats(session?.user?.email || "anonymous@gmail.com");
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 font-(family-name:--font-satoshi) md:py-12">
      <Link
        href="/chat"
        className="-ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to chat
      </Link>
      <header className="mt-4 mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          {chats.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {chats.length === 1
                ? "1 conversation"
                : `${chats.length} conversations`}
            </p>
          )}
        </div>
        {chats.length > 0 && (
          <Button asChild size="sm" className="rounded-full">
            <Link href="/chat">
              <Plus className="size-4" aria-hidden />
              New chat
            </Link>
          </Button>
        )}
      </header>
      <ChatHistoryGrid chats={chats} />
    </main>
  );
}
