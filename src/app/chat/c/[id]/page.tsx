import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getChat, getChats } from "@/lib/agents/action/chat-service";
import { cache, FC, Suspense } from "react";
import { AI } from "@/app/action";
import { Chat } from "@/components/maven/chat";
import { AIStateProvider } from "@/lib/utility/provider/ai-state-provider";
import { getInitialState } from "@/lib/agents/action/mutator/ai-state-service";

export const maxDuration = 60;

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

export const generateMetadata = async (props: ChatPageProps) => {
  const params = await props.params;
  const { id } = params;

  const chat = await getChat(id);
  return {
    title: chat?.title.toString().slice(0, 50) || "Maven Search",
  };
};

const ChatPage: FC<ChatPageProps> = async ({ params }) => {
  const { id } = await params;

  const chat = await getChat(id);

  const { username, chats, initialState } = await getInitialState(id);

  if (!chat) {
    redirect("/chat");
  }

  if (chat?.userId !== username) {
    notFound();
  }

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
};

export default ChatPage;
