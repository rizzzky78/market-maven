import { ChatProperties } from "@/lib/types/ai";
import { FC } from "react";
import { ChatHistoryItem } from "./chat-history-item";

interface ChatGridProps {
  chats: ChatProperties[];
}

export const ChatHistoryGrid: FC<ChatGridProps> = ({ chats }) => {
  const filtered = chats.filter((c) => c.title !== "");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {filtered.map((chat, index) => (
        <ChatHistoryItem key={chat.chatId || index} chat={chat} />
      ))}
    </div>
  );
};
