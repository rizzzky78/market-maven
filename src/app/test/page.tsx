"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowRightLeft, Search } from "lucide-react";
import { FC } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

type RelatedQuery = {
  items: {
    label: string;
    query: string;
  }[];
};
interface RelatedProps {
  related: RelatedQuery | null;
}

export const RelatedMessage: FC<RelatedProps> = ({ related }) => {
  return (
    <div className="my-12 w-full">
      <div className="mb-2">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft className="size-4 text-purple-500" />
          <h2 className="text-sm font-semibold">Related Queries</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {related &&
          related.items.map((item, index) => (
            <Card
              key={index}
              className="hover:bg-foreground/5 h-full bg-background cursor-wait"
            >
              <CardHeader className="pt-2 pb-1 px-3">
                <CardTitle className="text-sm text-black/90 dark:text-white/90">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2">
                <CardDescription className="text-xs">
                  {item.query}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default function Page() {
  const sampleRelated = {
    items: [
      {
        label: "Battery Life Comparison",
        query:
          "How does the battery life of the Lenovo Legion Pro 5 compare to the Lenovo Yoga Pro 7i during gaming and general use?",
      },
      {
        label: "Display Technology Details",
        query:
          "What are the advantages of OLED displays in the Lenovo Yoga Pro 7i compared to IPS displays in the Lenovo Legion Pro 5 for content creation?",
      },
      {
        label: "Gaming Performance",
        query:
          "What is the gaming performance difference between the NVIDIA RTX 4070 in the Lenovo Legion Pro 5 and the RTX 4050 in the Lenovo Yoga Pro 7i?",
      },
    ],
  };
  return (
    <div className="flex flex-1 flex-col px-4">
      <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
        <RelatedMessage related={sampleRelated} />
      </div>
    </div>
  );
}
