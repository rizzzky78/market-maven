"use client";

import {
  BookHeadphones,
  CircleHelp,
  Headphones,
  Laptop,
  Laptop2,
  Smartphone,
} from "lucide-react";
import { ReactNode, useCallback, useId } from "react";
import { motion } from "framer-motion";
import { useActions, useUIState } from "ai/rsc";
import { generateId } from "ai";
import { UserMessage } from "./user-message";
import { toast } from "sonner";
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useDebounceInput } from "../hooks/use-debounced-input";
import { useSmartTextarea } from "../hooks/use-smart-textare";

const predefinedActions: {
  label: string;
  action: string;
  icon: ReactNode;
}[] = [
  {
    label: "Search for dBE Headphone",
    action: "Search for dBE Headphone",
    icon: <Headphones className="size-4 shrink-0 mr-2" />,
  },
  {
    label:
      "What is good from this product https://www.tokopedia.com/soundcorebyanker/new-launch-true-wireless-earbuds-anker-soundcore-a20i-a3948-black-ecda3",
    action:
      "What is good from this product https://www.tokopedia.com/soundcorebyanker/new-launch-true-wireless-earbuds-anker-soundcore-a20i-a3948-black-ecda3",
    icon: <BookHeadphones className="size-4 shrink-0 mr-2" />,
  },
  {
    label: "Comparison between Lenovo Yoga and Legion for gaming purpose",
    action: "Comparison between Lenovo Yoga and Legion for gaming purpose",
    icon: <Laptop className="size-4 shrink-0 mr-2" />,
  },
  {
    label: "What are the important key points in buying a product?",
    action: "What are the important key points in buying a product?",
    icon: <CircleHelp className="size-4 shrink-0 mr-2" />,
  },
  {
    label: "A smartphone with good specifications at an affordable price",
    action: "A smartphone with good specifications at an affordable price",
    icon: <Smartphone className="size-4 shrink-0 mr-2" />,
  },
  {
    label: "Search for Lenovo Yoga",
    action: "Search for Lenovo Yoga",
    icon: <Laptop2 className="size-4 shrink-0 mr-2" />,
  },
];

export function QuickActionButton() {
  const [_, setUIState] = useUIState<typeof AI>();
  const { isGenerating, setIsGenerating } = useAppState();
  const { sendMessage } = useActions<typeof AI>();
  const { flush } = useSmartTextarea();
  const { handleReset } = useDebounceInput();
  const componentId = useId();

  const handleError = useCallback((error: unknown) => {
    console.error("An Error occurred when submitting the query!", error);
    toast.error("Error When Submitting the Query!", {
      position: "top-center",
      richColors: true,
      className:
        "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
    });
  }, []);

  const onAction = useCallback(
    async (action: string) => {
      if (isGenerating) return;

      try {
        setIsGenerating(true);

        // Add user message to UI
        setUIState((prevUI) => [
          ...prevUI,
          {
            id: generateId(),
            display: <UserMessage key={componentId} textInput={action} />,
          },
        ]);

        // Send the message and wait for response
        const { id, display } = await sendMessage({
          textInput: action,
        });

        // Add response to UI
        setUIState((prevUI) => [...prevUI, { id, display }]);

        // Clean up
        flush();
        handleReset();
      } catch (error) {
        handleError(error);
      } finally {
        setIsGenerating(false);
      }
    },
    [
      componentId,
      flush,
      handleError,
      handleReset,
      isGenerating,
      sendMessage,
      setIsGenerating,
      setUIState,
    ]
  );

  return (
    <div className="mb-2 grid gap-2 md:grid-cols-2 lg:grid-cols-2">
      {predefinedActions.map((actionItem, index) => (
        <motion.button
          key={index}
          onClick={async () => await onAction(actionItem.action)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="text-xs cursor-pointer hover:text-black hover:bg-purple-200 flex items-center bg-muted h-14 rounded-3xl px-5 py-3 w-full"
        >
          {actionItem.icon}
          <p className="text-left line-clamp-2">{actionItem.label}</p>
        </motion.button>
      ))}
    </div>
  );
}
