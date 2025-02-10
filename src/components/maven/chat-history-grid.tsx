import { ChatProperties } from "@/lib/types/ai";
import { FC } from "react";
import { ChatHistoryItem } from "./chat-history-item";
import { motion } from "framer-motion";

interface ChatHistoryProps {
  chats: ChatProperties[];
}

export const ChatHistoryGrid: FC<ChatHistoryProps> = ({ chats }) => {
  const filtered = chats.filter((c) => c.title !== "" && c.chatId !== "");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {filtered.map((chat, index) => (
        <ChatHistoryItem key={chat.chatId || index} chat={chat} />
      ))}
    </motion.div>
  );
};
