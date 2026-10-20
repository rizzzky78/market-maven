"use client";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MavenSidebar } from "./maven-sidebar";
import { ChatProperties } from "@/lib/types/ai";
import { ShareButton } from "./share-button";
import { FC, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AI } from "@/app/action";
import { useUIState } from "@ai-sdk/rsc";
import { cn } from "@/lib/utils";
import { ChatMessages } from "./chat-messages";
import { ChatPanel } from "./chat-panel";

type ChatProps = {
  id?: string;
  query?: string;
  chats: ChatProperties[];
};

export const Chat: FC<ChatProps> = ({ id, query, chats }) => {
  const path = usePathname();
  const [uiMessage] = useUIState<typeof AI>();

  useEffect(() => {
    if (!path.includes(`chat/c/`) && uiMessage.length === 1) {
      window.history.replaceState({}, "", `/chat/c/${id}`);
    }
  }, [id, path, query, uiMessage]);

  // Keep the newest message in view as the conversation grows
  useEffect(() => {
    if (uiMessage.length > 0) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [uiMessage.length]);

  const selectedChat = chats.find((c) => c.chatId === (id as string));
  const isEmpty = uiMessage.length === 0;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "clamp(17rem, 28vw, 350px)",
        } as React.CSSProperties
      }
    >
      <MavenSidebar userChats={chats} />
      <SidebarInset className="font-(family-name:--font-satoshi)">
        <header
          className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-sm md:px-4"
          data-testid="chat-header"
        >
          <SidebarTrigger className="md:hidden" aria-label="Open menu" />
          <Separator orientation="vertical" className="h-4 md:hidden" />
          <h1 className="min-w-0 flex-1 truncate text-sm font-medium">
            {selectedChat?.title ?? "New chat"}
          </h1>
          {selectedChat && (
            <ShareButton
              title="Chat"
              subtitle={selectedChat.title}
              callId={selectedChat.chatId}
              type={"public-chat"}
            />
          )}
        </header>
        <div
          className={cn(
            "flex flex-1 flex-col px-3 md:px-6",
            isEmpty && "justify-center"
          )}
        >
          {!isEmpty && (
            <div
              className="mx-auto flex w-full max-w-3xl flex-1 flex-col pt-6 pb-8 md:pt-10"
              data-testid="chat-messages"
            >
              <ChatMessages ui={uiMessage} />
            </div>
          )}
          <div
            className={cn(
              "z-30 mx-auto w-full max-w-3xl",
              !isEmpty &&
                "sticky bottom-0 bg-linear-to-t from-background from-70% to-transparent pt-6"
            )}
          >
            <ChatPanel uiState={uiMessage} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
