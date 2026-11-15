import { FC } from "react";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/auth";
import { MavenChatProvider } from "@/lib/utility/provider/chat-provider";
import { Chat } from "@/components/maven/main-chat";

const Page: FC = async () => {
  const id = uuidv4();
  const session = await getSession();
  /** Owner key of chats; the proxy guarantees a session on this route. */
  const username = session?.user?.id ?? "";


  return (
    <MavenChatProvider
      key={id}
      chatId={id}
      username={username}
      initialMessages={[]}
    >
      <Chat id={id} />
    </MavenChatProvider>
  );
};

export default Page;
