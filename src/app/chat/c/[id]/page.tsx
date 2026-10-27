import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getChat, getChats } from "@/lib/agents/action/chat-service";
import { cache } from "react";
import { MavenChatProvider } from "@/lib/utility/provider/chat-provider";
import { Chat } from "@/components/maven/main-chat";
import { Metadata } from "next";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

export const generateMetadata = async (
  props: ChatPageProps
): Promise<Metadata> => {
  const params = await props.params;
  const { id } = params;

  const chat = await getChat(id);
  const pageTitle = `${chat?.title.toString()} | Maven AI`;
  return {
    title: pageTitle || "Maven Research",
  };
};

export default async function ChatPage(props: ChatPageProps) {
  const params = await props.params;
  const { id } = params;

  const session = await getSession();
  const username = session?.user?.email || "anonymous@gmail.com";
  const chats = await loadChats(username);

  const chat = await getChat(id);

  if (!chat) {
    redirect("/chat");
  }

  if (chat?.userId !== username) {
    notFound();
  }

  return (
    <MavenChatProvider
      key={chat.chatId}
      chatId={chat.chatId}
      username={username}
      initialMessages={chat.messages}
    >
      <Chat id={id} chats={chats} />
    </MavenChatProvider>
  );
}
