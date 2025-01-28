import { AppStateProvider } from "@/lib/utility/provider/app-state-provider";
import { FC, ReactNode } from "react";

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {
  return <AppStateProvider>{children}</AppStateProvider>;
};

export default ChatLayout;
