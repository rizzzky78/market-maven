"use client";

import {
  createContext,
  CSSProperties,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getOwnChats } from "@/lib/agents/action/chat-service";
import { ChatProperties } from "@/lib/types/ai";
import { MavenSidebar } from "./maven-sidebar";

interface ShellChatsContextValue {
  /** Chats of the signed-in user, most recently updated first. */
  chats: ChatProperties[];
  /** Reloads the chat list, for example after a reply has been saved. */
  refreshChats: () => Promise<void>;
}

const ShellChatsContext = createContext<ShellChatsContextValue | null>(null);

/** Chat list of the app shell; only usable below `AppShell`. */
export const useShellChats = () => {
  const context = useContext(ShellChatsContext);
  if (!context) {
    throw new Error("useShellChats must be used within AppShell");
  }
  return context;
};

interface AppShellProps {
  /** Chats loaded by the layout on the server. */
  chats: ChatProperties[];
  /** Desktop sidebar state restored from the sidebar cookie. */
  defaultOpen: boolean;
  children: ReactNode;
}

/**
 * Persistent shell of the signed-in app: the collapsible sidebar and the
 * content inset. It stays mounted while moving between chats and settings.
 */
export const AppShell: FC<AppShellProps> = ({
  chats: serverChats,
  defaultOpen,
  children,
}) => {
  const [chats, setChats] = useState(serverChats);
  const [syncedChats, setSyncedChats] = useState(serverChats);

  /** Adopts a fresh server list whenever the layout is revalidated. */
  if (syncedChats !== serverChats) {
    setSyncedChats(serverChats);
    setChats(serverChats);
  }

  const refreshChats = useCallback(async () => {
    try {
      setChats(await getOwnChats());
    } catch (error) {
      console.error("Failed to refresh chats:", error);
    }
  }, []);

  const value = useMemo(() => ({ chats, refreshChats }), [chats, refreshChats]);

  return (
    <ShellChatsContext.Provider value={value}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={{ "--sidebar-width": "17rem" } as CSSProperties}
      >
        <MavenSidebar chats={chats} />
        <SidebarInset className="min-w-0 font-(family-name:--font-satoshi)">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ShellChatsContext.Provider>
  );
};
