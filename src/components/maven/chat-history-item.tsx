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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{chat.title}</CardTitle>
        <p className="text-xs text-gray-500">
          {chat.created.toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-xs text-gray-600">{briefMessage}</p>
      </CardContent>
    </Card>
  );
};
