import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getChat, getChats } from "@/lib/agents/action/chat-service";
import { cache, FC } from "react";
import { AI } from "@/app/action";
import { Chat } from "@/components/maven/chat";

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

  const session = await getServerSession();
  const chats = await loadChats(session?.user?.email || "anonymous");

  const userId = session?.user?.email as string;
  const chat = await getChat(id);

  if (!chat) {
    redirect("/chat");
  }

  if (chat?.userId !== userId) {
    notFound();
  }

  return (
    <AI
      initialAIState={{
        chatId: chat.chatId,
        messages: chat.messages,
      }}
    >
      <Chat id={id} chats={chats} />
    </AI>
  );
};

export default ChatPage;
