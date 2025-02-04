import { cache, FC } from "react";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { getChats } from "@/lib/agents/action/chat-service";

export const maxDuration = 60;

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

export default async function Page() {
  const id = uuidv4();
  const session = await getServerSession();

  const chats = await loadChats(session?.user?.email || "anonymous");

  return (
    <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-10">
      <div>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
      <div>
        <pre>{JSON.stringify(chats, null, 2)}</pre>
      </div>
    </div>
  );
}
