"use client";

import { Columns2, Info } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { MemoProductComparison } from "./memo-product-comparison";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { Lens } from "./lens";
import { Separator } from "../ui/separator";
import { ProductsComparisonProps } from "@/lib/types/props";
import { ErrorMessage } from "./error-message";
import { ShareButton } from "./share-button";
import Image from "next/image";
import { ProductsComparisonResponse } from "@/lib/types/product";
import { StreamableValue, useStreamableValue } from "ai/rsc";

export const ProductComparison: FC<ProductsComparisonProps> = ({
  content,
  isSharedContent,
}) => {
  const {
    success,
    args: { compare },
    data,
  } = content;
  const { isGenerating } = useAppState();
  const [hovering_1, setHovering_1] = useState(false);
  const [hovering_2, setHovering_2] = useState(false);

  if (!success) {
    return (
      <ErrorMessage
        errorName="Invalid Data Tool Results"
        reason="Data tool results failed to render. This occur when received data tool are invalid on pre-processing the results."
        raw={{ args: { compare }, data }}
      />
    );
  }

  const { callId, productImages, comparison } = data;

  return (
    <div className="w-full mb-8">
      <div className="absolute ml-4 -mt-4">
        <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center">
          <Columns2 className="size-4 mr-1 text-purple-400" />
          <p className="text-xs font-semibold">
            Product Comparison by
            <span className="ml-0.5 text-purple-400 dark:text-purple-600">
              Maven
            </span>
          </p>
        </div>
      </div>
      <div className="w-full py-1 border-[#1A1A1D] dark:border-inherit border px-4 pt-4 pb-4 rounded-[2rem]">
        <div className="">
          <div className="flex flex-wrap gap-3">
            <Lens
              hovering={hovering_1}
              setHovering={setHovering_1}
              zoomFactor={2}
              lensSize={270}
            >
              <Image
                src={productImages[0]}
                alt={compare[0].title}
                width={1400}
                height={788}
                quality={100}
                placeholder={"blur"}
                blurDataURL="/blured-placeholder.webp"
              />
            </Lens>
            <Lens
              hovering={hovering_2}
              setHovering={setHovering_2}
              zoomFactor={2}
              lensSize={270}
            >
              <Image
                src={productImages[1]}
                alt={compare[1].title}
                width={1400}
                height={788}
                quality={100}
                placeholder={"blur"}
                blurDataURL="/blured-placeholder.webp"
              />
            </Lens>
          </div>
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
                    title={"Products Comparison"}
                    type={"products-comparison"}
                    callId={data.callId}
                    disabled={isSharedContent}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Separator className="mt-2 mb-4 bg-[#1A1A1D] dark:bg-muted" />
        <MemoProductComparison
          callId={callId}
          compare={compare}
          data={comparison}
          isGenerating={isGenerating}
        />
        <div className="mt-3 -mb-1 flex items-center justify-center">
          <Info className="size-4 mr-1 text-purple-500 dark:text-purple-300" />
          <p className="text-xs">
            AI generated comparison, for reference only.
          </p>
        </div>
      </div>
    </div>
  );
};

interface StreamProductsComparisonProps {
  args: {
    compare: Array<{
      title: string;
      callId: string;
    }>;
  };
  data: Omit<ProductsComparisonResponse, "comparison">;
  content: StreamableValue<Record<string, any>>;
}

export const StreamProductsComparison: FC<StreamProductsComparisonProps> = ({
  args,
  data,
  content,
}) => {
  const [raw, error, pending] = useStreamableValue(content);
  const [comparison, setComparison] = useState<Record<string, any>>({});
  const [hovering_1, setHovering_1] = useState(false);
  const [hovering_2, setHovering_2] = useState(false);

  useEffect(() => {
    if (raw) setComparison(raw);
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

  const { callId, productImages } = data;

  return (
    <div className="w-full mb-8">
      <div className="absolute ml-4 -mt-4">
        <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center">
          <Columns2 className="size-4 mr-1 text-purple-400" />
          <p className="text-xs font-semibold">
            Product Comparison by
            <span className="ml-0.5 text-purple-400 dark:text-purple-600">
              Maven
            </span>
          </p>
        </div>
      </div>
      <div className="w-full py-1 border-[#1A1A1D] dark:border-inherit border px-4 pt-4 pb-4 rounded-[2rem]">
        <div className="">
          <div className="flex flex-wrap gap-3">
            <Lens
              hovering={hovering_1}
              setHovering={setHovering_1}
              zoomFactor={2}
              lensSize={270}
            >
              <Image
                src={productImages[0]}
                alt={args.compare[0].title}
                width={1400}
                height={788}
                quality={100}
                placeholder={"blur"}
                blurDataURL="/blured-placeholder.webp"
              />
            </Lens>
            <Lens
              hovering={hovering_2}
              setHovering={setHovering_2}
              zoomFactor={2}
              lensSize={270}
            >
              <Image
                src={productImages[1]}
                alt={args.compare[1].title}
                width={1400}
                height={788}
                quality={100}
                placeholder={"blur"}
                blurDataURL="/blured-placeholder.webp"
              />
            </Lens>
          </div>
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
                    title={"Products Comparison"}
                    type={"products-comparison"}
                    callId={data.callId}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Separator className="mt-2 mb-4 bg-[#1A1A1D] dark:bg-muted" />
        <MemoProductComparison
          callId={callId}
          compare={args.compare}
          data={comparison}
          isGenerating={pending}
        />
        <div className="mt-3 -mb-1 flex items-center justify-center">
          <Info className="size-4 mr-1 text-purple-500 dark:text-purple-300" />
          <p className="text-xs">
            AI generated comparison, for reference only.
          </p>
        </div>
      </div>
    </div>
  );
};
