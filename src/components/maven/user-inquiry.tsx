"use client";

import { type FC, useCallback, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Inquiry } from "@/lib/agents/schema/inquiry";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CircleArrowRight,
  Loader,
  MessageCircleQuestion,
  SkipForward,
} from "lucide-react";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { readStreamableValue } from "ai/rsc";
import { useDebounceInput } from "../hooks/use-debounced-input";
import { useSmartTextarea } from "../hooks/use-smart-textare";
import { UserMessage } from "./user-message";
import { generateId } from "ai";
import type { InquiryResponse, StreamGeneration } from "@/lib/types/ai";
import { motion, AnimatePresence } from "framer-motion";
import { useUIState } from "@/lib/utility/provider/ai-state-provider";
import { orchestrator } from "@/app/actions/orchestrator";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.1 } },
};

interface InquiryProps {
  inquiry: Inquiry;
}

export const UserInquiry: FC<InquiryProps> = ({ inquiry }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, setUIState] = useUIState();
  const { setIsGenerating } = useAppState();
  const { flush } = useSmartTextarea();
  const { handleReset } = useDebounceInput();

  const isFormValid = (): boolean => {
    const hasValidSelection = selectedOptions.length > 0;
    const hasValidInput =
      !inquiry.allowsInput ||
      (inquiry.allowsInput && inputValue.trim().length > 0);

    return hasValidSelection || hasValidInput;
  };

  const handleOptionChange = (value: string) => {
    if (!inquiry.isMultiSelection) {
      setSelectedOptions([value]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    }
  };

  const submitInquiryResponse = useCallback(
    async (payload: InquiryResponse) => {
      const componentId = generateId();

      setUIState((prevUI) => [
        ...prevUI,
        {
          id: generateId(),
          display: (
            <UserMessage
              key={componentId}
              content={{ inquiry_response: payload }}
            />
          ),
        },
      ]);

      // Send the message and wait for response
      const { id, display, generation } = await orchestrator({
        inquiryResponse: payload,
      });

      if (generation) {
        const gens = readStreamableValue(
          generation
        ) as AsyncIterable<StreamGeneration>;

        for await (const { loading } of gens) {
          setIsGenerating(loading);
        }
      }

      // Add response to UI
      setUIState((prevUI) => [...prevUI, { id, display }]);

      // Clean up
      flush();
      handleReset();
    },
    [flush, handleReset, setIsGenerating, setUIState]
  );

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    try {
      setIsSubmitting(true);
      setIsGenerating(true);

      await submitInquiryResponse({
        question: inquiry.question,
        selected: selectedOptions,
        input: inquiry.allowsInput
          ? inputValue.length > 0
            ? inputValue
            : null
          : null,
      });

      // Reset form
      setSelectedOptions([]);
      setInputValue("");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
      setIsGenerating(false);
    }
  };

  const handleSkip = async () => {
    await submitInquiryResponse({ skipped: true });
    setSelectedOptions([]);
    setInputValue("");
  };

  return (
    <motion.div
      className="mt-10"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.div className="absolute ml-6 -mt-3" variants={fadeIn}>
        <div className="bg-white w-fit rounded-3xl p-1 px-3 flex items-center">
          <MessageCircleQuestion className="size-4 text-black mr-1" />
          <p className="text-xs text-black font-semibold">Inquiry</p>
        </div>
      </motion.div>
      <motion.div
        className="w-full mx-auto border rounded-3xl"
        variants={staggerChildren}
      >
        <CardContent className="">
          <motion.h3 className="pt-6 font-semibold" variants={fadeIn}>
            {inquiry.question}
          </motion.h3>
          <Separator className="my-3" />
          <AnimatePresence>
            {!inquiry.isMultiSelection ? (
              <motion.div variants={staggerChildren}>
                <RadioGroup
                  onValueChange={handleOptionChange}
                  value={selectedOptions[0]}
                  className="-space-y-1"
                >
                  {inquiry.options.map((option) => (
                    <motion.div
                      key={option.value}
                      className="flex items-center space-x-2"
                      variants={fadeIn}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label
                        htmlFor={option.value}
                        className="text-sm font-normal"
                      >
                        {option.label}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </motion.div>
            ) : (
              <motion.div className="space-y-1" variants={staggerChildren}>
                {inquiry.options.map((option) => (
                  <motion.div
                    key={option.value}
                    className="flex items-center space-x-2"
                    variants={fadeIn}
                  >
                    <Checkbox
                      id={option.value}
                      checked={selectedOptions.includes(option.value)}
                      onCheckedChange={() => handleOptionChange(option.value)}
                    />
                    <Label
                      htmlFor={option.value}
                      className="text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {inquiry.allowsInput && (
            <motion.div className="mt-4" variants={fadeIn}>
              <Label
                htmlFor="additionalInput"
                className="font-normal text-sm mb-1 block"
              >
                {inquiry.inputLabel || "Additional Information"}
              </Label>
              <Input
                id="additionalInput"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inquiry.inputPlaceholder}
                className="w-full rounded-3xl"
              />
            </motion.div>
          )}
          <motion.div
            className="flex justify-end mt-3"
            variants={staggerChildren}
          >
            <motion.div variants={fadeIn}>
              <Button
                variant="outline"
                className="rounded-3xl font-normal flex items-center mr-2"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                <span className="-mr-1">Skip</span>
                <SkipForward className="size-4" />
              </Button>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Button
                variant="outline"
                className="rounded-3xl font-normal flex items-center"
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
              >
                <span className="-mr-1">Submit</span>
                {isSubmitting ? (
                  <Loader className="size-4" />
                ) : (
                  <CircleArrowRight className="size-4" />
                )}
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </motion.div>
    </motion.div>
  );
};
