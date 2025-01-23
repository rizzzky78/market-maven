import { ChatProperties } from "@/lib/types/ai";
import { FC } from "react";
import { ChatHistoryItem } from "./chat-history-item";

interface ChatGridProps {
  chats: ChatProperties[];
}

export const ChatHistoryGrid: FC<ChatGridProps> = ({ chats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {chats.map((chat) => (
        <ChatHistoryItem key={chat.chatId} chat={chat} />
      ))}
    </div>
  );
};
