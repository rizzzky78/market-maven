"use client";

import { ComponentProps, FC, useEffect, useState } from "react";
import {
  CodeXml,
  History,
  Moon,
  PanelRightClose,
  Plus,
  ScanQrCode,
  Sparkles,
  Sun,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarUserNavigation } from "./sidebar-navigation";
import { Separator } from "../ui/separator";
import { ChatProperties, MessageProperty } from "@/lib/types/ai";
import Link from "next/link";
import { formatDateWithTime } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

// Helper function to create teaser message
const createTeaserMessage = (messages: MessageProperty[]) => {
  if (messages.length === 0) return "No messages";
  const firstMessage = messages[0];
  try {
    const content = JSON.parse(firstMessage.content as string);
    return content.text_input || "No text input";
  } catch (error) {
    return "Unable to parse message content";
  }
};

interface MavenSidebarProps extends ComponentProps<typeof Sidebar> {
  userChats: ChatProperties[];
}

export const MavenSidebar: FC<MavenSidebarProps> = ({
  userChats,
  ...props
}) => {
  const { setOpen, isMobile, toggleSidebar } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="rounded-full md:h-8 md:p-0"
              >
                <Link href="/chat">
                  <div className="flex aspect-square size-8 items-center justify-center">
                    <ScanQrCode className="size-4 text-purple-400" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Market Maven</span>
                    <span className="truncate text-xs">
                      AI & Data Driven purchase decision
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={{
                      children: "New Chat",
                      hidden: false,
                    }}
                    className="px-2.5 md:px-2 rounded-full mb-3"
                  >
                    <Plus />
                    <span>New Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={{
                      children: "History",
                      hidden: false,
                    }}
                    className="px-2.5 md:px-2 rounded-full"
                  >
                    <History />
                    <span>History</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="px-0 md:hidden">
            <SidebarGroupContent className="px-2">
              <ScrollArea className="h-[280px] pr-3">
                {userChats.length === 0 ? (
                  <div className="flex flex-col rounded-none items-start gap-2 whitespace-nowrap px-4 py-2 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <div className="w-[230px] flex items-center justify-center">
                      <p className="truncate">No chat available</p>
                    </div>
                  </div>
                ) : (
                  userChats.map((chat) => (
                    <Link
                      href={`/chat/${chat.chatId}`}
                      key={chat.chatId}
                      className="flex flex-col rounded-none items-start gap-2 whitespace-nowrap px-4 py-2 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <div className="w-[230px]">
                        <p className="truncate">{chat.title}</p>
                      </div>
                    </Link>
                  ))
                )}
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              <SidebarMenuItem className={isMobile ? "hidden" : "visible"}>
                <SidebarMenuButton
                  tooltip={{
                    children: "Toggle Sidebar",
                    hidden: false,
                  }}
                  className="px-2.5 md:px-2 rounded-full"
                  onClick={() => toggleSidebar()}
                >
                  <PanelRightClose />
                  <span>Toggle Sidebar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                {mounted && (
                  <motion.div
                    initial={false}
                    animate={
                      isMobile
                        ? undefined
                        : { rotate: resolvedTheme === "dark" ? 360 : 0 }
                    }
                    transition={{ duration: 0.5 }}
                  >
                    <SidebarMenuButton
                      tooltip={{
                        children: "Toggle Theme",
                        hidden: false,
                      }}
                      className="px-2.5 md:px-2 rounded-full"
                      onClick={() =>
                        setTheme(resolvedTheme === "dark" ? "light" : "dark")
                      }
                    >
                      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span>Toggle Theme</span>
                    </SidebarMenuButton>
                  </motion.div>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          <Separator />
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: "Rate this App",
                    hidden: false,
                  }}
                  className="px-2.5 md:px-2 rounded-full"
                >
                  <Sparkles />
                  <span>Rate this App</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: "View Dev Portfolio",
                    hidden: false,
                  }}
                  className="px-2.5 md:px-2 rounded-full"
                >
                  <CodeXml />
                  <span>View Dev Portfolio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarUserNavigation />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              Market Maven
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="scrollbar-thin">
          <SidebarGroup className="px-0 ">
            <SidebarGroupContent className="">
              {userChats.length === 0 ? (
                <div className="h-full w-full">
                  <div className="flex items-center justify-center">
                    <p>No chat available</p>
                  </div>
                </div>
              ) : (
                userChats.map((chat) => (
                  <Link
                    href={`/chat/c/${chat.chatId}`}
                    key={chat.chatId}
                    className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <div className="flex w-full max-w-sm items-center gap-2">
                      <span className="ml-auto text-xs">
                        {formatDateWithTime(chat.created)}
                      </span>
                    </div>
                    <div className="w-[256px]">
                      <p className="font-medium truncate">{chat.title}</p>
                    </div>
                    <span className="line-clamp-2 w-[220px] whitespace-break-spaces text-xs">
                      {createTeaserMessage(chat.messages as MessageProperty[])}
                    </span>
                  </Link>
                ))
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
};
