import { Skeleton } from "@/components/ui/skeleton";

export function ProductComparisonSkeleton() {
  return (
    <div>
      {/* Header Section */}
      <div className="flex items-center justify-between bg-[#1A1A1D] text-white dark:bg-white dark:text-black py-1 px-1 w-full rounded-[2rem]">
        <div className="flex items-center mx-3">
          <Skeleton className="size-6 mr-2" />{" "}
          {/* Placeholder for FlaskConical icon */}
          <div className="w-full">
            <div className="grid grid-cols-2 gap-1 md:gap-2">
              <Skeleton className="h-4 w-3/4" /> {/* Placeholder for Title 1 */}
              <Skeleton className="h-4 w-3/4" /> {/* Placeholder for Title 2 */}
            </div>
            <Skeleton className="h-3 w-1/2 mt-1" />{" "}
            {/* Placeholder for Request ID */}
          </div>
        </div>
        <Skeleton className="size-10 rounded-full" />{" "}
        {/* Placeholder for ChevronUp button */}
      </div>

      {/* Main Content Section */}
      <div className="my-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Product 1 */}
          <div className="lg:border-r border-y border-[#1A1A1D] dark:border-inherit rounded-3xl px-3 pb-1">
            <div className="pt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          {/* Product 2 */}
          <div className="lg:border-l border-y border-[#1A1A1D] dark:border-inherit rounded-3xl px-3 pb-1">
            <div className="pt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
        {/* Key Differences */}
        <div className="border-y border-[#1A1A1D] dark:border-inherit rounded-3xl px-3 my-2 py-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />{" "}
            {/* Placeholder for "Key Differences" title */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
