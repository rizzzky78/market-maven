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
import { motion, useReducedMotion } from "motion/react";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useMavenChat } from "@/lib/utility/provider/chat-provider";
import { useMavenStateController } from "../hooks/maven-state-controller";

const predefinedActions: {
  action: string;
  icon: ReactNode;
}[] = [
  {
    action: "Find the Samsung Galaxy S24 Ultra",
    icon: <Smartphone className="size-4 shrink-0 text-muted-foreground" aria-hidden />,
  },
  {
    action: "Recommend a laptop for gaming",
    icon: <Laptop2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />,
  },
  {
    action: "Is the Lenovo Yoga right for me?",
    icon: <Laptop className="size-4 shrink-0 text-muted-foreground" aria-hidden />,
  },
  {
    action: "Suggest a handheld gaming console",
    icon: <Gamepad className="size-4 shrink-0 text-muted-foreground" aria-hidden />,
  },
  {
    action: "Help me pick a graphics card for my PC",
    icon: <RectangleHorizontal className="size-4 shrink-0 text-muted-foreground" aria-hidden />,
  },
  {
    action: "Find dBE headphones",
    icon: <Headphones className="size-4 shrink-0 text-muted-foreground" aria-hidden />,
  },
];

export const QuickActionButton: FC = () => {
  const { submit } = useMavenChat();
  const { isGenerating } = useAppState();
  const { flush } = useMavenStateController();
  const reduceMotion = useReducedMotion();

  const actionSubmit = useCallback(
    async (query: string) => {
      if (isGenerating) return;

      flush();
      await submit({ textInput: query });
    },
    [flush, isGenerating, submit]
  );
  return (
    <ul
      className="mt-4 flex flex-wrap justify-center gap-2"
      aria-label="Suggested questions"
      data-testid="quick-actions"
    >
      {predefinedActions.map((actionItem, index) => (
        <motion.li
          key={actionItem.action}
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.03, ease: [0.25, 1, 0.5, 1] }}
          className={cn(index >= 4 && "hidden sm:block")}
        >
          <button
            type="button"
            disabled={isGenerating}
            onClick={async () => await actionSubmit(actionItem.action)}
            className="flex min-h-9 cursor-pointer items-center gap-2 rounded-full border bg-background px-3.5 py-1.5 text-left text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-accent/70 disabled:pointer-events-none disabled:opacity-50"
          >
            {actionItem.icon}
            <span>{actionItem.action}</span>
          </button>
        </motion.li>
      ))}
    </ul>
  );
};
