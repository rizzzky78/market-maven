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
  ArrowRight,
  Loader,
  MessageCircleQuestion,
  SkipForward,
} from "lucide-react";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { readStreamableValue, useActions, useUIState } from "ai/rsc";
import { useDebounceInput } from "@/components/hooks/use-debounced-input";
import { useMavenStateController } from "@/components/hooks/maven-state-controller";
import { UserMessage } from "@/components/maven/user-message";
import { generateId } from "ai";
import type { InquiryResponse, StreamGeneration } from "@/lib/types/ai";
import { motion, AnimatePresence } from "framer-motion";
import { AI } from "@/app/action";

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
  const [hasSubmitted, setHasSubmitted] = useState(false); // Track if inquiry was already submitted
  const [, setUIState] = useUIState<typeof AI>();
  const { isGenerating, setIsGenerating } = useAppState();
  const { attachment, activeComparison, flush, search, related, reffSource } =
    useMavenStateController();
  const { handleReset } = useDebounceInput();
  const { orchestrator } = useActions<typeof AI>();

  // Check if form has valid selection/input for Submit button
  const isFormValid = (): boolean => {
    const hasValidSelection = selectedOptions.length > 0;
    const hasValidInput =
      !inquiry.allowsInput ||
      (inquiry.allowsInput && inputValue.trim().length > 0);

    return hasValidSelection && hasValidInput;
  };

  // Check if buttons should be disabled
  const areButtonsDisabled = (): boolean => {
    return (
      !!attachment ||
      !!activeComparison ||
      isGenerating ||
      isSubmitting ||
      hasSubmitted
    );
  };

  // Check if Submit button should be disabled (includes form validation)
  const isSubmitDisabled = (): boolean => {
    return areButtonsDisabled() || !isFormValid();
  };

  // Check if Skip button should be disabled
  const isSkipDisabled = (): boolean => {
    return areButtonsDisabled();
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
      const { id, display, generation } = await orchestrator(
        {
          inquiryResponse: payload,
        },
        { onRequest: { search, related, reffSource } }
      );

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
    [
      flush,
      handleReset,
      orchestrator,
      reffSource,
      related,
      search,
      setIsGenerating,
      setUIState,
    ]
  );

  const handleSubmit = async () => {
    if (isSubmitDisabled()) return;

    try {
      setIsSubmitting(true);
      setIsGenerating(true);
      setHasSubmitted(true); // Mark as submitted to prevent resubmission

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
      setHasSubmitted(false); // Reset on error to allow retry
    } finally {
      setIsSubmitting(false);
      setIsGenerating(false);
    }
  };

  const handleSkip = async () => {
    if (isSkipDisabled()) return;

    try {
      setIsSubmitting(true);
      setHasSubmitted(true); // Mark as submitted to prevent resubmission

      await submitInquiryResponse({ skipped: true });
      setSelectedOptions([]);
      setInputValue("");
    } catch (error) {
      console.error("Error skipping inquiry:", error);
      setHasSubmitted(false); // Reset on error to allow retry
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="pt-10"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.div className="absolute ml-6 -mt-3" variants={fadeIn}>
        <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-black w-fit rounded-3xl p-1 px-3 flex items-center">
          <MessageCircleQuestion className="size-4 mr-1" />
          <p className="text-xs font-semibold">Inquiry</p>
        </div>
      </motion.div>
      <motion.div
        className="w-full mx-auto border-[#1A1A1D] dark:border-inherit border rounded-[2rem]"
        variants={staggerChildren}
      >
        <CardContent className="mt-3">
          <motion.h3 className="pt-6 font-semibold ml-2" variants={fadeIn}>
            {inquiry.question}
          </motion.h3>
          <Separator className="my-3 bg-[#1A1A1D] dark:bg-muted" />
          <AnimatePresence>
            {!inquiry.isMultiSelection ? (
              <motion.div variants={staggerChildren} className="ml-2">
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
              <motion.div className="space-y-1 ml-2" variants={staggerChildren}>
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
            <motion.div className="mt-4 ml-2" variants={fadeIn}>
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
                disabled={isSkipDisabled()}
              >
                <span className="-mr-1">Skip</span>
                <SkipForward className="size-4 shrink-0" />
              </Button>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Button
                variant="outline"
                className="rounded-3xl font-normal flex items-center"
                onClick={handleSubmit}
                disabled={isSubmitDisabled()}
              >
                <span className="-mr-1">Submit</span>
                {isSubmitting ? (
                  <Loader className="size-4 shrink-0" />
                ) : (
                  <ArrowRight className="size-4 shrink-0" />
                )}
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </motion.div>
    </motion.div>
  );
};

export const UserInquiryShared: FC<InquiryProps> = ({ inquiry }) => {
  return (
    <motion.div
      className="pt-10"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.div className="absolute ml-6 -mt-3" variants={fadeIn}>
        <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-black w-fit rounded-3xl p-1 px-3 flex items-center">
          <MessageCircleQuestion className="size-4 mr-1" />
          <p className="text-xs font-semibold">Inquiry</p>
        </div>
      </motion.div>
      <motion.div
        className="w-full mx-auto border-[#1A1A1D] dark:border-inherit border rounded-[2rem]"
        variants={staggerChildren}
      >
        <CardContent className="mt-3">
          <motion.h3 className="pt-6 font-semibold ml-2" variants={fadeIn}>
            {inquiry.question}
          </motion.h3>
          <Separator className="my-3 bg-[#1A1A1D] dark:bg-muted" />
          <AnimatePresence>
            {!inquiry.isMultiSelection ? (
              <motion.div variants={staggerChildren} className="ml-2">
                <RadioGroup disabled className="-space-y-1">
                  {inquiry.options.map((option) => (
                    <motion.div
                      key={option.value}
                      className="flex items-center space-x-2"
                      variants={fadeIn}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        disabled
                      />
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
              <motion.div className="space-y-1 ml-2" variants={staggerChildren}>
                {inquiry.options.map((option) => (
                  <motion.div
                    key={option.value}
                    className="flex items-center space-x-2"
                    variants={fadeIn}
                  >
                    <Checkbox id={option.value} disabled />
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
            <motion.div className="mt-4 ml-2" variants={fadeIn}>
              <Label
                htmlFor="additionalInput"
                className="font-normal text-sm mb-1 block"
              >
                {inquiry.inputLabel || "Additional Information"}
              </Label>
              <Input
                id="additionalInput"
                placeholder={inquiry.inputPlaceholder}
                className="w-full rounded-3xl"
                disabled
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
                disabled
              >
                <span className="-mr-1">Skip</span>
                <SkipForward className="size-4 shrink-0" />
              </Button>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Button
                variant="outline"
                className="rounded-3xl font-normal flex items-center"
                disabled
              >
                <span className="-mr-1">Submit</span>
                <ArrowRight className="size-4 shrink-0" />
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </motion.div>
    </motion.div>
  );
};
