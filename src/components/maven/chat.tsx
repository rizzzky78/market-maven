"use client";

import { FC, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUIState } from "ai/rsc";
import { ChatMessages } from "./chat-messages";
import { ChatPanel } from "./chat-panel";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Session } from "next-auth";
import { ChatProperties } from "@/lib/types/ai";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { AI } from "@/app/action";

type ChatProps = {
  id?: string;
  query?: string;
  session: Session | null;
  chats: ChatProperties[];
};

export const Chat: FC<ChatProps> = ({ id, query, session, chats }) => {
  const path = usePathname();
  const [uiMessage] = useUIState<typeof AI>();
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!path.includes(`chat/c/`) && uiMessage.length === 1) {
      window.history.replaceState({}, "", `/chat/c/${id}`);
    }
  }, [id, path, query, uiMessage]);

  const selectedChat = chats.find((chat) => chat.chatId === id);

  return (
    <SidebarProvider>
      <AppSidebar session={session} chats={chats} />
      <SidebarInset className="-ml-1">
        <header className="rounded-t-xl px-3 justify-between sticky z-20 top-0 flex shrink-0 items-center bg-background/80 backdrop-blur-sm py-1">
          <div className="flex items-center">
            <SidebarTrigger className="" />
            <Separator orientation="vertical" className="mx-2 h-8" />
            <div className="ml-1">
              <p className="text-xs">
                {selectedChat?.title ?? "Welcome User!"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {mounted && (
              <motion.div
                initial={false}
                animate={{ rotate: resolvedTheme === "dark" ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  className="relative rounded-full"
                >
                  <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </motion.div>
            )}
          </div>
        </header>
        <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
          <ScrollArea className="w-full">
            <ChatMessages ui={uiMessage} />
          </ScrollArea>
        </div>
        <div className="sticky bottom-0">
          <ChatPanel uiState={uiMessage} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
