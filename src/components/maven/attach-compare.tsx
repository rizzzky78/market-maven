"use client";

import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MoveUpRight, X } from "lucide-react";
import { FC } from "react";
import { ProductCompare } from "@/lib/types/ai";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";

interface BadgeProps {
  compare: ProductCompare;
  onRemove: (callId: string) => void;
  onSubmit: () => Promise<void>;
}

export const AttachCompareBadge: FC<BadgeProps> = ({
  compare,
  onRemove,
  onSubmit,
}) => {
  return (
    <div className="flex flex-wrap gap-1">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-1 py-0.5 pl-1 pr-1.5 bg-[#D8D2C2] hover:bg-[#D8D2C2] dark:bg-[#343131] dark:hover:bg-[#343131] rounded-3xl">
          <div className="grid grid-cols-2 gap-1 w-full">
            {compare.for.map((c) => (
              <Badge
                key={c.callId}
                variant="secondary"
                className="flex w-full py-1 my-0.5 justify-between items-center rounded-3xl"
              >
                <p className="line-clamp-1 text-xs font-normal">{c.title}</p>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"ghost"}
                        className="rounded-full hover:text-white size-8 hover:bg-black/50 -mr-1"
                        onClick={() => onRemove(c.callId)}
                      >
                        <X className="size-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-3xl">
                      <p className="max-w-sm font-semibold">
                        Remove compare attachment
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Badge>
            ))}
            {compare.for.length === 1 && (
              <Badge
                variant={"secondary"}
                className="flex border-black dark:border-white border-dashed border-spacing-2 bg-none w-full py-1 my-0.5 justify-center items-center rounded-3xl"
              >
                <p className="line-clamp-1 text-xs font-normal">
                  Add one more product to perform comparison
                </p>
              </Badge>
            )}
          </div>
          <div className="ml-1">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="rounded-full size-10 bg-[#1A1A1D] text-white"
                    onClick={onSubmit}
                    disabled={compare.for.length !== 2}
                  >
                    <MoveUpRight className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-3xl">
                  <p className="max-w-sm font-semibold">
                    Request products comparison or along with text inputs
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
