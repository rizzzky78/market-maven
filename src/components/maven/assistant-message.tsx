"use client";

import { FC, useEffect, useState } from "react";
import { Markdown } from "./markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Check, Copy } from "lucide-react";
import { StreamableValue, useStreamableValue } from "ai/rsc";
import { ErrorMessage } from "./error-message";
import { useScreenSize } from "../hooks/use-screen-size";

interface MessageProps {
  content: string;
}

export const AssistantMessage: FC<MessageProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const { breakpoint } = useScreenSize();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="flex justify-start mb-5">
        <div className="w-full py-3 px-5 rounded-[2rem]">
          <div className="group relative">
            <Markdown className="selection:bg-purple-200 selection:text-black">
              {content}
            </Markdown>
            {breakpoint === "default" ? (
              <Button
                variant="ghost"
                className="absolute rounded-full text-white h-8 w-1 -bottom-10 left-0 bg-[#1A1A1D]"
                onClick={copyToClipboard}
              >
                {copied ? <Check /> : <Copy />}
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute rounded-full text-white h-8 w-1 -bottom-8 left-3 bg-[#1A1A1D] opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check /> : <Copy />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="rounded-3xl">
                    <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StreamMessageProps {
  content: StreamableValue<string>;
}

export const StreamAssistantMessage: FC<StreamMessageProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const { breakpoint } = useScreenSize();

  const [data, error] = useStreamableValue(content);
  const [contentText, setContentText] = useState<string>("");

  useEffect(() => {
    if (data) setContentText(data);
  }, [data]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <ErrorMessage
        errorName="Stream Text Error"
        reason="An Error occured when streaming the text value. This error are occur in server."
      />
    );
  }

  return (
    <div className="flex justify-start mb-4 py-5">
      <div className="w-full py-3 px-5 rounded-[2rem]">
        <div className="group relative">
          <Markdown className="selection:bg-purple-200 selection:text-black">
            {contentText}
          </Markdown>
          {breakpoint === "default" ? (
            <Button
              variant="ghost"
              className="absolute rounded-full text-white h-8 w-1 -bottom-10 left-0 bg-[#1A1A1D]"
              onClick={copyToClipboard}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute rounded-full text-white h-8 w-1 -bottom-8 left-3 bg-[#1A1A1D] opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check /> : <Copy />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-3xl">
                  <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};
