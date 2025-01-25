import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChatProperties, UserContentMessage } from "@/lib/types/ai";
import { formatDateWithTime } from "@/lib/utils";
import Link from "next/link";
import { FC } from "react";

interface ChatProps {
  chat: ChatProperties;
}

export const ChatHistoryItem: FC<ChatProps> = ({ chat }) => {
  const firstUserMessage = chat.messages.find(
    (m) => m.role === "user"
  )?.content;
  const briefMessage = firstUserMessage
    ? `${firstUserMessage.slice(0, 50)}${
        firstUserMessage.length > 50 ? "..." : ""
      }`
    : "No messages";

  const { text_input }: UserContentMessage = JSON.parse(
    firstUserMessage as string
  );

  return (
    <Link href={`/chat/c/${chat.chatId}`}>
      <div className="w-full">
        <div className="h-full min-h-32 hover:bg-muted flex flex-col rounded-xl border px-3 py-4">
          <div className="h-14">
            <h3 className="text-sm text-white font-medium line-clamp-2">
              {chat.title}
            </h3>
            <p className="text-xs text-white/70">
              {formatDateWithTime(chat.created)}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-xs text-white/80 line-clamp-2">
              {text_input ?? briefMessage}
            </p>
            {/* <pre className="text-xs overflow-x-auto">
              {JSON.stringify(firstUserMessage, null, 2)}
            </pre> */}
          </div>
        </div>
      </div>
    </Link>
  );
};
