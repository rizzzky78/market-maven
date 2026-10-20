"use client";

import { FC, useEffect, useState } from "react";
import { Markdown } from "./markdown";
import { Button } from "../ui/button";
import { Check, Copy } from "lucide-react";
import { StreamableValue, useStreamableValue } from "@ai-sdk/rsc";
import { ErrorMessage } from "./error-message";

const MessageBody: FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group w-full">
      <Markdown className="selection:bg-brand/20">{text}</Markdown>
      {text && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 -ml-2 h-7 gap-1.5 px-2 text-xs text-muted-foreground transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
          onClick={copyToClipboard}
          aria-label="Copy response"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      )}
    </div>
  );
};

interface MessageProps {
  content: string;
}

export const AssistantMessage: FC<MessageProps> = ({ content }) => {
  return <MessageBody text={content} />;
};

interface StreamMessageProps {
  content: StreamableValue<string>;
}

export const StreamAssistantMessage: FC<StreamMessageProps> = ({ content }) => {
  const [data, error] = useStreamableValue(content);
  const [contentText, setContentText] = useState<string>("");

  useEffect(() => {
    if (data) setContentText(data);
  }, [data]);

  if (error) {
    return (
      <ErrorMessage
        errorName="Couldn't finish the response"
        reason="The answer stopped streaming because of a server error. Try sending your message again."
      />
    );
  }

  return <MessageBody text={contentText} />;
};
