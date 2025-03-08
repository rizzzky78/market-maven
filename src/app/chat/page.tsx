import { cache, FC } from "react";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { getChats } from "@/lib/agents/action/chat-service";
import { AI } from "../action";
import { Chat } from "@/components/maven/main-chat";

export const maxDuration = 60;

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

const Page: FC = async () => {
  const id = uuidv4();
  const session = await getServerSession();
  const username = session?.user?.email || "anonymous";

  const chats = await loadChats(username);

  return (
    <AI initialAIState={{ chatId: id, username, messages: [] }}>
      <Chat id={id} chats={chats} />
    </AI>
  );
};

export default Page;
