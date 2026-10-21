import { ChatProperties } from "@/lib/types/ai";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FC } from "react";
import { ChatHistoryItem } from "./chat-history-item";

interface ChatHistoryProps {
  chats: ChatProperties[];
}

export const ChatHistoryGrid: FC<ChatHistoryProps> = ({ chats }) => {
  const filtered = chats.filter((c) => c.title !== "" && c.chatId !== "");

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-12 text-center">
        <p className="text-sm font-medium">No conversations yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask Maven about a product and the chat is saved here.
        </p>
        <Button asChild size="sm" className="mt-4 rounded-full">
          <Link href="/chat">Start a chat</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {filtered.map((chat) => (
        <ChatHistoryItem key={chat.chatId} chat={chat} />
      ))}
    </ul>
  );
};
