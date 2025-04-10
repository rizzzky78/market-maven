"use client";

import { RateLimitResponse, StreamGeneration, UIState } from "@/lib/types/ai";
import { generateId } from "ai";
import {
  readStreamableValue,
  useActions,
  useAIState,
  useUIState,
} from "ai/rsc";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  KeyboardEvent,
  FC,
  useCallback,
  useState,
} from "react";
import { UserMessage } from "./user-message";
import { AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowUp, Globe, ListEnd, Loader } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Textarea } from "../ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { QuickActionButton } from "./quick-action";
import { toast } from "sonner";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useDebounceInput } from "../hooks/use-debounced-input";
import { useMavenStateController } from "../hooks/maven-state-controller";
import { AttachProductBadge } from "./attach-product";
import { AI } from "@/app/action";
import { AttachCompareBadge } from "./attach-compare";
import { cn } from "@/lib/utils";
import { RateLimit } from "./rate-limit-modal";
import { checkRateLimit } from "@/lib/agents/action/chat-service/rate-limit";

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
  const [rateLimit, setRateLimit] = useState<RateLimitResponse | null>(null);

  const handleRemove = () => {
    setInput("");
    handleChange("");
    detach();
  };

  const actionSubmit = useCallback(async () => {
    try {
      setIsGenerating(true);

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

      const { id, display, generation } = await orchestrator(
        {
          textInput: value.length > 0 ? value : undefined,
          attachProduct: attachment,
          productCompare: activeComparison,
        },
        { onRequest: { search, related } }
      );

      setUIState((prevUI) => [...prevUI, { id, display }]);

      if (generation) {
        const gens = readStreamableValue(
          generation
        ) as AsyncIterable<StreamGeneration>;
        for await (const { loading } of gens) {
          setIsGenerating(loading);
        }
      }

      // Check rate limits before proceeding
      /** DISABLED FOR NOW */
      // const rateLimitStatus = await checkRateLimit(aiState);

      // console.log(rateLimitStatus);

      // setRateLimit(rateLimitStatus);

      // if (rateLimitStatus.eligible) {
      //   const { id, display, generation } = await orchestrator(
      //     {
      //       textInput: value.length > 0 ? value : undefined,
      //       attachProduct: attachment,
      //       productCompare: activeComparison,
      //     },
      //     { onRequest: { search, related } }
      //   );

      //   setUIState((prevUI) => [...prevUI, { id, display }]);

      //   if (generation) {
      //     const gens = readStreamableValue(
      //       generation
      //     ) as AsyncIterable<StreamGeneration>;
      //     for await (const { loading } of gens) {
      //       setIsGenerating(loading);
      //     }
      //   }
      // } else {
      //   /** Fallback to previous state */
      //   setUIState((prevUI) => prevUI.slice(0, -1));

      //   if (rateLimitStatus.reason === "RPD_LIMIT_EXCEEDED") {
      //     toast.error(
      //       `Daily request limit reached (${rateLimitStatus.limits.requestsPerDay} requests). Resets in ${rateLimitStatus.reset?.formatted}.`,
      //       {
      //         position: "top-center",
      //         richColors: true,
      //         duration: 5000,
      //         className:
      //           "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
      //       }
      //     );

      //     setIsGenerating(false);

      //     return;
      //   } else if (rateLimitStatus.reason === "CONVERSATION_LIMIT_EXCEEDED") {
      //     toast.error(
      //       `Conversation length limit reached (${rateLimitStatus.limits.conversationLength} messages). Please start a new conversation.`,
      //       {
      //         position: "top-center",
      //         richColors: true,
      //         duration: 5000,
      //         className:
      //           "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
      //       }
      //     );

      //     setIsGenerating(false);

      //     return;
      //   }
      // }
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
    }
  }, [
    activeComparison,
    attachment,
    flush,
    handleReset,
    orchestrator,
    related,
    search,
    setIsGenerating,
    setUIState,
    value,
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

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e.target.value);
  };

  const handleInputBlur = () => {
    handleBlur();
  };

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

  return (
    <div className="w-full">
      <div className={`w-full flex justify-center z-20 bg-background`}>
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
                onChange={handleInputChange}
                onBlur={handleInputBlur}
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
              </div>
              <div className="flex items-center space-x-2">
                {/* {rateLimit && <RateLimit data={rateLimit} />} */}
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"secondary"}
                        size={"icon"}
                        className="dark:text-white rounded-full bg-muted/10 dark:bg-muted hover:bg-purple-500/50 dark:hover:bg-purple-500/50"
                        type={"submit"}
                        disabled={isButtonDisabled}
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
