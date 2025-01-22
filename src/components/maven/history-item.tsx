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
      variant={"ghost"}
      className="font-normal px-0 text-start last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-sm"
      disabled={disabled}
    >
      <Link
        href={`/chat/c/${chat.chatId}`}
        className="flex whitespace-nowrap px-2 py-1 text-sm leading-relaxed"
        onClick={() => setChatTitle(chat.title)}
      >
        <span className="line-clamp-2 whitespace-break-spaces text-xs">
          {chat.title}
        </span>
      </Link>
    </Button>
  );
};
