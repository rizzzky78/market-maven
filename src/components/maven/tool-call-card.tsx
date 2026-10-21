import { FC } from "react";
import {
  CircleAlert,
  CircleCheck,
  CircleSlash,
  FileText,
  Globe,
  Loader,
  LucideIcon,
  MessageCircleQuestion,
  Scale,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToolCallInfo, ToolCallStatus } from "@/lib/types/ai";
import { cn } from "@/lib/utils";

type Described = { summary?: string; chips: string[] };

const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const list = (value: unknown) =>
  Array.isArray(value) ? value.filter((v): v is string => !!text(v)) : [];

/** What each tool is called in the chat and which inputs summarise a call. */
const TOOLS: Record<
  string,
  { label: string; icon: LucideIcon; describe: (input: any) => Described }
> = {
  searchProduct: {
    label: "Product search",
    icon: Search,
    describe: (input) => ({ summary: text(input?.query), chips: [] }),
  },
  getProductDetails: {
    label: "Product details",
    icon: FileText,
    describe: (input) => ({
      summary: text(input?.query),
      chips: list([input?.source]),
    }),
  },
  productsComparison: {
    label: "Comparison",
    icon: Scale,
    describe: (input) => ({
      summary: list(
        Array.isArray(input?.compare)
          ? input.compare.map((c: { title?: unknown }) => c?.title)
          : []
      ).join(" vs "),
      chips: [],
    }),
  },
  recommendator: {
    label: "Recommendations",
    icon: Sparkles,
    describe: (input) => ({
      summary: text(input?.intent),
      chips: list(input?.scope),
    }),
  },
  webResearch: {
    label: "Web research",
    icon: Globe,
    describe: (input) => ({
      summary: text(input?.question),
      chips: list(input?.products),
    }),
  },
  inquireUser: {
    label: "Clarifying question",
    icon: MessageCircleQuestion,
    describe: (input) => ({
      summary: text(input?.purpose),
      chips: list(input?.scope),
    }),
  },
};

const STATUS: Record<
  ToolCallStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  running: {
    label: "Running",
    icon: Loader,
    className: "text-muted-foreground [&_svg]:animate-spin",
  },
  done: {
    label: "Done",
    icon: CircleCheck,
    className: "text-emerald-600 dark:text-emerald-400",
  },
  error: { label: "Failed", icon: CircleAlert, className: "text-destructive" },
  stopped: {
    label: "Stopped",
    icon: CircleSlash,
    className: "text-muted-foreground",
  },
};

const formatDuration = (ms: number) =>
  ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;

/**
 * One tool call of the assistant: which tool ran, the inputs it ran with, its
 * status and how long it took. The full input is behind a disclosure.
 */
export const ToolCallCard: FC<ToolCallInfo> = ({
  name,
  input,
  status,
  durationMs,
}) => {
  const tool = TOOLS[name] ?? {
    label: name,
    icon: Wrench,
    describe: () => ({ chips: [] }),
  };
  const { summary, chips } = tool.describe(input);
  const state = STATUS[status];
  const Icon = tool.icon;
  const StatusIcon = state.icon;

  return (
    <div
      className="flex w-full items-start gap-3 rounded-xl border bg-card px-3 py-2.5 text-sm"
      data-testid="tool-call"
      data-tool={name}
      data-status={status}
    >
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-brand" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{tool.label}</span>
          <span
            className={cn("flex items-center gap-1 text-xs", state.className)}
            role={status === "running" ? "status" : undefined}
          >
            <StatusIcon className="size-3.5" aria-hidden />
            {state.label}
          </span>
          {durationMs !== undefined && (
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {formatDuration(durationMs)}
            </span>
          )}
        </div>
        {summary && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {summary}
          </p>
        )}
        {chips.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {chips.map((chip) => (
              <Badge
                key={chip}
                variant="outline"
                className="rounded-full px-2 py-0 text-[11px] font-normal"
              >
                {chip}
              </Badge>
            ))}
          </div>
        )}
        {input !== undefined && (
          <details className="group mt-1.5 text-xs">
            <summary className="w-fit cursor-pointer list-none text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
              <span className="group-open:hidden">Show input</span>
              <span className="hidden group-open:inline">Hide input</span>
            </summary>
            <pre className="mt-1.5 max-h-48 overflow-auto rounded-lg bg-muted p-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all">
              {JSON.stringify(input, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

const STAGE_HEAD: Record<string, string> = {
  api: "Fetching live data",
  database: "Working with saved data",
  stream: "Generating",
  tool: "Running tool",
};

const STAGE_SUB: Record<string, string> = {
  initial: "starting",
  "requesting-data": "requesting",
  generating: "writing",
  success: "received",
  done: "finishing",
  "save-state": "saving",
  "not-found": "nothing found",
  error: "hit an error",
  "partial-done": "partly done",
  "next-action": "next step",
  "fatal-error": "failed",
};

/** Readable label for a generation `process` such as `stream:generating`. */
export const describeStage = (process: string) => {
  const [head, sub] = process.split(":");
  const label = STAGE_HEAD[head];
  return label ? `${label} · ${STAGE_SUB[sub] ?? sub}` : process;
};
