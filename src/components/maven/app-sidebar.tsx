"use client";

import { BaggageClaim, CirclePlus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChatProperties } from "@/lib/types/ai";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useSmartTextarea } from "../hooks/use-smart-textare";
import { Button } from "../ui/button";
import { ComponentProps, FC } from "react";
import { HistoryItem } from "./history-item";
import { NavUser } from "./sidebar-nav-user";
import { useSession } from "next-auth/react";
import { useAIState, useUIState } from "ai/rsc";
import { AI } from "@/app/action";

interface AppProps extends ComponentProps<typeof Sidebar> {
  chats: ChatProperties[];
}

export const AppSidebar: FC<AppProps> = ({ chats, ...props }) => {
  const { isGenerating, setIsGenerating } = useAppState();
  const { flush } = useSmartTextarea();
  const [, setUIState] = useUIState<typeof AI>();
  const { data: session } = useSession();
  const [aiState, setAIState] = useAIState<typeof AI>();

  const router = useRouter();

  const handleNewChat = () => {
    setIsGenerating(false);
    flush();
    setUIState([]);
    setAIState({
      chatId: "",
      messages: [],
      username: session?.user?.name || "anonymous@gmail.com",
    });
    router.push("/chat");
  };

  const userChat: ChatProperties[] =
    chats.length === 0 ? [] : chats.filter((c) => c.title !== "");

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center pb-1 justify-between">
            <div className="flex items-center space-x-2">
              <BaggageClaim className="text-purple-400" />
              <span className="font-bold">MarketMaven</span>
            </div>
            <motion.div whileHover={{ rotate: 180, scale: 1.3 }}>
              <Button
                size={"icon"}
                variant={"ghost"}
                className="rounded-full"
                onClick={handleNewChat}
                disabled={isGenerating}
              >
                <CirclePlus />
                <span className="sr-only">New Chat</span>
              </Button>
            </motion.div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="pr-2 scrollbar-thin">
        {userChat.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs">
              No chat available,
              <br />
              let&apos;s start with a new one!
            </p>
          </div>
        ) : (
          userChat.map((chat, idx) => (
            <HistoryItem key={idx} chat={chat} disabled={isGenerating} />
          ))
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};
