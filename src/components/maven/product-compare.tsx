"use client";

import { ExtendedToolResult } from "@/lib/types/ai";
import { Columns2, Info, NotepadText } from "lucide-react";
import { FC } from "react";
import { DynamicCompare } from "./dynamic-compare";
import { useAppState } from "@/lib/utility/provider/app-state-provider";

interface CompareProps {
  content: ExtendedToolResult<
    { callId: string[] },
    {
      comparison: {
        products: Record<string, any>[];
        differences: Record<string, any>;
      };
    }
  >;
}

export const ProductCompare: FC<CompareProps> = ({ content }) => {
  const { success, args, data } = content;
  const { isGenerating } = useAppState();

  return (
    <div className="w-full">
      <div className="absolute ml-4 -mt-4">
        <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center">
          <Columns2 className="size-4 mr-1" />
          <p className="text-xs font-semibold">
            Product Comparison by
            <span className="ml-0.5 text-green-400 dark:text-green-600">
              Maven
            </span>
          </p>
        </div>
      </div>
      <div className="w-full py-1 border px-4 pt-4 pb-4 rounded-[2rem]">
        <DynamicCompare
          data={data.comparison}
          callId={args.callId}
          isGenerating={isGenerating}
        />
        <div className="mt-3 flex items-center justify-center">
          <Info className="size-4 mr-1 text-purple-300" />
          <p className="text-xs">
            AI generated comparison, for reference only.
          </p>
        </div>
      </div>
    </div>
  );
};
