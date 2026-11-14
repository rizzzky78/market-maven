import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder of the AI settings tabs and the connections list. */
export const AiSettingsSkeleton = () => (
  <div className="flex w-full flex-col gap-8" aria-busy="true" aria-label="Loading AI settings">
    <Skeleton className="h-10 w-full max-w-md rounded-full" />
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex w-full max-w-2xl flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-8 w-36 rounded-full" />
    </div>
    <div className="divide-y border-y">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
          <Skeleton className="hidden h-8 w-48 sm:block" />
        </div>
      ))}
    </div>
  </div>
);
