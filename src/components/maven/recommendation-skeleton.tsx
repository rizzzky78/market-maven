import { RotateCwSquare, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FC } from "react";

export const RecommendationSkeleton: FC = () => {
  return (
    <div className="w-full border rounded-2xl py-1">
      <div className="absolute ml-5 -mt-4">
        <div className="rounded-full border bg-background text-muted-foreground py-1 pl-2 pr-3 flex items-center">
          <RotateCwSquare className="size-4 mr-1 text-muted-foreground" />
          <p className="text-xs font-semibold">Recommendations</p>
        </div>
      </div>
      <div className="p-4 mt-3 -mb-1">
        <div className="flex items-center ml-2 mb-4 text-foreground">
          <Search className="w-4 h-4 mr-2" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-auto w-full flex flex-col rounded-xl items-start p-2 text-left"
            >
              <div className="flex items-center w-full">
                <Skeleton className="flex p-2 shrink-0 rounded-2xl size-20" />
                <div className="ml-3 flex flex-col gap-1 w-full">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
