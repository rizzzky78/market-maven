import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cache } from "react";
import { getChats } from "@/lib/agents/action/chat-service";
import { v4 } from "uuid";
import { AI } from "@/app/action";
import { Chat } from "@/components/maven/main-chat";

export const maxDuration = 60;

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function Page(props: PageProps) {
  const { query } = await props.searchParams;

  if (!query) {
    redirect("/chat");
  }

  const id = v4();
  const session = await getServerSession();
  const username = session?.user?.email || "anonymous@gmail.com";

  const chats = await loadChats(username);

  return (
    <AI initialAIState={{ chatId: id, username, messages: [] }}>
      <Chat id={id} query={query} chats={chats} />
    </AI>
  );
}
