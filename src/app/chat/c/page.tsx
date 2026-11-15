import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { v4 } from "uuid";
import { MavenChatProvider } from "@/lib/utility/provider/chat-provider";
import { Chat } from "@/components/maven/main-chat";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function Page(props: PageProps) {
  const { query } = await props.searchParams;

  if (!query) {
    redirect("/chat");
  }

  const id = v4();
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
      <Chat id={id} query={query} />
    </MavenChatProvider>
  );
}
