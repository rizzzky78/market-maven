"use client";

import { RateLimitResponse, RefferenceDataSource } from "@/lib/types/ai";
import {
  FormEvent,
  useEffect,
  useRef,
  KeyboardEvent,
  FC,
  useCallback,
  useState,
} from "react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Globe, ListEnd, Square } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuickActionButton } from "@/components/maven/quick-action";
import { toast } from "sonner";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useDebounceInput } from "@/components/hooks/use-debounced-input";
import { useMavenStateController } from "@/components/hooks/maven-state-controller";
import { AttachProductBadge } from "@/components/maven/attach-product";
import { useMavenChat } from "@/lib/utility/provider/chat-provider";
import { AttachCompareBadge } from "@/components/maven/attach-compare";
import { cn } from "@/lib/utils";
import { RateLimit } from "@/components/maven/rate-limit-modal";
import {
  checkRateLimit,
  recordSuccessfulRequest,
} from "@/lib/agents/action/chat-service/rate-limit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface ChatPanelProps {
  /** Whether the chat has no messages yet */
  isEmpty: boolean;
}

export const ChatPanel: FC<ChatPanelProps> = ({ isEmpty }) => {
  const {
    input,
    attachment,
    setInput,
    detach,
    flush,
    removeFromComparison,
    activeComparison,
    search,
    related,
    setSearch,
    setRelated,
    reffSource,
    setReffSource,
  } = useMavenStateController();
  const { value, handleChange, handleBlur, handleReset } = useDebounceInput();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (input) handleChange(input);
  }, [handleChange, input]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        240
      )}px`;
    }
  }, [value]);

  const { aiState, submit, stop, stage: stageProcess } = useMavenChat();
  const { isGenerating, setIsGenerating } = useAppState();

  const [rateLimit, setRateLimit] = useState<RateLimitResponse | null>(null);
  const [isCheckingRateLimit, setIsCheckingRateLimit] = useState(false);

  const handleRemove = () => {
    setInput("");
    handleChange("");
    detach();
  };

  // Pre-fetch rate limit status when component mounts or after messages are added
  useEffect(() => {
    const fetchRateLimitStatus = async () => {
      try {
        if (aiState) {
          const status = await checkRateLimit(aiState);
          setRateLimit(status);
        }
      } catch (error) {
        console.error("Failed to pre-fetch rate limit status:", error);
      }
    };

    fetchRateLimitStatus();
  }, [aiState?.messages.length, aiState]);

  const actionSubmit = useCallback(async () => {
    try {
      setIsGenerating(true);
      setIsCheckingRateLimit(true);

      // Check rate limits before attempting to send a message
      let rateLimitStatus = rateLimit;

      // Only fetch fresh rate limit data if we don't have it or it's potentially stale
      if (!rateLimitStatus) {
        rateLimitStatus = await checkRateLimit(aiState);
        setRateLimit(rateLimitStatus);
      }

      setIsCheckingRateLimit(false);

      // If user is not eligible, show error message and return early
      if (!rateLimitStatus.eligible) {
        if (rateLimitStatus.reason === "RPD_LIMIT_EXCEEDED") {
          toast.error(
            `Daily request limit reached (${rateLimitStatus.limits.requestsPerDay} requests). Resets in ${rateLimitStatus.reset?.formatted}.`,
            {
              position: "top-center",
              richColors: true,
              duration: 5000,
              className:
                "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
            }
          );
        } else if (rateLimitStatus.reason === "CONVERSATION_LIMIT_EXCEEDED") {
          toast.error(
            `Conversation length limit reached (${rateLimitStatus.limits.conversationLength} messages). Please start a new conversation.`,
            {
              position: "top-center",
              richColors: true,
              duration: 5000,
              className:
                "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
            }
          );
        }
        setIsGenerating(false);
        return;
      }

      // User is eligible, proceed with the message
      flush();
      handleReset();

      // Resolves once the reply has finished streaming
      await submit({
        textInput: value.length > 0 ? value : undefined,
        attachProduct: attachment,
        productCompare: activeComparison,
      });

      // Record the successful request asynchronously
      recordSuccessfulRequest(aiState).catch((error) => {
        console.error("Failed to record successful request:", error);
      });

      // Update rate limit cache after successful request
      setTimeout(async () => {
        try {
          const updatedStatus = await checkRateLimit(aiState);
          setRateLimit(updatedStatus);
        } catch (error) {
          console.error("Failed to update rate limit status:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("An Error occured when submitting the query!", error);
      toast.error("Error When Submitting the Query!", {
        position: "top-center",
        richColors: true,
        className:
          "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
      });
    } finally {
      setIsCheckingRateLimit(false);
    }
  }, [
    activeComparison,
    attachment,
    flush,
    handleReset,
    submit,
    rateLimit,
    setIsGenerating,
    value,
    aiState,
  ]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (isGenerating) return;

      await actionSubmit();
    },
    [actionSubmit, isGenerating]
  );

  const invalidComparison = activeComparison
    ? activeComparison.for.length === 1
      ? true
      : false
    : false;

  const isButtonDisabled =
    isGenerating || value.length === 0 || invalidComparison;

  const handleKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (value.trim().length === 0) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const t = e.target as HTMLTextAreaElement;
      t.form?.requestSubmit();
    }
  };

  const dynamicPlaceholder =
    attachment !== undefined
      ? "Ask a question about this product"
      : activeComparison?.for.length
      ? "What interests you about this comparison?"
      : isEmpty
      ? "What would you like to search for?"
      : "Ask a follow-up question";

  const reffSourceOption = [
    {
      title: "Insight",
      src: "/platform/insight.png",
      description: "Exact matches from across the web, global store links",
    },
    {
      title: "Tokopedia",
      src: "/platform/tokopedia.png",
      description: "Live Tokopedia listings, may include near matches",
    },
    {
      title: "Shopee",
      src: "/platform/shopee.jpeg",
      description: "Web search focused on Indonesian sellers",
    },
  ];

  const toggleClass = (active: boolean) =>
    cn(
      "h-8 gap-1.5 rounded-full px-2.5 text-xs font-normal shadow-none sm:px-3",
      active
        ? "border-brand/40 bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
        : "bg-transparent text-muted-foreground"
    );

  return (
    <div className="w-full pb-3 md:pb-4" data-testid="chat-panel">
      {isEmpty && <QuickActionButton />}
      <AnimatePresence mode="sync">
        {attachment && (
          <AttachProductBadge
            attach={attachment.product}
            onRemove={handleRemove}
            onSubmit={actionSubmit}
          />
        )}
        {activeComparison && activeComparison.for.length > 0 && (
          <AttachCompareBadge
            compare={activeComparison}
            onRemove={removeFromComparison}
            onSubmit={actionSubmit}
          />
        )}
      </AnimatePresence>
      {isGenerating && stageProcess && (
        <p
          className="mb-2 flex items-center gap-2 px-1 text-xs text-muted-foreground"
          aria-live="polite"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-brand" />
          <span className="first-letter:uppercase">{stageProcess}</span>
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col rounded-2xl border bg-card shadow-sm transition-shadow focus-within:border-ring/50 focus-within:ring-3 focus-within:ring-ring/15"
      >
        <label htmlFor="text_input" className="sr-only">
          Message Maven
        </label>
        <Textarea
          id="text_input"
          ref={textareaRef}
          name="text_input"
          rows={1}
          className="max-h-60 min-h-14 resize-none overflow-y-auto border-0 bg-transparent px-4 pt-4 pb-2 shadow-none focus-visible:ring-0 dark:bg-transparent"
          placeholder={dynamicPlaceholder}
          spellCheck={true}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeydown}
        />
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant={"outline"}
                    type={"button"}
                    className={toggleClass(search)}
                    disabled={isGenerating}
                    onClick={() => setSearch(!search)}
                    aria-pressed={search}
                    aria-label="Web search"
                    data-testid="search-button"
                  >
                    <Globe className="size-4" />
                    <span className="hidden sm:inline">Search</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Let Maven pull extra data from the web. Answers get richer
                    but take a bit longer.
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant={"outline"}
                    type={"button"}
                    className={toggleClass(related)}
                    disabled={isGenerating}
                    onClick={() => setRelated(!related)}
                    aria-pressed={related}
                    aria-label="Suggest follow-up questions"
                    data-testid="related-button"
                  >
                    <ListEnd className="size-4" />
                    <span className="hidden sm:inline">Related</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Suggest follow-up questions after each answer.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={reffSource}
              onValueChange={(value: RefferenceDataSource) =>
                setReffSource(value)
              }
            >
              <SelectTrigger
                className="h-8 min-w-0 gap-1.5 rounded-full bg-transparent px-2.5 text-xs text-muted-foreground shadow-none sm:px-3 [&_[data-desc]]:hidden [&_img]:size-4"
                aria-label="Data source"
                data-testid="source-select"
              >
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent align="start" className="w-72">
                {reffSourceOption.map((option) => (
                  <SelectItem
                    key={option.title}
                    value={option.title.toLowerCase()}
                    className="py-2"
                  >
                    <span className="flex items-center gap-2.5">
                      <Image
                        src={option.src}
                        alt=""
                        width={20}
                        height={20}
                        className="size-5 shrink-0 rounded-sm bg-white object-contain p-px"
                      />
                      <span className="flex flex-col">
                        <span>{option.title}</span>
                        <span
                          data-desc
                          className="text-xs text-muted-foreground"
                        >
                          {option.description}
                        </span>
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {rateLimit && (
              <RateLimit
                data={rateLimit}
                isCheckingRateLimit={isCheckingRateLimit}
              />
            )}
            {isGenerating ? (
              <Button
                key="stop"
                size={"icon"}
                className="size-8 rounded-full"
                type={"button"}
                onClick={() => stop()}
                aria-label="Stop generating"
                data-testid="stop-button"
              >
                <Square className="size-3 fill-current" />
              </Button>
            ) : (
              <Button
                key="send"
                size={"icon"}
                className="size-8 rounded-full"
                type={"submit"}
                disabled={isButtonDisabled}
                aria-label="Send message"
                data-testid="send-button"
              >
                <ArrowUp className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
      <p className="mt-2 hidden text-center text-[11px] text-muted-foreground md:block">
        Enter to send · Shift + Enter for a new line · Prices and stock can
        change, check the store before buying
      </p>
    </div>
  );
};
