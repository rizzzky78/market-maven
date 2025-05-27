import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardHeader } from "../ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const QueryEnhancementSkeleton = () => {
  return (
    <div className="md:w-full flex justify-start w-[90%]">
      <Card className="w-full md:w-[448px] bg-black/20 dark:bg-transparent rounded-3xl">
        <CardHeader className="pl-4 pr-2 py-[7px]">
          <div className="flex justify-between items-center gap-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="size-4 text-purple-500" />
                <h3 className="text-xs animate-pulse">Query Enhancement</h3>
                <Loader2 className="animate-spin size-4" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-[100px] rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
