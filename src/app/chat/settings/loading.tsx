import { AiSettingsSkeleton } from "@/components/maven/ai-settings/ai-settings-skeleton";
import { AppHeader } from "@/components/maven/app-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiSettingsLoading() {
  return (
    <>
      <AppHeader title="AI settings" />
      <section className="w-full px-4 py-6 md:px-8 md:py-10 xl:px-12">
        <Skeleton className="mb-8 h-4 w-full max-w-xl" />
        <AiSettingsSkeleton />
      </section>
    </>
  );
}
