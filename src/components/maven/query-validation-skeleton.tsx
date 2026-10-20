import { SearchCheck, Loader2 } from "lucide-react";
import { Card, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const QueryValidationSkeleton = () => {
  return (
    <div className="w-[90%] md:w-full flex justify-start">
      <Card className="w-full md:w-[448px] bg-muted rounded-xl">
        <CardHeader className="pl-4 pr-2 py-[7px]">
          <div className="flex justify-between items-center gap-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <SearchCheck className="size-4 text-muted-foreground" />
                <h3 className="text-xs animate-pulse">Query Validation</h3>
                <Loader2 className="animate-spin size-4" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-[70px] rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
