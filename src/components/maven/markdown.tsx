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
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ children }) => (
          <h1 className="scroll-m-20 text-sm font-bold tracking-tight mb-4">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="scroll-m-20 text-sm font-semibold tracking-tight mb-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="scroll-m-20 text-sm font-semibold tracking-tight mb-2">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="scroll-m-20 text-sm font-semibold tracking-tight mb-2">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-7 [&:not(:first-child)]:mt-4">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="my-4 ml-6 list-disc [&>li]:mt-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-4 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
        ),
        li: ({ children }) => <li className="text-sm leading-7">{children}</li>,
        table({ children }) {
          return (
            <div className="my-6 w-full overflow-y-auto">
              <table className="w-full border-collapse border border-gray-700">
                {children}
              </table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-gray-800">{children}</thead>;
        },
        tr({ children }) {
          return <tr className="border-b border-gray-700">{children}</tr>;
        },
        th({ children }) {
          return (
            <th className="border border-gray-700 px-4 py-2 text-left font-semibold">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border border-gray-700 px-4 py-2">{children}</td>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="mt-4 border-l-4 border-gray-700 pl-4 italic">
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
                    className="inline-flex text-sm items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
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
      className={cn(
        "prose prose-invert max-w-none",
        "prose-headings:mb-4 prose-headings:font-semibold",
        "prose-p:leading-7",
        "prose-pre:p-0 prose-pre:bg-transparent",
        "prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-gray-800",
        "prose-img:rounded-lg",
        className
      )}
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  PureMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);
