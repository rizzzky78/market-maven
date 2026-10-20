import { UIState } from "@/lib/types/ai";
import { FC } from "react";

interface MessagesProps {
  ui: UIState;
}

export const ChatMessages: FC<MessagesProps> = ({ ui }) => {
  console.log(ui);
  return (
    <div className="space-y-10 *:font-(family-name:--font-satoshi)">
      {ui.map((component) => component.display)}
    </div>
  );
};
