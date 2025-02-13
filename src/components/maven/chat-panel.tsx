"use client";

import { StreamGeneration, UIState } from "@/lib/types/ai";
import { generateId } from "ai";
import { readStreamableValue, useActions, useUIState } from "ai/rsc";
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
import { useSmartTextarea } from "../hooks/use-smart-textare";
import { AttachProductBadge } from "./attach-product";
import { AI } from "@/app/action";
import { AttachCompareBadge } from "./attach-compare";
import { cn } from "@/lib/utils";

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
  } = useSmartTextarea();
  const { value, handleChange, handleBlur, handleReset } = useDebounceInput();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [search, enableSearch] = useState(false);
  const [related, enableRelated] = useState(false);

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
  const { orchestrator } = useActions<typeof AI>();
  const { isGenerating, setIsGenerating } = useAppState();

  const handleRemove = () => {
    setInput("");
    handleChange("");
    detach();
  };

  const handleError = (error: unknown) => {
    console.error("An Error occured when submitting the query!", error);
    toast.error("Error When Submitting the Query!", {
      position: "top-center",
      richColors: true,
      className:
        "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
    });
  };

  const actionSubmit = useCallback(async () => {
    try {
      setIsGenerating(true);

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

      flush();
      handleReset();

      const { id, display, generation } = await orchestrator({
        textInput: value.length > 0 ? value : undefined,
        attachProduct: attachment,
        productCompare: activeComparison,
      });

      setUIState((prevUI) => [...prevUI, { id, display }]);

      if (generation) {
        const gens = readStreamableValue(
          generation
        ) as AsyncIterable<StreamGeneration>;
        for await (const { process, loading, error } of gens) {
          setIsGenerating(loading);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      // router.refresh();
      setIsGenerating(false);
    }
  }, [
    activeComparison,
    attachment,
    flush,
    handleReset,
    orchestrator,
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

  return (
    <div className="">
      <div className={`w-full shrink-0 flex justify-center z-20 bg-background`}>
        <div className="w-full md:px-0 lg:px-0 max-w-[468px] md:max-w-[500px] lg:max-w-2xl flex flex-col pb-4 mb-0 rounded-t-3xl">
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
            className="relative w-full rounded-3xl bg-purple-200 dark:bg-muted flex flex-col px-2 pt-2 h-full"
          >
            <ScrollArea className="w-full rounded-none max-h-[500px] overflow-x-auto">
              <Textarea
                ref={textareaRef}
                name="text_input"
                className="resize-none active:border-transparent w-full border-transparent focus:border-none hover:border-none text-sm overflow-hidden"
                placeholder={
                  uiState.length
                    ? "Reply an follow up question"
                    : "What stuff are you wanted to search for?"
                }
                spellCheck={true}
                value={value}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeydown}
              />
            </ScrollArea>
            <div className="flex justify-between px-1 pb-3 -mt-1">
              <div className="flex items-center space-x-1">
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        type={"button"}
                        className={cn(
                          "dark:text-white rounded-full",
                          search
                            ? "bg-[#1A1A1D] dark:hover:bg-muted hover:bg-[#1A1A1D]/90"
                            : "*:hover:text-purple-500 *:dark:hover:text-purple-200 hover:bg-transparent text-[#4A4947] bg-transparent"
                        )}
                        disabled={isGenerating}
                        onClick={() => enableSearch((prev) => !prev)}
                      >
                        <Globe className="h-6 w-6 hover:text-purple-200 shrink-0" />
                        <span className="text-xs font-normal">Search</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-xl">
                      <p>
                        Reinforce answer by allowing models to get additional
                        data from external sources.
                        {search && (
                          <span>
                            <br />
                            When using the search, final response maybe
                            different from displayed data.
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
                        type={"button"}
                        className={cn(
                          "dark:text-white rounded-full",
                          related
                            ? "bg-[#1A1A1D] dark:hover:bg-muted hover:bg-[#1A1A1D]/90"
                            : "*:hover:text-purple-500 *:dark:hover:text-purple-200 hover:bg-transparent text-[#4A4947] bg-transparent"
                        )}
                        disabled={isGenerating}
                        onClick={() => enableRelated((prev) => !prev)}
                      >
                        <ListEnd className="h-6 w-6 shrink-0 hover:text-purple-200" />{" "}
                        <span className="text-xs font-normal">Related</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-3xl">
                      <p>
                        Enable related query based on latest data conversation
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="">
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"secondary"}
                        size={"icon"}
                        className="dark:text-white rounded-full bg-[#1A1A1D] dark:hover:bg-muted hover:bg-[#1A1A1D]/90"
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
