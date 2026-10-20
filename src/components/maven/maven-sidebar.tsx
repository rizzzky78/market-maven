"use client";

import { ComponentProps, FC, useEffect, useRef, useState } from "react";
import {
  CodeXml,
  Hexagon,
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
import { Separator } from "../ui/separator";
import { ChatProperties, MessageProperty } from "@/lib/types/ai";
import Link from "next/link";
import { formatDateWithTime } from "@/lib/utils";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useUIState, useAIState } from "@ai-sdk/rsc";
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
  const [, setUIState] = useUIState<typeof AI>();
  const [, setAIState] = useAIState<typeof AI>();

  const [isTourActive, setIsTourActive] = useState(false);
  const driverRef = useRef<Driver | null>(null);

  const router = useRouter();

  const handleNewChat = () => {
    setIsGenerating(false);
    flush();
    setUIState([]);
    setAIState((prevAIState) => ({ ...prevAIState, messages: [], chatId: "" }));
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
                    <span className="truncate font-semibold uppercase font-(family-name:--font-array) tracking-wider">
                      Maven
                    </span>
                    <span className="truncate text-sm font-(family-name:--font-khand)">
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
                    data-testid="new-chat-button"
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
                    onClick={() =>
                      isMobile ? router.push("/history") : toggleSidebar()
                    }
                    data-testid="history-button"
                  >
                    <History />
                    <span>History</span>
                  </SidebarMenuButton>
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
                    children: "Toggle Sidebar",
                    hidden: false,
                  }}
                  className="px-2.5 md:px-2 rounded-full"
                  onClick={() => toggleSidebar()}
                  data-testid="toggle-sidebar"
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
                    data-testid="theme-toggle-button"
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
                    data-testid="rate-app"
                  >
                    <Sparkles />
                    <span>Rate this App</span>
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
                      children: "View Dev Portfolio",
                      hidden: false,
                    }}
                    className="px-2.5 md:px-2 rounded-full"
                    data-testid="dev-portfolio"
                  >
                    <CodeXml />
                    <span>View Dev Portfolio</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem className="hidden md:block">
                {/* This button should trigger interactive guide tour */}
                <SidebarMenuButton
                  tooltip={{
                    children: "Start Interactive Tour",
                    hidden: false,
                  }}
                  className="px-2.5 md:px-2 rounded-full"
                  onClick={startTour}
                  disabled={isTourActive}
                  data-testid="start-tour-button"
                >
                  <Proportions />
                  <span>Start Tour</span>
                </SidebarMenuButton>
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
              <Hexagon className="size-5 shrink-0 mr-2 text-brand" />
              <p className="font-(family-name:--font-array) font-semibold tracking-widest uppercase">
                Maven
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="scrollbar-thin">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              {filteredChats.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-medium">No conversations yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Start a chat and it will be saved here.
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <Link
                    href={`/chat/c/${chat.chatId}`}
                    key={chat.chatId}
                    aria-current={isActive(chat.chatId) ? "page" : undefined}
                    className={cn(
                      "flex flex-col gap-1 border-b px-4 py-3 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive(chat.chatId) &&
                        "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_hsl(var(--brand))]"
                    )}
                  >
                    <div className="flex min-w-0 items-baseline gap-2">
                      <p className="min-w-0 flex-1 truncate font-medium">
                        {chat.title}
                      </p>
                      <span className="shrink-0 text-[0.65rem] text-muted-foreground">
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
