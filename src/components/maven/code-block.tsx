"use client";

import { FC, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language: string;
  code: string;
  title?: string;
}

export const CodeBlock: FC<CodeBlockProps> = ({ language, code, title }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border bg-muted">
      {title && (
        <div className="flex items-center justify-between border-b bg-muted px-4 py-2">
          <div className="text-sm font-medium">{title}</div>
          <div className="flex items-center gap-1">
            <div className="text-xs text-muted-foreground">{language}</div>
          </div>
        </div>
      )}
      <div className="relative">
        <pre
          className={cn(
            "overflow-x-auto p-4 text-sm",
            !title && "rounded-t-lg"
          )}
        >
          <code>{code}</code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute right-2 top-2 rounded-md border bg-background p-1.5 text-muted-foreground hover:bg-muted-foreground/10"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};
