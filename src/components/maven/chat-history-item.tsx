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

  const { text_input }: UserContentMessage = JSON.parse(
    firstUserMessage as string
  );

  return (
    <div className="">
      <Link href={`/chat/c/${chat.chatId}`}>
        <div className="w-full">
          <div className="h-full min-h-32 hover:bg-muted flex flex-col rounded-xl border px-3 py-4">
            <div className="h-10">
              <h3 className="text-sm text-white font-semibold line-clamp-2">
                {chat.title}
              </h3>
            </div>
            <div className="mt-4 flex items-center text-white/80 ">
              <p className="text-sm line-clamp-2">{text_input}</p>
            </div>
          </div>
        </div>
      </Link>
      <div className="ml-28 -mt-3">
        <div className="flex items-center text-white/70 bg-[#212121] py-1 px-2 rounded-3xl w-fit">
          <p className="text-xs">{formatDateWithTime(chat.created)}</p>
        </div>
      </div>
    </div>
  );
};
