import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cache, FC } from "react";
import { getChats } from "@/lib/agents/action/chat-service";
import { v4 } from "uuid";
import { AI } from "@/app/action";
import { Chat } from "@/components/maven/chat";

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
  const id = v4();
  const session = await getServerSession();

  const chats = await loadChats(session?.user?.email || "anonymous");

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} query={q} chats={chats} />
    </AI>
  );
};

export default Page;
