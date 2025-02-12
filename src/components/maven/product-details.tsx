/* eslint-disable @next/next/no-img-element */
"use client";

import { StreamableValue, useStreamableValue } from "ai/rsc";
import { FC, useEffect, useState } from "react";
import { FlipHorizontal, Info, NotepadText, Share2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { Lens } from "./lens";
import { MemoProductDetails } from "./memo-product-details";
import { ProductDetailsProps } from "@/lib/types/props";
import { ErrorMessage } from "./error-message";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";
import Link from "next/link";
import { useSmartTextarea } from "../hooks/use-smart-textare";
import { ShareButton } from "./share-button";

export const ProductDetails: FC<ProductDetailsProps> = ({
  content,
  isSharedContent,
}) => {
  const { success, args, data } = content;

  const [hovering, setHovering] = useState(false);
  const { addToComparison, activeComparison, attachment } = useSmartTextarea();

  if (!success) {
    return (
      <ErrorMessage
        errorName="Invalid Data Tool Results"
        reason="Data tool results failed to render. This occur when received data tool are invalid on pre-processing the results."
        raw={{ args, data }}
      />
    );
  }

  const { callId, productDetails, screenshot } = data;

  const comparisonState = activeComparison
    ? activeComparison.for.length === 2 ||
      Boolean(activeComparison.for.find((v) => v.callId === callId))
    : false;

  const isButtonDisabled =
    Boolean(attachment) || comparisonState || !isSharedContent;

  const attachComparison = () => {
    addToComparison({
      for: { title: args.query, callId },
    });
  };

  return (
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
                <img
                  src={screenshot}
                  alt="Searched Product"
                  className="object-cover"
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
                        // link={`http://localhost:3000/share?type=getProductDetails?component-id=${callId}?reff-id=`}
                      />
                    </div>
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={"outline"}
                            size={"sm"}
                            className="rounded-3xl py-1 font-normal bg-[#1A1A1D] dark:bg-background text-white hover:border-[#1A1A1D]"
                            onClick={attachComparison}
                            disabled={isButtonDisabled}
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
          query={args.query}
          link={args.link}
          data={[productDetails]}
          isGenerating={false}
        />
        <div className="mb-2 flex items-center space-x-2 justify-center">
          <Info className="size-4 text-purple-500 dark:text-purple-300" />
          <p className="text-xs">
            AI generated information, for reference only.
          </p>
        </div>
      </div>
    </div>
  );
};

interface StreamProductDetailsProps {
  content: StreamableValue<Record<string, any>>;
  callId: string;
  query: string;
  link: string;
  screenshot?: string;
}

export const StreamProductDetails: FC<StreamProductDetailsProps> = ({
  content,
  callId,
  query,
  link,
  screenshot,
}) => {
  const [raw, error, pending] = useStreamableValue(content);
  const [data, setData] = useState<Record<string, any>>({});
  const [hovering, setHovering] = useState(false);
  const { addToComparison, activeComparison, attachment } = useSmartTextarea();

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

  const comparisonState = activeComparison
    ? activeComparison.for.length === 2 ||
      Boolean(activeComparison.for.find((v) => v.callId === callId))
    : false;

  const isButtonDisabled = attachment ? true : false || comparisonState;

  const attachComparison = () => {
    addToComparison({
      for: { title: query, callId },
    });
  };

  return (
    <div className="w-full border rounded-[2rem] px-4 py-1">
      <div>
        {screenshot && (
          <div className="mt-3">
            <Lens
              hovering={hovering}
              setHovering={setHovering}
              zoomFactor={2}
              lensSize={270}
            >
              <img
                src={screenshot}
                alt="Searched Product"
                className="object-cover"
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
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="rounded-full mr-2 size-8"
                          >
                            <Share2 className="size-2 shrink-0" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="rounded-3xl">
                          <p className="max-w-sm font-semibold">
                            Share this product details, anyone with link can
                            view
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={"outline"}
                          size={"sm"}
                          className="rounded-3xl py-1 font-normal bg-[#1A1A1D] dark:bg-background text-white hover:border-[#1A1A1D]"
                          onClick={attachComparison}
                          disabled={isButtonDisabled}
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
    </div>
  );
};
