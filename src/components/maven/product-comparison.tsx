"use client";

import { Columns2, Info } from "lucide-react";
import { FC, useState } from "react";
import {
  MemoProductComparison,
  SkeletonProductComparison,
} from "./memo-product-comparison";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { Lens } from "./lens";
import { Separator } from "../ui/separator";
import { ProductsComparisonProps } from "@/lib/types/props";
import { ErrorMessage } from "./error-message";
import { ShareButton } from "./share-button";
import Image from "next/image";

export const ProductComparison: FC<ProductsComparisonProps> = ({
  content,
  isSharedContent,
  skeleton,
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
                    disabled={isSharedContent || isGenerating}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Separator className="mt-2 mb-4 bg-[#1A1A1D] dark:bg-muted" />
        {!skeleton ? (
          <MemoProductComparison
            callId={callId}
            compare={compare}
            data={comparison}
            isGenerating={isGenerating}
          />
        ) : (
          <SkeletonProductComparison callId={callId} compare={compare} />
        )}
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
