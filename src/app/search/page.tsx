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

export default function ChatPage() {
  const id = uuidv4();
  // const session = await getServerSession();

  // const chats = await getChats("anonymous");

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} chats={[]} />
    </AI>
  );
}
