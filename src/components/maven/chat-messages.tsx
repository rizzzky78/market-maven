import { UIState } from "@/lib/types/ai";
import { FC } from "react";

interface MessagesProps {
  ui: UIState;
}

export const ChatMessages: FC<MessagesProps> = ({ ui }) => {
  return <>{ui.map((component) => component.display)}</>;
};
