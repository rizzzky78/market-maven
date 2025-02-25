"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FC, useEffect, useState } from "react";
import { Markdown } from "./markdown";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { StreamableValue, useStreamableValue } from "ai/rsc";

interface ExtendedMessageProps {
  title: string;
  content: string;
}

export const ExtendedMessage: FC<ExtendedMessageProps> = ({
  title,
  content,
}) => {
  return (
    <Card className="border-[#1A1A1D] dark:border-inherit border rounded-3xl">
      <Accordion
        type="single"
        collapsible
        className="px-2 py-1 rounded-3xl bg-background *:border-none"
      >
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-2 flex items-start text-black/90 dark:text-white/90 text-sm font-medium rounded-3xl bg-background">
            {title}
          </AccordionTrigger>
          <AccordionContent className="rounded-3xl">
            <CardContent className="p-0 rounded-3xl">
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pr-2 *:leading-tight *:dark:text-white/80 *:text-black/80"
                >
                  <Separator className="mb-3" />
                  <ScrollArea className="h-[300px] px-2">
                    <Markdown className="leading-tight">{content}</Markdown>
                  </ScrollArea>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

interface StreamExtendedMessageProps {
  title: string;
  tavilyAnswer?: string;
  content: StreamableValue<string>;
}

export const StreamExtendedMessage: FC<StreamExtendedMessageProps> = ({
  title,
  content,
  tavilyAnswer,
}) => {
  const [raw, error, pending] = useStreamableValue<string>(content);
  const [text, setText] = useState("");

  useEffect(() => {
    if (raw) setText(raw);
  }, [raw]);

  return (
    <Card className="border-[#1A1A1D] dark:border-inherit border rounded-3xl">
      <Accordion
        type="single"
        collapsible
        className="px-2 py-1 rounded-3xl bg-background *:border-none"
      >
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-2 flex items-start text-black/90 dark:text-white/90 text-sm font-medium rounded-3xl bg-background">
            {title}
          </AccordionTrigger>
          <AccordionContent className="rounded-3xl">
            <CardContent className="p-0 rounded-3xl">
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pr-2 *:leading-tight *:dark:text-white/80 *:text-black/80"
                >
                  <Separator className="mb-3" />
                  <ScrollArea className="h-[300px] px-2">
                    <Markdown className="leading-tight">{text}</Markdown>
                    {tavilyAnswer && (
                      <div>
                        <Separator />
                        <p className="text-xs">{tavilyAnswer}</p>
                      </div>
                    )}
                  </ScrollArea>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
