"use client";

import { ComponentProps, FC, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Driver, driver, Config } from "driver.js";
import "driver.js/dist/driver.css";
import {
  Bot,
  CodeXml,
  History,
  Moon,
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
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { tourSteps } from "@/lib/agents/constant/driver-js-app-guide";
import { ChatProperties } from "@/lib/types/ai";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useMavenStateController } from "../hooks/maven-state-controller";
import { SidebarUserNavigation } from "./sidebar-navigation";

/** Public home of the Maven app. */
const APP_URL = "https://maven.codebyrzky.site";

const SETTINGS_PATH = "/chat/settings";

const DAY_MS = 86_400_000;

/** Shared look of the primary sidebar actions. */
const NAV_BUTTON_CLASS = "rounded-full";

interface ChatGroup {
  label: string;
  chats: ChatProperties[];
}

/**
 * Buckets chats by their latest activity relative to the viewer's local day.
 * Input order (most recently updated first) is kept inside each bucket.
 */
const groupChatsByDate = (chats: ChatProperties[]): ChatGroup[] => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const today = startOfToday.getTime();

  const buckets: (ChatGroup & { from: number })[] = [
    { label: "Today", from: today, chats: [] },
    { label: "Yesterday", from: today - DAY_MS, chats: [] },
    { label: "Previous 7 days", from: today - 7 * DAY_MS, chats: [] },
    { label: "Previous 30 days", from: today - 30 * DAY_MS, chats: [] },
    { label: "Older", from: Number.NEGATIVE_INFINITY, chats: [] },
  ];

  for (const chat of chats) {
    const time = new Date(chat.updated ?? chat.created).getTime();
    buckets.find((bucket) => time >= bucket.from)?.chats.push(chat);
  }

  return buckets.filter((bucket) => bucket.chats.length > 0);
};

/** Brand mark of Maven. */
const MavenLogo: FC = () => (
  <svg
    className="size-7"
    aria-hidden="true"
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
);

interface MavenSidebarProps extends ComponentProps<typeof Sidebar> {
  chats: ChatProperties[];
}

/**
 * Primary navigation of the app shell. It expands with labels and the chat
 * history, collapses to an icon rail on desktop, and opens as a sheet on
 * mobile.
 */
export const MavenSidebar: FC<MavenSidebarProps> = ({ chats, ...props }) => {
  const { isMobile, setOpenMobile } = useSidebar();
  const { setTheme, resolvedTheme } = useTheme();
  const { isGenerating, setIsGenerating } = useAppState();
  const { flush } = useMavenStateController();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => driverRef.current?.destroy();
  }, []);

  const visibleChats = useMemo(
    () => chats.filter((chat) => chat.chatId !== "" && chat.title !== ""),
    [chats]
  );

  /**
   * Date buckets depend on the viewer's timezone, so they are computed after
   * mount to keep server and client markup identical.
   */
  const chatGroups = useMemo<ChatGroup[]>(
    () =>
      mounted
        ? groupChatsByDate(visibleChats)
        : [{ label: "Recent", chats: visibleChats }],
    [mounted, visibleChats]
  );

  const isDark = mounted && resolvedTheme === "dark";

  /** Closes the mobile sheet after a navigation choice. */
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleNewChat = () => {
    setIsGenerating(false);
    flush();
    closeMobile();
    /** A new chat id remounts the chat provider with an empty conversation. */
    router.push("/chat");
  };

  const startTour = () => {
    if (isTourActive) return;
    setIsTourActive(true);

    const driverOptions: Config = {
      animate: true,
      allowClose: true,
      doneBtnText: "Finish",
      nextBtnText: "Next >",
      prevBtnText: "< Previous",
      showProgress: true,
      progressText: "Step {{current}} of {{total}}",
      onDestroyed: () => setIsTourActive(false),
      popoverClass: "font-(family-name:--font-satoshi)",
    };

    driverRef.current = driver(driverOptions);
    driverRef.current.setSteps(tourSteps);
    driverRef.current.drive();
  };

  return (
    <Sidebar collapsible="icon" data-testid="sidebar-nav" {...props}>
      <SidebarHeader className="font-(family-name:--font-satoshi)">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Maven">
              <Link href={APP_URL} target="_blank" rel="noopener noreferrer">
                <span className="flex size-8 shrink-0 items-center justify-center">
                  <MavenLogo />
                </span>
                <span className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Maven</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Electronics research assistant
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="font-(family-name:--font-satoshi)">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="New chat"
                  variant="outline"
                  className={NAV_BUTTON_CLASS}
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
                  asChild
                  tooltip="History"
                  isActive={pathname === "/history"}
                  className={NAV_BUTTON_CLASS}
                  data-testid="history-button"
                >
                  <Link href="/history" onClick={closeMobile}>
                    <History />
                    <span>History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="AI settings"
                  isActive={pathname.startsWith(SETTINGS_PATH)}
                  className={NAV_BUTTON_CLASS}
                  data-testid="model-settings-button"
                >
                  <Link href={SETTINGS_PATH} onClick={closeMobile}>
                    <Bot />
                    <span>AI settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleChats.length === 0 ? (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <p className="px-2 py-1 text-xs text-muted-foreground">
              Your conversations will show up here.
            </p>
          </SidebarGroup>
        ) : (
          chatGroups.map((group) => (
            <SidebarGroup
              key={group.label}
              className="py-1 group-data-[collapsible=icon]:hidden"
            >
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.chats.map((chat) => {
                    const href = `/chat/c/${chat.chatId}`;
                    const isActive = pathname === href;
                    return (
                      <SidebarMenuItem key={chat.chatId}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link
                            href={href}
                            title={chat.title}
                            aria-current={isActive ? "page" : undefined}
                            onClick={closeMobile}
                          >
                            <span className="truncate">{chat.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      <SidebarFooter className="font-(family-name:--font-satoshi)">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={isDark ? "Light mode" : "Dark mode"}
              className={NAV_BUTTON_CLASS}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              data-testid="theme-toggle-button"
            >
              {isDark ? <Sun /> : <Moon />}
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {!isMobile && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Take the tour"
                className={NAV_BUTTON_CLASS}
                onClick={startTour}
                disabled={isTourActive}
                data-testid="start-tour-button"
              >
                <Proportions />
                <span>Take the tour</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Rate this app"
              className={NAV_BUTTON_CLASS}
              data-testid="rate-app"
            >
              <Link href="/rate-app" target="_blank" rel="noopener noreferrer">
                <Sparkles />
                <span>Rate this app</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Developer portfolio"
              className={NAV_BUTTON_CLASS}
              data-testid="dev-portfolio"
            >
              <Link
                href="https://rzkyprasetyo.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CodeXml />
                <span>Developer portfolio</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="mx-0" />
        <SidebarUserNavigation />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
