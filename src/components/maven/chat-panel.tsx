"use client";

import {
  RateLimitResponse,
  RefferenceDataSource,
  StreamGeneration,
  UIState,
} from "@/lib/types/ai";
import { generateId } from "ai";
import {
  readStreamableValue,
  useActions,
  useAIState,
  useUIState,
} from "ai/rsc";
import {
  FormEvent,
  useEffect,
  useRef,
  KeyboardEvent,
  FC,
  useCallback,
  useState,
} from "react";
import { UserMessage } from "@/components/maven/user-message";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  Globe,
  Info,
  ListEnd,
  Loader,
  RefreshCcwDot,
  TextSearch,
} from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
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
import { AI } from "@/app/action";
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
  uiState: UIState;
}

export const ChatPanel: FC<ChatPanelProps> = ({ uiState }) => {
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
        500
      )}px`;
    }
  }, [value]);

  const [, setUIState] = useUIState<typeof AI>();
  const [aiState] = useAIState<typeof AI>();
  const { orchestrator } = useActions<typeof AI>();
  const { isGenerating, setIsGenerating } = useAppState();

  const [stageProcess, setStageProcess] = useState<string>("");

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

      console.log(rateLimitStatus);

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

      const componentId = generateId();

      setUIState((prevUI) => [
        ...prevUI,
        {
          id: generateId(),
          display: (
            <UserMessage
              key={componentId}
              content={{
                text_input: value,
                attach_product: attachment,
                product_compare: activeComparison,
              }}
            />
          ),
        },
      ]);

      // Process the message
      const { id, display, generation } = await orchestrator(
        {
          textInput: value.length > 0 ? value : undefined,
          attachProduct: attachment,
          productCompare: activeComparison,
        },
        { onRequest: { search, related, reffSource } }
      );

      setUIState((prevUI) => [...prevUI, { id, display }]);

      if (generation) {
        const gens = readStreamableValue(
          generation
        ) as AsyncIterable<StreamGeneration>;
        for await (const { loading, process } of gens) {
          setIsGenerating(loading);
          setStageProcess(process);
        }
      }

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
      /** Fallback to previous state */
      setUIState((prevUI) => prevUI.slice(0, -1));
      console.error("An Error occured when submitting the query!", error);
      toast.error("Error When Submitting the Query!", {
        position: "top-center",
        richColors: true,
        className:
          "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
      });
    } finally {
      setIsGenerating(false);
      setIsCheckingRateLimit(false);
    }
  }, [
    activeComparison,
    attachment,
    flush,
    handleReset,
    orchestrator,
    rateLimit,
    reffSource,
    related,
    search,
    setIsGenerating,
    setUIState,
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
      : uiState.length === 0
      ? "What would you like to search for?"
      : "Ask a follow-up question";

  const reffSourceOption = [
    {
      title: "Insight",
      src: "/platform/insight.png",
      description:
        "Use internal search references without information from online marketplace platform (LLM plus API data sources), only display exact product without any variants.",
    },
    {
      title: "Tokopedia",
      src: "/platform/tokopedia.png",
      description:
        "Use Tokpedia platform as the data source, will gives exact information data as is on platform as well as products that match the query.",
    },
    {
      title: "Shopee",
      src: "/platform/shopee.jpeg",
      description:
        "Unlike Tokopedia, this will behave as Insight but with product links reference that match the query and not get any related data from Shopee platform.",
    },
  ];

  return (
    <div
      className="w-full *:font-[family-name:var(--font-satoshi)] z-[50]"
      data-testid="chat-panel"
    >
      <div className={`w-full flex justify-center bg-background`}>
        <div className="w-full md:px-0 lg:px-0 max-w-2xl flex flex-col pb-4 mb-0 rounded-t-3xl">
          {uiState.length === 0 && <QuickActionButton />}
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
          <form
            onSubmit={handleSubmit}
            className="relative w-full rounded-3xl bg-[#1A1A1D] flex flex-col px-2 pt-2 h-full"
          >
            <ScrollArea className="w-full mb-1 bg-[#1A1A1D] rounded-none max-h-[500px] overflow-x-auto">
              <Textarea
                ref={textareaRef}
                name="text_input"
                className="resize-none text-white/90 active:bg-[#1A1A1D] rounded-none active:border-transparent w-full border-transparent focus:border-none hover:border-none text-sm overflow-hidden"
                placeholder={dynamicPlaceholder}
                spellCheck={true}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeydown}
              />
            </ScrollArea>
            <div className="flex justify-between px-1 pb-3 -mt-1">
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"outline"}
                        type={"button"}
                        className={cn(
                          "rounded-full",
                          search
                            ? " bg-purple-500/60 border-none hover:bg-white/10 *:text-white"
                            : "bg-[#1A1A1D]/90 border-white/10 *:hover:text-purple-500 hover:bg-transparent text-white/90"
                        )}
                        disabled={isGenerating}
                        onClick={() => setSearch(!search)}
                        data-testid="search-button"
                      >
                        <Globe className="h-6 w-6 shrink-0" />
                        <span className="text-xs font-normal">Search</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-xl max-w-sm">
                      <p>
                        Enhance answers by allowing models to retrieve
                        additional data from external sources. Using search may
                        extend response time and provide insights beyond the
                        displayed data.
                        {search && (
                          <span className="ml-1 font-semibold">
                            Search is enabled.
                          </span>
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"outline"}
                        type={"button"}
                        className={cn(
                          "rounded-full",
                          related
                            ? " bg-purple-500/60 border-none hover:bg-white/10 *:text-white"
                            : "bg-[#1A1A1D]/90 border-white/10 *:hover:text-purple-500 hover:bg-transparent text-white/90"
                        )}
                        disabled={isGenerating}
                        onClick={() => setRelated(!related)}
                        data-testid="related-button"
                      >
                        <ListEnd className="h-6 w-6 shrink-0 hover:text-purple-200" />{" "}
                        <span className="text-xs font-normal">Related</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-xl max-w-sm">
                      <p>
                        Enable related queries using the latest conversation
                        data. These suggestions offer users the most relevant
                        follow-up questions that align with the agent&apos;s
                        capabilities.
                        {related && (
                          <span className="ml-1 font-semibold">
                            Related query is enabled.
                          </span>
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select
                  value={reffSource}
                  onValueChange={(value: RefferenceDataSource) =>
                    setReffSource(value)
                  }
                >
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <SelectTrigger
                          className="border border-white/10 bg-transparent text-white shadow-sm rounded-full text-xs space-x-2 *:hover:text-purple-500"
                          data-testid="source-select"
                        >
                          <SelectValue
                            placeholder="Select source"
                            className="capitalize *:text-xs md:text-xs"
                          />
                        </SelectTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-xl max-w-sm">
                        <div className="flex flex-col">
                          <p className="mb-2">
                            Prefer to use insight or from related marketplace
                            information references
                          </p>
                          <div className="space-y-2">
                            {reffSourceOption.map((item, index) => (
                              <div
                                key={index}
                                className={`rounded-lg p-2 flex items-center space-x-2 lg:space-x-3 bg-purple-500/20`}
                              >
                                <Image
                                  src={item.src}
                                  alt={item.title}
                                  width={40}
                                  height={40}
                                  className="object-contain"
                                />
                                <p>
                                  <span className="font-semibold">
                                    {item.title}
                                  </span>
                                  , {item.description}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 font-semibold flex items-start space-x-1">
                            <Info className="size-4" />
                            <p>
                              This feature is not implemented yet, its still use
                              Tokopedia as data source.
                            </p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <SelectContent className="rounded-[20px]">
                    {reffSourceOption.map((option) => (
                      <SelectItem
                        key={option.title}
                        value={option.title.toLowerCase()}
                        className="rounded-full *:hover:text-purple-500"
                      >
                        <div className="flex items-center space-x-2">
                          <TextSearch className="size-4 shrink-0" />
                          <span>{option.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                {isGenerating && (
                  <div className="hidden md:block">
                    <div className="border rounded-full h-9 px-4 flex items-center space-x-2">
                      <RefreshCcwDot className="size-4 animate-[spin_2s_linear_infinite_reverse]" />
                      <p className="capitalize text-xs text-white">
                        {stageProcess}
                      </p>
                    </div>
                  </div>
                )}
                {rateLimit && (
                  <RateLimit
                    data={rateLimit}
                    isCheckingRateLimit={isCheckingRateLimit}
                  />
                )}
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"secondary"}
                        size={"icon"}
                        className="dark:text-white rounded-full bg-muted/10 dark:bg-muted hover:bg-purple-500/50 dark:hover:bg-purple-500/50"
                        type={"submit"}
                        disabled={isButtonDisabled}
                        data-testid="send-button"
                      >
                        {isGenerating ? (
                          <Loader className="h-6 w-6 text-white animate-spin" />
                        ) : (
                          <ArrowUp className="size-10 text-white shrink-0" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-3xl">
                      <p>Send message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
