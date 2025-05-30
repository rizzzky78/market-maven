"use client";

import type { ChatProperties, UserContentMessage } from "@/lib/types/ai";
import { cn, formatDateWithTime } from "@/lib/utils";
import Link from "next/link";
import { type FC, type MouseEvent, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ChatProps {
  chat: ChatProperties;
}

export const ChatHistoryItem: FC<ChatProps> = ({ chat }) => {
  const boxWrapper = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const [overlayColor, setOverlayColor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition as any);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition as any);
    };
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (boxWrapper.current) {
      const { left, top } = boxWrapper.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      setOverlayColor({ x, y });
    }
  };

  const firstUserMessage = chat.messages.find(
    (m) => m.role === "user"
  )?.content;
  const { text_input }: UserContentMessage = JSON.parse(
    firstUserMessage as string
  );

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={item}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/chat/c/${chat.chatId}`} className="block">
        <div
          ref={boxWrapper}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "group relative rounded-2xl p-[2px] bg-[#eeeeee15] overflow-hidden w-full transition-all duration-300 hover:shadow-lg"
          )}
        >
          {isHovered && (
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition duration-300"
              style={{
                background: `
                radial-gradient(
                  250px circle at ${overlayColor.x}px ${overlayColor.y}px,
                  rgba(255, 255, 255, 0.1),
                  transparent 80%
                )
              `,
              }}
            />
          )}
          <div
            className="absolute inset-0 z-0 bg-fixed"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.03) 0%, transparent 20%, transparent) fixed`,
            }}
          />
          <div className="relative z-20 h-full min-h-32 flex flex-col bg-[#1A1A1D]/20 dark:bg-none rounded-2xl px-4 py-3">
            <div className="h-10 mb-2">
              <h3 className="text-md text-black/90 dark:text-white font-semibold line-clamp-2">
                {chat.title}
              </h3>
            </div>
            <div className="flex items-center text-white/70 bg-[#1A1A1D] py-1 px-2 rounded-r-3xl w-fit">
              <p className="text-[12px]">
                {formatDateWithTime(chat.created)}
              </p>
            </div>
            <div className="mt-2 flex items-center dark:text-white/80">
              <p className="text-sm line-clamp-1">{text_input}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
