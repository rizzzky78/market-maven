// import { FC, Suspense } from "react";
// import { Chat } from "@/components/maven/chat";
// import { AIProvider } from "@/lib/utility/provider/ai-state-provider";
// import { getInitialState } from "@/lib/agents/action/mutator/ai-state-service";
// import { AI } from "../action";
// import { v4 } from "uuid";

// export const maxDuration = 60;

// export default async function ChatPage() {
//   const { username, chats, initialState } = await getInitialState();

//   return (
//     <Suspense fallback={<div>Loading chat...</div>}>
//       <AIProvider
//         username={username}
//         initialState={initialState}
//         serverPreloaded={true}
//       >
//         <Chat id={initialState.chatId} chats={chats} />
//       </AIProvider>
//     </Suspense>
//   );
// }

import { cache, FC } from "react";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { getChats } from "@/lib/agents/action/chat-service";
import { Chat } from "@/components/maven/chat";
import { AI } from "../action";
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
