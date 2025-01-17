"use client";

import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { FC } from "react";

interface BadgeProps {
  attach: { id: string | number; title: string; link: string };
  onRemove: () => void;
}

export const AttachProductBadge: FC<BadgeProps> = ({ attach, onRemove }) => {
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
          <Button
            variant={"ghost"}
            className="rounded-full size-8 hover:bg-muted"
            onClick={onRemove}
          >
            <X className="size-4" />
          </Button>
        </Badge>
      </motion.div>
    </div>
  );
};
