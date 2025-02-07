"use client";

import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MoveUpRight, X } from "lucide-react";
import { FC } from "react";
import { BaseProduct } from "@/lib/types/ai";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";

interface BadgeProps {
  attach: BaseProduct;
  onRemove: () => void;
  onSubmit: () => Promise<void>;
}

export const AttachProductBadge: FC<BadgeProps> = ({
  attach,
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
        <Badge
          variant="secondary"
          className="flex w-full justify-between items-center gap-2 py-2 pl-5 rounded-3xl mb-1 bg-[#D8D2C2] hover:bg-[#D8D2C2] dark:bg-[#343131] dark:hover:bg-[#343131]"
        >
          <p className="line-clamp-1 text-xs font-normal">{attach.title}</p>
          <div className="flex items-center bg-muted rounded-full">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="rounded-full size-8 mr-1 hover:bg-black/50"
                    onClick={onRemove}
                  >
                    <X className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-3xl">
                  <p className="max-w-sm font-semibold">
                    Remove product attachment
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="rounded-full size-8 hover:bg-black/50"
                    onClick={onSubmit}
                  >
                    <MoveUpRight className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-3xl">
                  <p className="max-w-sm font-semibold">
                    Request product details or along with text inputs
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Badge>
      </motion.div>
    </div>
  );
};
