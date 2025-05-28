"use client";

import {
  Gamepad,
  Headphones,
  Laptop,
  Laptop2,
  RectangleHorizontal,
  Smartphone,
} from "lucide-react";
import { FC, ReactNode, useCallback } from "react";
import { motion } from "framer-motion";
import { StreamGeneration } from "@/lib/types/ai";
import { generateId } from "ai";
import { readStreamableValue, useActions, useUIState } from "ai/rsc";
import { UserMessage } from "./user-message";
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useMavenStateController } from "../hooks/maven-state-controller";
import { toast } from "sonner";

const predefinedActions: {
  action: string;
  icon: ReactNode;
}[] = [
  {
    action: "Search for Samsung Galaxy S24 Ultra",
    icon: <Smartphone className="size-5 mr-2 shrink-0" />,
  },
  {
    action: "I want to buy a new laptop with gaming specs",
    icon: <Laptop2 className="size-5 mr-2 shrink-0" />,
  },
  {
    action: "Search for Lenovo Yoga and check if it matches my preferences.",
    icon: <Laptop className="size-5 mr-2 shrink-0" />,
  },
  {
    action: "I want buy handheld console, do you have suggestions?",
    icon: <Gamepad className="size-5 mr-2 shrink-0" />,
  },
  {
    action: "Im looking for discrete graphic for my PC",
    icon: <RectangleHorizontal className="size-5 mr-2 shrink-0" />,
  },
  {
    action: "Search for dBE headphone",
    icon: <Headphones className="size-5 mr-2 shrink-0" />,
  },
];

export const QuickActionButton: FC = () => {
  const [, setUIState] = useUIState<typeof AI>();
  const { orchestrator } = useActions<typeof AI>();
  const { isGenerating, setIsGenerating } = useAppState();
  const { attachment, flush, activeComparison, search, related, reffSource } =
    useMavenStateController();

  const actionSubmit = useCallback(
    async (query: string) => {
      if (isGenerating) return;

      try {
        setIsGenerating(true);

        const componentId = generateId();

        setUIState((prevUI) => [
          ...prevUI,
          {
            id: generateId(),
            display: (
              <UserMessage
                key={componentId}
                content={{
                  text_input: query,
                  attach_product: attachment,
                  product_compare: activeComparison,
                }}
              />
            ),
          },
        ]);

        flush();

        const { id, display, generation } = await orchestrator(
          {
            textInput: query,
          },
          { onRequest: { search, related, reffSource } }
        );

        setUIState((prevUI) => [...prevUI, { id, display }]);

        if (generation) {
          const gens = readStreamableValue(
            generation
          ) as AsyncIterable<StreamGeneration>;
          for await (const { loading } of gens) {
            setIsGenerating(loading);
          }
        }
      } catch (error) {
        console.error("An Error occured when submitting the query!", error);
        toast.error("Error When Submitting the Query!", {
          position: "top-center",
          richColors: true,
          className:
            "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [
      activeComparison,
      attachment,
      flush,
      isGenerating,
      orchestrator,
      reffSource,
      related,
      search,
      setIsGenerating,
      setUIState,
    ]
  );
  return (
    <div className="w-full">
      <div className="mb-20">
        <div className="flex justify-center">
          <svg
            className="coolshapes triangle-6 "
            height="200"
            width="200"
            fill="none"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#cs_clip_1_triangle-6)">
              <mask
                height="200"
                id="cs_mask_1_triangle-6"
                style={{ maskType: "alpha" }}
                width="200"
                x="0"
                y="0"
                maskUnits="userSpaceOnUse"
              >
                <path
                  d="M200 0v200L0 0h200zM100 100v100L0 100h100z"
                  fill="#fff"
                />
              </mask>
              <g mask="url(#cs_mask_1_triangle-6)">
                <path d="M200 0H0v200h200V0z" fill="#fff" />
                <path d="M200 0H0v200h200V0z" fill="#0E6FFF" />
                <g filter="url(#filter0_f_748_4934)">
                  <path
                    d="M243.892 107.197h-222v116h222v-116z"
                    fill="#8F5BFF"
                  />
                  <ellipse
                    cx="68.935"
                    cy="-27.395"
                    fill="#00F0FF"
                    rx="111.935"
                    ry="63.605"
                  />
                </g>
              </g>
            </g>
            <g
              style={{ mixBlendMode: "overlay" }}
              mask="url(#cs_mask_1_triangle-6)"
            >
              <path
                d="M200 0H0v200h200V0z"
                fill="gray"
                stroke="transparent"
                filter="url(#cs_noise_1_triangle-6)"
              />
            </g>
            <defs>
              <filter
                height="434.197"
                id="filter0_f_748_4934"
                width="406.892"
                x="-103"
                y="-151"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood result="BackgroundImageFix" floodOpacity="0" />
                <feBlend
                  result="shape"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                />
                <feGaussianBlur
                  result="effect1_foregroundBlur_748_4934"
                  stdDeviation="30"
                />
              </filter>
              <clipPath id="cs_clip_1_triangle-6">
                <path d="M0 0H200V200H0z" fill="#fff" />
              </clipPath>
            </defs>
            <defs>
              <filter
                height="100%"
                id="cs_noise_1_triangle-6"
                width="100%"
                x="0%"
                y="0%"
                filterUnits="objectBoundingBox"
              >
                <feBlend result="out3" in="SourceGraphic" in2="out2" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div
        className="mb-2 mt-2 grid gap-2 grid-cols-2 md:grid-cols-2 lg:grid-cols-2"
        data-testid="quick-actions"
      >
        {predefinedActions.map((actionItem, index) => (
          <motion.button
            key={index}
            onClick={async () => await actionSubmit(actionItem.action)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="text-xs cursor-pointer hover:text-black hover:bg-purple-200 flex items-center bg-muted h-12 rounded-3xl px-5 py-2 w-full"
          >
            {actionItem.icon}
            <p className="text-xs text-left line-clamp-2">
              {actionItem.action}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
