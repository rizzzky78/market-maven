"use client";

import { FC, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Inquiry } from "@/lib/agents/schema/inquiry";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import {
  CircleArrowRight,
  MessageCircleQuestion,
  SkipForward,
} from "lucide-react";

interface InquiryProps {
  inquiry: Inquiry;
}

export const UserInquiry: FC<InquiryProps> = ({ inquiry }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

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

  return (
    <div className="my-10">
      <div className="absolute ml-6 -mt-3">
        <div className="bg-white w-fit rounded-3xl p-1 px-3 flex items-center">
          <MessageCircleQuestion className="size-4 text-black mr-1" />
          <p className=" text-xs text-black font-semibold">Inquiry</p>
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
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className=""
                  />
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
              variant={"outline"}
              className="rounded-3xl font-normal flex items-center mr-2"
              disabled
            >
              <span className="-mr-1">Skip</span>
              <SkipForward className="size-4" />
            </Button>
            <Button
              variant={"outline"}
              className="rounded-3xl font-normal flex items-center"
            >
              <span className="-mr-1">Submit</span>
              <CircleArrowRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
};
