import { ChatProperties } from "@/lib/types/ai";
import Link from "next/link";
import { FC } from "react";
import { useSetChatTitle } from "../hooks/use-set-chat-title";
import { Button } from "../ui/button";

interface HistoryItemProps {
  chat: ChatProperties;
  disabled?: boolean;
}

export const HistoryItem: FC<HistoryItemProps> = ({ chat, disabled }) => {
  const { setChatTitle } = useSetChatTitle();
  return (
    <Button
      disabled={disabled}
      variant={"ghost"}
      className="text-start font-normal mx-0 px-0"
    >
      <Link
        href={`/chat/c/${chat.chatId}`}
        className="flex whitespace-nowrap px-2 py-1 text-sm leading-relaxed last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-sm"
        onClick={() => setChatTitle(chat.title)}
      >
        <span className="line-clamp-2 whitespace-break-spaces text-xs">
          {chat.title}
        </span>
      </Link>
    </Button>
  );
};
