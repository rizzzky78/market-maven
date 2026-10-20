"use client";

import { motion } from "motion/react";
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="mb-2 flex items-center gap-2 rounded-xl border bg-card py-1.5 pr-1.5 pl-3"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">Asking about</p>
        <p className="line-clamp-1 text-sm">{attach.title}</p>
      </div>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant={"ghost"}
              size={"icon"}
              className="size-8 rounded-full"
              onClick={onRemove}
              aria-label="Remove attached product"
            >
              <X className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove product</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant={"secondary"}
              size={"sm"}
              className="h-8 gap-1 rounded-full"
              onClick={onSubmit}
            >
              Get details
              <MoveUpRight className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Get product details, add a question first if you like</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
};
