"use client";

import { motion } from "motion/react";
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
  const ready = compare.for.length === 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="mb-2 rounded-xl border bg-card p-1.5"
    >
      <p className="px-1.5 pb-1.5 text-[11px] text-muted-foreground">
        Comparing {compare.for.length} of 2
      </p>
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-1.5 sm:grid-cols-2">
          {compare.for.map((c) => (
            <Badge
              key={c.callId}
              variant="secondary"
              className="flex min-w-0 items-center justify-between gap-1 rounded-lg py-0.5 pr-0.5 pl-2.5 font-normal"
            >
              <span className="line-clamp-1 text-xs">{c.title}</span>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-7 shrink-0 rounded-full"
                onClick={() => onRemove(c.callId)}
                aria-label={`Remove ${c.title} from comparison`}
              >
                <X className="size-3.5" />
              </Button>
            </Badge>
          ))}
          {compare.for.length === 1 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed px-2.5 py-1.5 text-xs text-muted-foreground">
              Pick one more product to compare
            </div>
          )}
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                size={"sm"}
                className="h-8 gap-1 rounded-full"
                onClick={onSubmit}
                disabled={!ready}
              >
                Compare
                <MoveUpRight className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compare both products, add a question first if you like</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
};
