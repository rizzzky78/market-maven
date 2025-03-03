"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language: string;
  code: string;
  title?: string;
  className?: string;
}

export function CodeBlock({
  language,
  code,
  title,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative rounded-lg overflow-hidden my-4", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 text-zinc-400 text-sm">
        <div className="flex items-center gap-2">
          {title && <span className="font-medium text-white">{title}</span>}
          {title && <span className="text-zinc-500">|</span>}
          <span className="font-mono">{language}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 hover:text-white transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        showLineNumbers
        customStyle={{
          margin: 0,
          borderRadius: "0 0 0.5rem 0.5rem",
          fontSize: "14px",
        }}
        lineNumberStyle={{
          minWidth: "2.5em",
          paddingRight: "1em",
          textAlign: "right",
          color: "rgba(156, 163, 175, 0.5)",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
