import { ChatProperties } from "@/lib/types/ai";
import Link from "next/link";
import { FC } from "react";
import { useSetChatTitle } from "../hooks/use-set-chat-title";

interface HistoryItemProps {
  chat: ChatProperties;
}

export const HistoryItem: FC<HistoryItemProps> = ({ chat }) => {
  const { setChatTitle } = useSetChatTitle();
  return (
    <Link
      href={`/chat/c/${chat.chatId}`}
      className="flex whitespace-nowrap px-2 py-1 text-sm leading-relaxed last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-sm"
      onClick={() => setChatTitle(chat.title)}
    >
      <span className="line-clamp-2 whitespace-break-spaces text-xs">
        {chat.title}
      </span>
    </Link>
  );
};
