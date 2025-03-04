"use client";

import { ComponentProps, FC, useEffect, useState } from "react";
import {
  CodeXml,
  Hexagon,
  History,
  MessageCircleQuestion,
  Moon,
  PanelRightClose,
  Plus,
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
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useUIState, useAIState } from "ai/rsc";
import { useMavenStateController } from "../hooks/maven-state-controller";
import { useRouter } from "next/navigation";

// Helper function to create teaser message
const createTeaserMessage = (messages: MessageProperty[]) => {
  if (messages.length === 0) return "No messages";
  const firstMessage = messages[0];
  try {
    const content = JSON.parse(firstMessage.content as string);
    return content.text_input || "No text input";
  } catch {
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
  const { isMobile, toggleSidebar } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const { isGenerating, setIsGenerating } = useAppState();
  const { flush } = useMavenStateController();
  const [, setUIState] = useUIState<typeof AI>();
  const [, setAIState] = useAIState<typeof AI>();

  const router = useRouter();

  const handleNewChat = () => {
    setIsGenerating(false);
    flush();
    setUIState([]);
    setAIState((prevAIState) => ({ ...prevAIState, messages: [], chatId: "" }));
    router.push("/chat");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
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
                <Link href="/">
                  <div className="flex aspect-square size-7 items-center justify-center">
                    <svg
                      className="coolshapes polygon-7 "
                      height="100"
                      width="100"
                      fill="none"
                      viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#cs_clip_1_polygon-7)">
                        <mask
                          height="200"
                          id="cs_mask_1_polygon-7"
                          style={{ maskType: "alpha" }}
                          width="182"
                          x="9"
                          y="0"
                          maskUnits="userSpaceOnUse"
                        >
                          <path
                            d="M86.449 3.601a27.296 27.296 0 0127.102 0l63.805 36.514C185.796 44.945 191 53.9 191 63.594v72.812c0 9.694-5.204 18.649-13.644 23.479l-63.805 36.514a27.3 27.3 0 01-27.102 0l-63.805-36.514C14.204 155.055 9 146.1 9 136.406V63.594c0-9.694 5.204-18.649 13.644-23.48L86.45 3.602z"
                            fill="#fff"
                          />
                        </mask>
                        <g mask="url(#cs_mask_1_polygon-7)">
                          <path d="M200 0H0v200h200V0z" fill="#fff" />
                          <path d="M200 0H0v200h200V0z" fill="#0E6FFF" />
                          <g filter="url(#filter0_f_748_4355)">
                            <path d="M209 126H-9v108h218V126z" fill="#8F5BFF" />
                            <ellipse
                              cx="87"
                              cy="57.5"
                              fill="#00F0FF"
                              rx="59"
                              ry="34.5"
                            />
                          </g>
                        </g>
                      </g>
                      <g
                        style={{ mixBlendMode: "overlay" }}
                        mask="url(#cs_mask_1_polygon-7)"
                      >
                        <path
                          d="M200 0H0v200h200V0z"
                          fill="gray"
                          stroke="transparent"
                          filter="url(#cs_noise_1_polygon-7)"
                        />
                      </g>
                      <defs>
                        <filter
                          height="331"
                          id="filter0_f_748_4355"
                          width="338"
                          x="-69"
                          y="-37"
                          filterUnits="userSpaceOnUse"
                          colorInterpolationFilters="sRGB"
                        >
                          <feFlood
                            result="BackgroundImageFix"
                            floodOpacity="0"
                          />
                          <feBlend
                            result="shape"
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur_748_4355"
                            stdDeviation="30"
                          />
                        </filter>
                        <clipPath id="cs_clip_1_polygon-7">
                          <path d="M0 0H200V200H0z" fill="#fff" />
                        </clipPath>
                      </defs>
                      <defs>
                        <filter
                          height="100%"
                          id="cs_noise_1_polygon-7"
                          width="100%"
                          x="0%"
                          y="0%"
                          filterUnits="objectBoundingBox"
                        >
                          <feBlend
                            result="out3"
                            in="SourceGraphic"
                            in2="out2"
                          />
                        </filter>
                      </defs>
                    </svg>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Maven</span>
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
                    onClick={handleNewChat}
                    disabled={isGenerating}
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
                    onClick={() => toggleSidebar()}
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
                <Link
                  href={"/rate-app"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link
                  href={"/dev-portfolio"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarUserNavigation />
        </SidebarFooter>
      </Sidebar>
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b px-4 py-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center text-base font-medium text-foreground">
              <Hexagon className="size-5 shrink-0 mr-2 text-purple-500" />
              <p>Maven</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="scrollbar-thin">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
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
                    className="flex flex-col items-start gap-1 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <div className="flex w-full max-w-sm items-center gap-2">
                      <span className="ml-auto text-[0.65rem]">
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
