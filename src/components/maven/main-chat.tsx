"use client";

import { FC, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useMavenChat } from "@/lib/utility/provider/chat-provider";
import { mapUIState } from "@/components/custom/ui-mapper";
import { cn } from "@/lib/utils";
import { AppHeader } from "./app-header";
import { useShellChats } from "./app-shell";
import { ChatMessages } from "./chat-messages";
import { ChatPanel } from "./chat-panel";
import { ShareButton } from "./share-button";

type ChatProps = {
  id?: string;
  query?: string;
};

export const Chat: FC<ChatProps> = ({ id, query }) => {
  const path = usePathname();
  const { chats } = useShellChats();
  const { history, messages } = useMavenChat();
  const historyUI = useMemo(() => mapUIState(history), [history]);
  const messageCount = historyUI.length + messages.length;

  useEffect(() => {
    if (!path.includes(`chat/c/`) && messageCount === 1) {
      window.history.replaceState({}, "", `/chat/c/${id}`);
    }
  }, [id, path, query, messageCount]);

  /** Keeps the newest message in view as the conversation grows. */
  useEffect(() => {
    if (messageCount > 0) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [messageCount]);

  const selectedChat = chats.find((c) => c.chatId === id);
  const isEmpty = messageCount === 0;

  return (
    <>
      <AppHeader
        title={selectedChat?.title ?? "New chat"}
        data-testid="chat-header"
        actions={
          selectedChat && (
            <ShareButton
              title="Chat"
              subtitle={selectedChat.title}
              callId={selectedChat.chatId}
              type={"public-chat"}
            />
          )
        }
      />
      <div
        className={cn(
          "flex flex-1 flex-col px-3 md:px-6",
          isEmpty && "justify-center"
        )}
      >
        {!isEmpty && (
          <div
            className="mx-auto flex w-full max-w-3xl flex-1 flex-col pt-6 pb-8 md:pt-10 lg:max-w-7xl"
            data-testid="chat-messages"
          >
            <ChatMessages history={historyUI} messages={messages} />
          </div>
        )}
        <div
          className={cn(
            "z-30 mx-auto w-full max-w-3xl lg:max-w-7xl",
            !isEmpty &&
              "sticky bottom-0 bg-linear-to-t from-background from-70% to-transparent pt-6"
          )}
        >
          <ChatPanel isEmpty={isEmpty} />
        </div>
      </div>
    </>
  );
};
