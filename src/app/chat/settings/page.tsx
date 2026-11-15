import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/maven/app-header";
import { AiSettings } from "@/components/maven/ai-settings/ai-settings";
import { prisma } from "@/database/prisma";
import { getSession } from "@/lib/auth";
import { getAccountLabel } from "@/lib/auth/display";
import { getSettingsView, getUsageSummary } from "@/lib/service/ai-settings/repository";

export const metadata: Metadata = {
  title: "AI settings",
  description: "Connect your own LLM providers, pick models per tool and tune how Maven answers.",
};

export default async function AiSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [view, usage, credentialAccount] = await Promise.all([
    getSettingsView(session.user.id),
    getUsageSummary(session.user.id, 30),
    prisma.account.findFirst({
      where: { userId: session.user.id, providerId: "credential" },
      select: { id: true },
    }),
  ]);

  const phone = session.user.phoneNumber;
  const account = {
    label: getAccountLabel(session.user) ?? session.user.name,
    phoneHint: phone ? `${phone.slice(0, 3)}${"*".repeat(Math.max(phone.length - 7, 0))}${phone.slice(-4)}` : null,
    hasPassword: credentialAccount !== null,
  };

  return (
    <>
      <AppHeader title="AI settings" />
      <section className="w-full px-4 py-6 md:px-8 md:py-10 xl:px-12">
        <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
          Run Maven on your own providers and models, and shape how it answers
          and analyzes products.
        </p>
        <AiSettings
          connections={view.connections}
          assignments={view.assignments}
          preferences={view.preferences}
          usage={usage}
          account={account}
        />
      </section>
    </>
  );
}
