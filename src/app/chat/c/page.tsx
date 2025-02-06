import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cache, FC, Suspense } from "react";
import { getChats } from "@/lib/agents/action/chat-service";
import { v4 } from "uuid";
import { Chat } from "@/components/maven/chat";
import { AIProvider } from "@/lib/utility/provider/ai-state-provider";
import { getInitialState } from "@/lib/agents/action/mutator/ai-state-service";

export const maxDuration = 60;

interface PageProps {
  searchParams: Promise<{ q: string }>;
}

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

const Page: FC<PageProps> = async ({ searchParams }) => {
  const { q } = await searchParams;
  if (!q) {
    redirect("/chat");
  }
  const { username, chats, initialState } = await getInitialState();

  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <AIProvider
        username={username}
        initialState={initialState}
        serverPreloaded={true}
      >
        <Chat id={initialState.chatId} chats={chats} />
      </AIProvider>
    </Suspense>
  );
};

export default Page;
