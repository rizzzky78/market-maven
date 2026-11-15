import { ReactNode } from "react";
import { cookies } from "next/headers";
import { AppShell } from "@/components/maven/app-shell";
import { getChats } from "@/lib/agents/action/chat-service";
import { getSession } from "@/lib/auth";
import { AppStateProvider } from "@/lib/utility/provider/app-state-provider";

/** Cookie written by the sidebar primitive to remember its desktop state. */
const SIDEBAR_COOKIE_NAME = "sidebar:state";

interface ChatLayoutProps {
  children: ReactNode;
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  const [session, cookieStore] = await Promise.all([getSession(), cookies()]);
  /** Owner key of chats; the proxy guarantees a session on this route. */
  const chats = await getChats(session?.user?.id ?? null);
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  return (
    <AppStateProvider>
      <AppShell chats={chats} defaultOpen={defaultOpen}>
        {children}
      </AppShell>
    </AppStateProvider>
  );
}
