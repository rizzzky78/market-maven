"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FC } from "react";

interface ExtendedMessageProps {
  author: string;
  content: string;
}

export const ExtendedMessage: FC<ExtendedMessageProps> = ({
  author,
  content,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Accordion type="single" collapsible className="w-full max-w-2xl">
        <AccordionItem value="comment" className="border-none">
          <AccordionTrigger className="rounded-t-lg bg-background/40 backdrop-blur-md border border-background/20 px-4 py-2 text-sm hover:bg-background/60 transition-all duration-300 [&[data-state=open]>svg]:rotate-180">
            <span className="font-medium">{author}</span>
          </AccordionTrigger>
          <AccordionContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-b-lg bg-background/40 backdrop-blur-md border-x border-b border-background/20 px-4 py-2"
            >
              <p className="text-xs sm:text-sm text-muted-foreground">
                {content}
              </p>
            </motion.div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};
