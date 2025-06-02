import { FC } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Grip, Plus, Quote, Share2 } from "lucide-react";

export const ProductComparisonSkeleton: FC = () => {
  return (
    <div className="py-5">
      <div className="w-full py-1 border px-4 pt-4 pb-4 rounded-[2rem]">
        <div className="flex flex-col py-5 px-5">
          <div className="flex items-center space-x-3 pb-4">
            <Skeleton className="size-7 rounded-none" />
            <p className="font-light text-black/50 dark:text-white/50 text-sm">
              Comparison
            </p>
          </div>
          <div className="flex flex-col space-y-4 pb-8">
            <Skeleton className="w-[320px] md:w-[380px] h-[34px]" />
            <Skeleton className="w-[230px] md:w-[420px] h-[34px]" />
          </div>
          <div className="flex items-center space-x-3 pb-8">
            <Quote className="size-5 text-muted" />
            <Skeleton className="w-[300px] h-[26px] rounded-full" />
          </div>
          <div className="flex justify-between py-3 border-y px-2 items-center">
            <Skeleton className="w-[280px] md:w-[380px] h-[18px] rounded-none" />
            <div className="size-9 flex items-center justify-center border rounded-full">
              <Share2 className="mr-0.5 size-4 text-muted" />
            </div>
          </div>
          <div className="pt-6 flex flex-col space-y-2">
            <Skeleton className="h-[28px] w-[200px] rounded-full flex items-center">
              <Grip className="ml-3 size-4 text-muted-foreground" />
            </Skeleton>
            <Skeleton className="ml-6 h-[28px] w-[260px] rounded-full flex items-center">
              <Plus className="ml-2 size-4 text-muted-foreground" />
            </Skeleton>
            <Skeleton className="h-[28px] w-[140px] rounded-full flex items-center">
              <Grip className="ml-3 size-4 text-muted-foreground" />
            </Skeleton>
            <Skeleton className="ml-6 h-[28px] w-[330px] rounded-full flex items-center">
              <Plus className="ml-2 size-4 text-muted-foreground" />
            </Skeleton>
          </div>
        </div>
      </div>
    </div>
  );
};
