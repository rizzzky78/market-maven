import { UIState } from "@/lib/types/ai";
import { FC } from "react";

interface MessagesProps {
  ui: UIState;
}

export const ChatMessages: FC<MessagesProps> = ({ ui }) => {
  return (
    <div className="space-y-10 *:font-[family-name:var(--font-satoshi)]">{ui.map((component) => component.display)}</div>
  );
};
