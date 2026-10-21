"use client";

import { ComponentProps, FC, useEffect, useRef, useState } from "react";
import {
  Bot,
  CodeXml,
  
  History,
  Moon,
  PanelRightClose,
  Plus,
  Proportions,
  Sparkles,
  Sun,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarUserNavigation } from "./sidebar-navigation";
import { ModelSettingsDialog, useModelLabel } from "./model-settings-dialog";
import { Separator } from "../ui/separator";
import { ChatProperties, MessageProperty } from "@/lib/types/ai";
import Link from "next/link";
import { formatDateWithTime } from "@/lib/utils";
import { useTheme } from "next-themes";

import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useMavenStateController } from "../hooks/maven-state-controller";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Driver, driver, Config } from "driver.js";
import "driver.js/dist/driver.css";
import { tourSteps } from "@/lib/agents/constant/driver-js-app-guide";

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

  const [isTourActive, setIsTourActive] = useState(false);
  const driverRef = useRef<Driver | null>(null);

  const router = useRouter();
  const modelLabel = useModelLabel();

  const handleNewChat = () => {
    setIsGenerating(false);
    flush();
    // A new chat id remounts the chat provider with an empty conversation.
    router.push("/chat");
  };

  const filteredChats = userChats.filter(
    (chat) => chat.chatId !== "" && chat.title !== ""
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();
  const isActive = (chatId: string) => pathname === `/chat/c/${chatId}`;

  const startTour = () => {
    if (isTourActive) return;

    setIsTourActive(true);

    // Configure Driver.js options
    const driverOptions: Config = {
      animate: true,
      allowClose: true,
      doneBtnText: "Finish",
      nextBtnText: "Next >",
      prevBtnText: "< Previous",
      showProgress: true,
      progressText: "Step {{current}} of {{total}}",
      onDestroyed: () => {
        setIsTourActive(false);
      },
      popoverClass: "font-(family-name:--font-satoshi)",
    };

    // Initialize Driver.js
    driverRef.current = driver(driverOptions);
    driverRef.current.setSteps(tourSteps);
    driverRef.current.drive();
  };
  // Clean up Driver.js instance when component unmounts
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row font-(family-name:--font-satoshi)"
      {...props}
      data-testid="sidebar-nav"
    >
      <Sidebar
        collapsible="none"
        className="w-full! border-r md:w-[calc(var(--sidebar-width-icon)+1px)]!"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="rounded-full md:h-8 md:p-0"
              >
                <Link
                  href="https://maven-ai-webpage.vercel.app"
                  className="mt-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="ml-0.5 flex size-7 items-center justify-center">
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
                    <span className="truncate text-xs text-muted-foreground">
                      Electronics research assistant
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
                      children: "New chat",
                      hidden: false,
                    }}
                    className="mb-3 rounded-full px-2.5 md:px-2"
                    onClick={handleNewChat}
                    disabled={isGenerating}
                    data-testid="new-chat-button"
                  >
                    <Plus />
                    <span>New chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={{
                      children: "History",
                      hidden: false,
                    }}
                    className="px-2.5 md:px-2 rounded-full"
                    onClick={() =>
                      isMobile ? router.push("/history") : toggleSidebar()
                    }
                    data-testid="history-button"
                  >
                    <History />
                    <span>History</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <ModelSettingsDialog>
                    <SidebarMenuButton
                      tooltip={{
                        children: `AI provider: ${modelLabel}`,
                        hidden: false,
                      }}
                      className="px-2.5 md:px-2 rounded-full"
                      data-testid="model-settings-button"
                    >
                      <Bot />
                      <span>AI provider</span>
                    </SidebarMenuButton>
                  </ModelSettingsDialog>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="min-h-0 flex-1 md:hidden">
            <SidebarGroupLabel>Recent chats</SidebarGroupLabel>
            <SidebarGroupContent>
              {filteredChats.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  Your conversations will show up here.
                </p>
              ) : (
                <SidebarMenu>
                  {filteredChats.map((chat) => (
                    <SidebarMenuItem key={chat.chatId}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(chat.chatId)}
                      >
                        <Link
                          href={`/chat/c/${chat.chatId}`}
                          onClick={() => isMobile && toggleSidebar()}
                        >
                          <span className="truncate">{chat.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              <SidebarMenuItem className={isMobile ? "hidden" : "visible"}>
                <SidebarMenuButton
                  tooltip={{
                    children: "Toggle history panel",
                    hidden: false,
                  }}
                  className="px-2.5 md:px-2 rounded-full"
                  onClick={() => toggleSidebar()}
                  data-testid="toggle-sidebar"
                >
                  <PanelRightClose />
                  <span>Toggle history panel</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                {mounted && (
                  <div data-testid="theme-toggle-button">
                    <SidebarMenuButton
                      tooltip={{
                        children:
                          resolvedTheme === "dark" ? "Light mode" : "Dark mode",
                        hidden: false,
                      }}
                      className="px-2.5 md:px-2 rounded-full"
                      onClick={() =>
                        setTheme(resolvedTheme === "dark" ? "light" : "dark")
                      }
                    >
                      {resolvedTheme === "dark" ? <Sun /> : <Moon />}
                      <span>
                        {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                      </span>
                    </SidebarMenuButton>
                  </div>
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
                      children: "Rate this app",
                      hidden: false,
                    }}
                    className="px-2.5 md:px-2 rounded-full"
                    data-testid="rate-app"
                  >
                    <Sparkles />
                    <span>Rate this app</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link
                  href="https://rzkyprasetyo.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SidebarMenuButton
                    tooltip={{
                      children: "Developer portfolio",
                      hidden: false,
                    }}
                    className="px-2.5 md:px-2 rounded-full"
                    data-testid="dev-portfolio"
                  >
                    <CodeXml />
                    <span>Developer portfolio</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem className="hidden md:block">
                {/* This button should trigger interactive guide tour */}
                <SidebarMenuButton
                  tooltip={{
                    children: "Take the tour",
                    hidden: false,
                  }}
                  className="px-2.5 md:px-2 rounded-full"
                  onClick={startTour}
                  disabled={isTourActive}
                  data-testid="start-tour-button"
                >
                  <Proportions />
                  <span>Take the tour</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarUserNavigation />
        </SidebarFooter>
      </Sidebar>
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="h-14 flex-row items-center justify-between border-b px-4 py-0">
          <h2 className="text-sm font-medium">Chats</h2>
          {filteredChats.length > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {filteredChats.length}
            </span>
          )}
        </SidebarHeader>
        <SidebarContent className="scrollbar-thin">
          <SidebarGroup className="px-0 py-1.5">
            <SidebarGroupContent>
              {filteredChats.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-medium">No conversations yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your chats are saved here as you go.
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <Link
                    href={`/chat/c/${chat.chatId}`}
                    key={chat.chatId}
                    aria-current={isActive(chat.chatId) ? "page" : undefined}
                    className={cn(
                      "mx-2 my-0.5 flex flex-col gap-1 rounded-lg px-3 py-2.5 text-sm leading-tight transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
                      isActive(chat.chatId) &&
                        "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="flex min-w-0 items-baseline gap-2">
                      <p className="min-w-0 flex-1 truncate font-medium">
                        {chat.title}
                      </p>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        {formatDateWithTime(chat.created)}
                      </span>
                    </div>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
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
