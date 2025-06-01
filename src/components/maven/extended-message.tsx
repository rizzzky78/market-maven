"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FC, useEffect, useState } from "react";
import { Markdown } from "@/components/maven/markdown";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StreamableValue, useStreamableValue } from "ai/rsc";
import { Loader } from "lucide-react";
import { ErrorMessage } from "@/components/maven/error-message";

interface ExtendedMessageProps {
  content: string;
  tavilyAnswer?: string;
}

export const ExtendedMessage: FC<ExtendedMessageProps> = ({
  content,
  tavilyAnswer,
}) => {
  return (
    <Card className="w-full border rounded-3xl mb-8">
      <Accordion
        type="single"
        collapsible
        className="px-2 py-1 rounded-3xl bg-background *:border-none"
      >
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="hover:no-underline p-2 flex justify-start items-start text-black/90 dark:text-white/90 text-sm font-medium rounded-3xl bg-background">
            <span className="line-clamp-1 font-normal text-sm">
              Deep Search
            </span>
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
                  <ScrollArea className="h-[220px] px-2">
                    <Markdown className="leading-tight">{content}</Markdown>
                    {tavilyAnswer && (
                      <div>
                        <Separator className="mb-3 bg-[#1A1A1D] dark:bg-muted" />
                        <p className="text-sm leading-relaxed">
                          {tavilyAnswer}
                        </p>
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

interface StreamExtendedMessageProps {
  tavilyAnswer?: string;
  content: StreamableValue<string>;
  title?: string;
}

export const StreamExtendedMessage: FC<StreamExtendedMessageProps> = ({
  content,
  tavilyAnswer,
  title,
}) => {
  const [raw, error, pending] = useStreamableValue<string>(content);
  const [text, setText] = useState("");

  useEffect(() => {
    if (raw) setText(raw);
  }, [raw]);

  if (error) {
    return (
      <ErrorMessage
        errorName="Stream Text Parsing Operation Failed"
        reason="There was an error while parsing the streamable-value input. This error was occured by server."
        raw={{ trace: raw }}
      />
    );
  }

  return (
    <Card className="border-[#1A1A1D] dark:border-inherit border rounded-3xl mb-8">
      <Accordion
        type="single"
        collapsible
        defaultValue="item-1"
        className="px-2 py-1 rounded-3xl bg-background *:border-none"
      >
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-2 flex items-start text-black/90 dark:text-white/90 text-sm font-medium rounded-3xl bg-background">
            <div className="flex items-center">
              {pending && (
                <Loader className="size-4 shrink-0 animate-spin mr-2" />
              )}
              <span className="line-clamp-1">{title ?? "Deep Search"}</span>
            </div>
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
                        <Separator className="mb-3" />
                        <p className="text-sm leading-relaxed">
                          {tavilyAnswer}
                        </p>
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
