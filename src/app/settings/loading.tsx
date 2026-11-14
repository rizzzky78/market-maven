import { AiSettingsSkeleton } from "@/components/maven/ai-settings/ai-settings-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiSettingsLoading() {
  return (
    <main className="min-h-dvh w-full px-4 py-6 md:px-10 md:py-10 xl:px-16">
      <Skeleton className="h-11 w-32" />
      <div className="mt-4 mb-8 flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <AiSettingsSkeleton />
    </main>
  );
}
