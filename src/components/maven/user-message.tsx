"use client";

import { FC, useState } from "react";
import { Markdown } from "./markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Check, Copy, ScanSearch } from "lucide-react";
import { AttachLink } from "@/lib/types/ai";
import { Badge } from "../ui/badge";

interface MessageProps {
  textInput: string;
  attachLink?: AttachLink;
}

export const UserMessage: FC<MessageProps> = ({ textInput, attachLink }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      {attachLink && (
        <div className="flex justify-end">
          <Badge
            variant={"secondary"}
            className="px-5 py-2 flex space-x-2 items-center hover:bg-inherit bg-gray-300 dark:bg-white dark:text-black rounded-l-[2rem] rounded-tr-[2rem] rounded-br-none"
          >
            <ScanSearch className="size-5" />
            <p className="font-normal text-xs line-clamp-1">
              {attachLink.meta.title}
            </p>
          </Badge>
        </div>
      )}
      <div className="flex justify-end">
        <div
          className={`bg-[#343131] w-fit max-w-[90%] py-3 px-5 rounded-l-[2rem] ${
            attachLink ? "rounded-br-[2rem]" : "rounded-r-[2rem]"
          }`}
        >
          <div className="group relative">
            <Markdown className="whitespace-pre-wrap text-white">
              {textInput}
            </Markdown>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute rounded-full text-white h-8 w-1 -bottom-8 right-3 bg-[#1A1A1D] opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check /> : <Copy />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};
