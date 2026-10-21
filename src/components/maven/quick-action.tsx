"use client";

import {
  Gamepad,
  Headphones,
  Laptop,
  Laptop2,
  RectangleHorizontal,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FC, ReactNode, useCallback } from "react";
import { motion } from "motion/react";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useMavenChat } from "@/lib/utility/provider/chat-provider";
import { useMavenStateController } from "../hooks/maven-state-controller";

const predefinedActions: {
  action: string;
  icon: ReactNode;
}[] = [
  {
    action: "Find the Samsung Galaxy S24 Ultra",
    icon: <Smartphone className="size-4 shrink-0 text-muted-foreground" />,
  },
  {
    action: "Recommend a laptop for gaming",
    icon: <Laptop2 className="size-4 shrink-0 text-muted-foreground" />,
  },
  {
    action: "Is the Lenovo Yoga right for me?",
    icon: <Laptop className="size-4 shrink-0 text-muted-foreground" />,
  },
  {
    action: "Suggest a handheld gaming console",
    icon: <Gamepad className="size-4 shrink-0 text-muted-foreground" />,
  },
  {
    action: "Help me pick a graphics card for my PC",
    icon: <RectangleHorizontal className="size-4 shrink-0 text-muted-foreground" />,
  },
  {
    action: "Find dBE headphones",
    icon: <Headphones className="size-4 shrink-0 text-muted-foreground" />,
  },
];

export const QuickActionButton: FC = () => {
  const { submit } = useMavenChat();
  const { isGenerating } = useAppState();
  const { flush } = useMavenStateController();

  const actionSubmit = useCallback(
    async (query: string) => {
      if (isGenerating) return;

      flush();
      await submit({ textInput: query });
    },
    [flush, isGenerating, submit]
  );
  return (
    <div className="mb-6 w-full">
      <div className="mb-6 text-center md:mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">
          What are you shopping for?
        </h2>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          Search, compare and get recommendations on electronics.
        </p>
      </div>
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        data-testid="quick-actions"
      >
        {predefinedActions.map((actionItem, index) => (
          <motion.button
            key={index}
            type="button"
            disabled={isGenerating}
            onClick={async () => await actionSubmit(actionItem.action)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className={cn(
              "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border bg-background px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
              index >= 4 && "hidden sm:flex"
            )}
          >
            {actionItem.icon}
            <span className="line-clamp-2">{actionItem.action}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
