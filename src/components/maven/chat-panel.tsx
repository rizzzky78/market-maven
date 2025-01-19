"use client";

import { UIState } from "@/lib/types/ai";
import { generateId } from "ai";
import { useActions, useUIState } from "ai/rsc";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useId,
  useRef,
  KeyboardEvent,
  FC,
} from "react";
import { UserMessage } from "./user-message";
import { AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import {
  BarChartIcon as ChartNoAxesCombined,
  CircleArrowUp,
  ImageIcon,
  Loader,
  Paperclip,
} from "lucide-react";
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
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useDebounceInput } from "../hooks/use-debounced-input";
import { useSmartTextarea } from "../hooks/use-smart-textare";
import { AttachProductBadge } from "./attach-product";

interface ChatPanelProps {
  uiState: UIState;
}

export const ChatPanel: FC<ChatPanelProps> = ({ uiState }) => {
  const { input, attachment, setInput, detach, flush } = useSmartTextarea();
  const { value, isTyping, handleChange, handleBlur, handleReset } =
    useDebounceInput();
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

  const [_, setUIState] = useUIState<typeof AI>();
  const { isGenerating, setIsGenerating } = useAppState();
  const { sendMessage } = useActions<typeof AI>();
  const componentId = useId();

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isGenerating) return;

    const f = new FormData(e.currentTarget);

    try {
      setIsGenerating(true);
      if (attachment) {
        f.set("attach_link", JSON.stringify(attachment));
      }

      if (!f.has("text_input")) {
        f.set("text_input", value);
      }

      setUIState((prevUI) => [
        ...prevUI,
        {
          id: generateId(),
          display: (
            <UserMessage
              key={componentId}
              textInput={value}
              attachLink={attachment}
            />
          ),
        },
      ]);

      flush();
      handleReset();

      const { id, display } = await sendMessage(f);

      setUIState((prevUI) => [...prevUI, { id, display }]);
    } catch (error) {
      handleError(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isButtonDisabled = isGenerating || value.length === 0;

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
                attach={attachment.meta}
                onRemove={handleRemove}
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
            <div className="flex justify-between px-1 pb-2 -mt-3">
              <div className="flex items-center *:hover:bg-transparent *:bg-transparent">
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        size={"icon"}
                        className="text-[#4A4947] dark:text-white rounded-full *:hover:text-purple-500 *:dark:hover:text-purple-200"
                      >
                        <Paperclip className="h-6 w-6 hover:text-purple-200 -rotate-45" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-3xl">
                      <p>Attach some files</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        size={"icon"}
                        className="text-[#4A4947] dark:text-white rounded-full *:hover:text-purple-500 *:dark:hover:text-purple-200"
                      >
                        <ImageIcon className="h-6 w-6 hover:text-purple-200" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-3xl">
                      <p>Attach some images</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        size={"icon"}
                        className="text-[#4A4947] dark:text-white rounded-full *:hover:text-purple-500 *:dark:hover:text-purple-200"
                      >
                        <ChartNoAxesCombined className="h-6 w-6 hover:text-purple-200" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-3xl">
                      <p>Do trends research</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-[#4A4947] dark:text-white *:hover:bg-transparent *:bg-transparent *:hover:text-purple-500 *:dark:hover:text-purple-200">
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        size={"icon"}
                        className="cursor-pointer text-[#4A4947] dark:text-white rounded-full"
                        type={"submit"}
                        disabled={isButtonDisabled}
                      >
                        {isGenerating ? (
                          <Loader className="h-6 w-6 animate-spin" />
                        ) : (
                          <CircleArrowUp className="h-6 w-6" />
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
