import { cache, FC } from "react";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { getChats } from "@/lib/agents/action/chat-service";
import { MavenChatProvider } from "@/lib/utility/provider/chat-provider";
import { Chat } from "@/components/maven/main-chat";

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

const Page: FC = async () => {
  const id = uuidv4();
  const session = await getServerSession();
  const username = session?.user?.email || "anonymous@gmail.com";

  const chats = await loadChats(username);

  return (
    <MavenChatProvider
      key={id}
      chatId={id}
      username={username}
      initialMessages={[]}
    >
      <Chat id={id} chats={chats} />
    </MavenChatProvider>
  );
};

export default Page;
