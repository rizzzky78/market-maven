import { UIState } from "@/lib/types/ai";
import { FC } from "react";

interface MessagesProps {
  ui: UIState;
}

export const ChatMessages: FC<MessagesProps> = ({ ui }) => {
  return (
    <div className="space-y-6 md:space-y-8">
      {ui.map((component) => component.display)}
    </div>
  );
};
