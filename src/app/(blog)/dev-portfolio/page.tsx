import { DevPortfolio } from "@/components/maven/dev-portfolio";
import { RedirectCard } from "@/components/maven/redirect-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dev Portfolio | Under Construction",
  description: "Developer portfolio page coming soon",
};

export default function DevPortfolioPage() {
  return (
    <div className="flex flex-col">
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <DevPortfolio />
      </main>
      <div className="flex justify-center">
        <RedirectCard
          redirectTo="/"
          redirectDelay={25000}
          message="Moving you to homepage"
        />
      </div>
    </div>
  );
}
