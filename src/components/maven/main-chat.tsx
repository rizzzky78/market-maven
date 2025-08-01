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
import { useUIState } from "ai/rsc";
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

  const selectedChat = chats.find((c) => c.chatId === (id as string));

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <MavenSidebar userChats={chats} />
      <SidebarInset>
        <header
          className="font-[family-name:var(--font-satoshi)] sticky top-0 flex shrink-0 items-center gap-2 bg-background/90 px-4 py-2 z-20"
          data-testid="chat-header"
        >
          <div className="flex justify-between w-full">
            <div className="flex items-center">
              <SidebarTrigger className="md:hidden" />
              <Separator
                orientation="vertical"
                className="mx-2 h-4 md:hidden"
              />
              <div>
                {selectedChat && (
                  <p className="font-semibold line-clamp-1">
                    {selectedChat.title}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedChat && (
                <ShareButton
                  title="Chat"
                  subtitle={selectedChat.title}
                  callId={selectedChat.chatId}
                  type={"public-chat"}
                />
              )}
            </div>
          </div>
        </header>
        <div className="flex flex-col px-4 overflow-hidden">
          <div
            className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4 justify-center"
            data-testid="chat-messages"
          >
            <ChatMessages ui={uiMessage} />
          </div>
          <div className="w-full flex justify-center bottom-0 z-[30] overflow-hidden">
            <div className="w-full">
              <ChatPanel uiState={uiMessage} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
