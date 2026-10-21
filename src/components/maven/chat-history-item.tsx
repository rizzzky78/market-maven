import type { ChatProperties, UserContentMessage } from "@/lib/types/ai";
import { formatDateWithTime } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

interface ChatProps {
  chat: ChatProperties;
}

/** First thing the user typed in the chat, if it can be read. */
const firstPrompt = (chat: ChatProperties) => {
  const content = chat.messages.find((m) => m.role === "user")?.content;
  try {
    return (JSON.parse(content as string) as UserContentMessage).text_input;
  } catch {
    return undefined;
  }
};

export const ChatHistoryItem: FC<ChatProps> = ({ chat }) => {
  const prompt = firstPrompt(chat);

  return (
    <li>
      <Link
        href={`/chat/c/${chat.chatId}`}
        className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <h2 className="min-w-0 flex-1 truncate text-sm font-medium">
              {chat.title}
            </h2>
            <time
              dateTime={new Date(chat.created).toISOString()}
              className="shrink-0 text-xs tabular-nums text-muted-foreground"
            >
              {formatDateWithTime(chat.created)}
            </time>
          </div>
          {prompt && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {prompt}
            </p>
          )}
        </div>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden
        />
      </Link>
    </li>
  );
};
