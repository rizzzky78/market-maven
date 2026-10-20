import React, { FC, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { SquareArrowOutUpRight } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  children: string;
  className?: string;
}

export const PureMarkdown: FC<MarkdownProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none",
        "prose-headings:mb-4 prose-headings:font-semibold",
        "prose-p:leading-7",
        "prose-pre:p-0 prose-pre:bg-transparent",
        "prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-muted",
        "prose-img:rounded-lg",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1
              className={cn(
                "scroll-m-20 text-sm font-bold tracking-tight mb-4",
                className
              )}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={cn(
                "scroll-m-20 text-sm font-semibold tracking-tight mb-3",
                className
              )}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={cn(
                "scroll-m-20 text-sm font-semibold tracking-tight mb-2",
                className
              )}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4
              className={cn(
                "scroll-m-20 text-sm font-semibold tracking-tight mb-2",
                className
              )}
            >
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p
              className={cn(
                "text-sm leading-7 not-first:mt-4",
                className
              )}
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={cn("my-4 ml-6 list-disc [&>li]:mt-2", className)}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={cn("my-4 ml-6 list-decimal [&>li]:mt-2", className)}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={cn("text-sm leading-7", className)}>{children}</li>
          ),
          table({ children }) {
            return (
              <div className={cn("my-2 w-full overflow-y-auto", className)}>
                <table className="w-full border-collapse border border-border">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead
                className={cn(
                  "text-xs bg-muted border-border",
                  className
                )}
              >
                {children}
              </thead>
            );
          },
          tr({ children }) {
            return (
              <tr
                className={cn(
                  "border-b text-xs border-border",
                  className
                )}
              >
                {children}
              </tr>
            );
          },
          th({ children }) {
            return (
              <th
                className={cn(
                  "border text-xs border-border px-4 py-2 text-left font-semibold",
                  className
                )}
              >
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td
                className={cn(
                  "border text-xs border-border px-4 py-2",
                  className
                )}
              >
                {children}
              </td>
            );
          },
          blockquote: ({ children }) => (
            <blockquote
              className={cn(
                "mt-4 border-l-2 text-sm border-border pl-4 italic text-muted-foreground",
                className
              )}
            >
              {children}
            </blockquote>
          ),
          a({ children, href }) {
            if (!href) return <>{children}</>;

            return (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <a
                      href={href}
                      className={cn(
                        "inline-flex text-sm items-center gap-1 text-blue-600 dark:text-blue-400 underline-offset-2 hover:underline",
                        className
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {new URL(href).hostname}
                      <SquareArrowOutUpRight className="h-3 w-3" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="rounded-3xl max-w-[340px] pl-5"
                  >
                    <p className="line-clamp-1">{href}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  PureMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);
