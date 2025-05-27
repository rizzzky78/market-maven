import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InsightProductCardSkeleton() {
  return (
    <div className="w-full">
      <div className="w-full border-[#1A1A1D] dark:border-inherit border rounded-[2rem] px-4 py-2">
        <div className="pt-4 md:pt-6 flex flex-row justify-between h-full items-start">
          <div className="pl-2 md:pl-4 flex flex-col justify-between h-full max-w-sm">
            <div className="flex flex-col space-y-3">
              <Skeleton className="w-[160px] lg:w-[230px] h-6" />
              <Skeleton className="w-[120px] lg:w-[170px] h-6" />
            </div>
            <div className="pt-7 flex flex-col space-y-2">
              <Skeleton className="h-4 w-[90px]" />
              <Skeleton className="h-5 w-[150px]" />
            </div>
            <Skeleton className="mt-8 h-8 w-[150px] rounded-full" />
          </div>
          <div className="h-full max-w-sm flex items-center">
            <div className="flex flex-col px-2 md:px-4">
              <Skeleton className="size-[220px] lg:size-[260px] rounded-xl" />
              <Skeleton className="mt-3 h-4 w-[140px]" />
            </div>
          </div>
        </div>
        <div>
          <div className="w-full py-3 px-2 lg:px-4 mt-8 mb-3 flex items-center justify-between">
            <div className="flex items-start space-x-2">
              <Info className="size-4 shrink-0 text-purple-500 dark:text-purple-300" />
              <div className="w-full flex flex-col space-y-2">
                <Skeleton className="w-[340px] lg:w-[500px] h-4" />
                <Skeleton className="w-[260px] lg:w-[300px] h-4" />
              </div>
            </div>
            <Button
              variant={"outline"}
              size={"icon"}
              className="rounded-full shrink-0 size-9"
              disabled
            >
              <ChevronUp className="size-3 shrink-0 rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
