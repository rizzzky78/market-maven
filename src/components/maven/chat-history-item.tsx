import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChatProperties } from "@/lib/types/ai";
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

  return (
    <div className="h-full flex flex-col rounded-xl border p-3">
      <div className="-mb-2">
        <h3 className="text-sm text-white font-medium line-clamp-1">
          {chat.title}
        </h3>
        <p className="text-xs text-white/70">
          {chat.created as unknown as string}
        </p>
      </div>
      <div className="flex-grow">
        <p className="text-xs text-white/80 line-clamp-2">{briefMessage}</p>
      </div>
    </div>
  );
};
