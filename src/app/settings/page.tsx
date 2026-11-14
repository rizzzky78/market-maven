import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AiSettings } from "@/components/maven/ai-settings/ai-settings";
import { getSession } from "@/lib/auth";
import { getSettingsView, getUsageSummary } from "@/lib/service/ai-settings/repository";

export const metadata: Metadata = {
  title: "AI settings",
  description: "Connect your own LLM providers, pick models per tool and tune how Maven answers.",
};

export default async function AiSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [view, usage] = await Promise.all([
    getSettingsView(session.user.id),
    getUsageSummary(session.user.id, 30),
  ]);

  return (
    <main className="min-h-dvh w-full px-4 py-6 font-(family-name:--font-satoshi) md:px-10 md:py-10 xl:px-16">
      <Link
        href="/chat"
        className="-ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to chat
      </Link>
      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">AI settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Run Maven on your own providers and models, and shape how it answers
          and analyzes products.
        </p>
      </header>
      <AiSettings
        connections={view.connections}
        assignments={view.assignments}
        preferences={view.preferences}
        usage={usage}
      />
    </main>
  );
}
