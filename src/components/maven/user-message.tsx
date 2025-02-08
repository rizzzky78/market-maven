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
import { ArrowUpRight, Check, Copy, Tag } from "lucide-react";
import { UserContentMessage } from "@/lib/types/ai";
import { Badge } from "../ui/badge";

interface MessageProps {
  content: UserContentMessage;
}

export const UserMessage: FC<MessageProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content.text_input ?? "No-Value");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full mb-14 mt-6 py-4">
      {content.attach_product && (
        <div className="flex justify-end">
          <Badge
            variant={"secondary"}
            className="px-5 py-2 flex max-w-[90%] space-x-2 items-center hover:bg-gray-300 bg-gray-300 dark:bg-white dark:text-black rounded-[2rem]"
          >
            <ArrowUpRight className="size-5 text-purple-400" />
            <p className="font-normal text-xs line-clamp-1">
              {content.attach_product.product.title}
            </p>
          </Badge>
        </div>
      )}
      {content.product_compare && (
        <div className="flex justify-end">
          <div className="max-w-[90%] my-1">
            <div className="flex flex-row gap-1">
              {content.product_compare.for.map((compare, index) => (
                <Badge
                  key={index}
                  variant={"secondary"}
                  className="text-xs flex items-center font-normal py-2 hover:bg-gray-300 bg-gray-300 dark:bg-white dark:text-black rounded-[2rem]"
                >
                  <ArrowUpRight className="size-4 mr-1 shrink-0 text-purple-500" />
                  <p className="line-clamp-1">{compare.title}</p>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
      {content.inquiry_response && (
        <div className="flex justify-end">
          {content.inquiry_response.skipped ? (
            <Badge
              variant={"secondary"}
              className="px-5 py-3 flex space-x-2 items-center hover:bg-gray-300 bg-gray-300 dark:bg-white dark:text-black rounded-[2rem]"
            >
              <ArrowUpRight className="size-5 text-purple-400" />
              <p className="font-normal text-xs line-clamp-1">
                Skip the inquiry
              </p>
            </Badge>
          ) : (
            <div className="flex flex-col">
              {content.inquiry_response.selected &&
                content.inquiry_response.selected.length > 0 && (
                  <div>
                    {content.inquiry_response.selected.map((option, index) => (
                      <Badge
                        key={index}
                        variant={"secondary"}
                        className="text-xs bg-gray-300 hover:bg-gray-300 dark:text-black rounded-3xl"
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                )}
              {content.inquiry_response.input && (
                <div>
                  <p className="text-sm">{content.inquiry_response.input}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {content.text_input && (
        <div className="flex justify-end">
          <div className="bg-[#343131] w-fit max-w-[90%] py-3 px-5 rounded-[2rem]">
            <div className="group relative">
              <Markdown className="whitespace-pre-wrap text-white">
                {content.text_input}
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
      )}
    </div>
  );
};
