"use client";

import { FC, useCallback, useId, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Inquiry } from "@/lib/agents/schema/inquiry";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CircleArrowRight,
  Loader,
  MessageCircleQuestion,
  SkipForward,
} from "lucide-react";
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useUIState, useActions } from "ai/rsc";
import { useDebounceInput } from "../hooks/use-debounced-input";
import { useSmartTextarea } from "../hooks/use-smart-textare";
import { UserMessage } from "./user-message";
import { generateId } from "ai";

interface InquiryProps {
  inquiry: Inquiry;
}

export const UserInquiry: FC<InquiryProps> = ({ inquiry }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, setUIState] = useUIState<typeof AI>();
  const { isGenerating, setIsGenerating } = useAppState();
  const { sendMessage } = useActions<typeof AI>();
  const { flush } = useSmartTextarea();
  const { handleReset } = useDebounceInput();
  const componentId = useId();

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
    async (payload: Record<string, any>) => {
      setIsGenerating(true);

      const text = JSON.stringify(payload, null, 2);

      // Add user message to UI
      setUIState((prevUI) => [
        ...prevUI,
        {
          id: generateId(),
          display: <UserMessage key={componentId} textInput={text} />,
        },
      ]);

      // Send the message and wait for response
      const { id, display } = await sendMessage({
        textInput: text,
        inquiryResponse: text,
      });

      // Add response to UI
      setUIState((prevUI) => [...prevUI, { id, display }]);

      // Clean up
      flush();
      handleReset();
    },
    [componentId, flush, handleReset, sendMessage, setIsGenerating, setUIState]
  );

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    try {
      setIsSubmitting(true);

      const formData = {
        selectedOptions,
        inputValue: inquiry.allowsInput
          ? inputValue.length > 0
            ? inputValue
            : null
          : null,
        question: inquiry.question,
      };

      await submitInquiryResponse(formData);

      // Reset form
      setSelectedOptions([]);
      setInputValue("");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setSelectedOptions([]);
    setInputValue("");
  };

  return (
    <div className="mt-10">
      <div className="absolute ml-6 -mt-3">
        <div className="bg-white w-fit rounded-3xl p-1 px-3 flex items-center">
          <MessageCircleQuestion className="size-4 text-black mr-1" />
          <p className="text-xs text-black font-semibold">Inquiry</p>
        </div>
      </div>
      <div className="w-full mx-auto border rounded-3xl">
        <CardContent className="">
          <h3 className="pt-6 font-semibold">{inquiry.question}</h3>
          <Separator className="my-3" />
          {!inquiry.isMultiSelection ? (
            <RadioGroup
              onValueChange={handleOptionChange}
              value={selectedOptions[0]}
              className="-space-y-1"
            >
              {inquiry.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-1">
              {inquiry.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={selectedOptions.includes(option.value)}
                    onCheckedChange={() => handleOptionChange(option.value)}
                  />
                  <Label htmlFor={option.value} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {inquiry.allowsInput && (
            <div className="mt-4">
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
            </div>
          )}
          <div className="flex justify-end mt-3">
            <Button
              variant="outline"
              className="rounded-3xl font-normal flex items-center mr-2"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              <span className="-mr-1">Skip</span>
              <SkipForward className="size-4" />
            </Button>
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
          </div>
        </CardContent>
      </div>
    </div>
  );
};
