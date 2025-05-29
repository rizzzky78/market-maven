"use client";

import { Separator } from "@radix-ui/react-separator";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import { StreamableValue, useStreamableValue } from "ai/rsc";
import { NotepadText, Info, FlipHorizontal } from "lucide-react";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/maven/error-message";
import { ExtendedMessage } from "@/components/maven/extended-message";
import { Lens } from "@/components/maven/lens";
import { MemoProductDetails } from "@/components/maven/memo-product-details";
import { ShareButton } from "@/components/maven/share-button";
import Image from "next/image";

interface StreamProductDetailsProps {
  content: StreamableValue<Record<string, any>>;
  callId: string;
  query: string;
  link: string;
  screenshot?: string;
  externalData: { markdown: string | null; tavily: string | null };
}

export const StreamProductDetails: FC<StreamProductDetailsProps> = ({
  content,
  callId,
  query,
  link,
  screenshot,
  externalData,
}) => {
  const [raw, error, pending] = useStreamableValue(content);
  const [data, setData] = useState<Record<string, any>>({});
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (raw) setData(raw);
  }, [raw]);

  if (error) {
    return (
      <ErrorMessage
        errorName="Stream Object Parsing Operation Failed"
        reason="There was an error while parsing the streamable-value input."
        raw={{ trace: raw }}
      />
    );
  }

  return (
    <div className="w-full">
      {externalData?.markdown && externalData?.tavily && (
        <ExtendedMessage
          content={externalData.markdown}
          tavilyAnswer={externalData.tavily}
        />
      )}
      <div className="w-full mb-8">
        <div className="absolute ml-4 -mt-4">
          <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center">
            <NotepadText className="size-4 mr-1 text-purple-400" />
            <p className="text-xs font-semibold">
              Product Details provided by
              <Link
                href={"https://www.tokopedia.com/"}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-700"
              >
                Tokopedia
              </Link>
            </p>
          </div>
        </div>
        <div className="w-full border-[#1A1A1D] dark:border-inherit border rounded-[2rem] px-4 py-1">
          <div>
            {screenshot && (
              <div className="mt-3">
                <Lens
                  hovering={hovering}
                  setHovering={setHovering}
                  zoomFactor={2}
                  lensSize={270}
                >
                  <Image
                    src={screenshot}
                    alt={query}
                    width={1400}
                    height={788}
                    quality={100}
                    placeholder={"blur"}
                    blurDataURL="/blured-placeholder.webp"
                  />
                </Lens>
                <div className="w-full pl-1 mt-2 rounded-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center mr-2">
                      <Info className="size-4 text-purple-500 dark:text-purple-300 mr-1" />
                      <p className="text-xs">
                        This app is not affiliated with the relevant online
                        marketplace.
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div>
                        <ShareButton
                          title={"Product Details"}
                          type={"product-details"}
                          callId={callId}
                          disabled
                        />
                      </div>
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={"outline"}
                              className="rounded-3xl h-9 font-normal bg-[#1A1A1D] dark:bg-background text-white hover:border-[#1A1A1D]"
                              disabled
                            >
                              <FlipHorizontal className="size-4 text-purple-500 dark:text-purple-300" />
                              <span>Compare</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-3xl">
                            <p className="max-w-sm font-semibold">
                              Attach to products comparison
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Separator className="mt-2 mb-4 bg-[#1A1A1D] dark:bg-muted" />
          <MemoProductDetails
            callId={callId}
            query={query}
            link={link}
            data={[data]}
            isGenerating={pending}
          />
          <div className="mb-2 flex items-center space-x-2 justify-center">
            <Info className="size-4 text-purple-500 dark:text-purple-300" />
            <p className="text-xs">
              AI generated information, for reference only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
