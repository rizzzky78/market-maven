import { LiveMessages } from "@/components/custom/view-renderer";
import { MavenUIMessage, UIState } from "@/lib/types/ai";
import { FC, Fragment } from "react";

interface MessagesProps {
  /** Saved messages restored by `mapUIState` */
  history: UIState;
  /** Messages streamed since the page loaded */
  messages: MavenUIMessage[];
}

export const ChatMessages: FC<MessagesProps> = ({ history, messages }) => {
  return (
    <div className="space-y-6 md:space-y-8">
      {history.map((component) => (
        <Fragment key={component.id}>{component.display}</Fragment>
      ))}
      <LiveMessages messages={messages} />
    </div>
  );
};
