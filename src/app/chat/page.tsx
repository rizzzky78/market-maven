import { Suspense } from "react";
import { Chat } from "@/components/maven/chat";
import { AIStateProvider } from "@/lib/utility/provider/ai-state-provider";
import { getInitialState } from "@/lib/agents/action/mutator/ai-state-service";

export const maxDuration = 60;

export default async function ChatPage() {
  const { username, chats, initialState } = await getInitialState();

  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <AIStateProvider
        username={username}
        initialState={initialState}
        serverPreloaded={true}
      >
        <Chat id={initialState.chatId} chats={chats} />
      </AIStateProvider>
    </Suspense>
  );
}
