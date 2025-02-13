import { AppStateProvider } from "@/lib/utility/provider/app-state-provider";
import { FC, ReactNode } from "react";

interface ShareLayputProps {
  children: ReactNode;
}

const ShareLayout: FC<ShareLayputProps> = ({ children }) => {
  return <AppStateProvider>{children}</AppStateProvider>;
};

export default ShareLayout;
