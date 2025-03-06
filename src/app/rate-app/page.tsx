import { RateApp } from "@/components/maven/rate-app";
import { RatingForm } from "@/components/maven/rating-form";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const hasSubmitted = cookieStore.has("rating_has_submitted");

  return (
    <main className="w-full my-10 mx-auto flex flex-col max-w-6xl space-y-40 mt-14">
      <RateApp />
      <div className="min-h-screen flex items-center justify-center px-4">
        <RatingForm initialHasSubmitted={hasSubmitted} />
      </div>
      <footer className="border-t border-purple-500/20 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <a
              href="https://github.com/rizzzky78"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 sm:mb-0 hover:text-purple-300 transition-colors"
            >
              Github: @rizzzky78
            </a>
            <div className="mb-2 sm:mb-0">
              <span>Portfolio: </span>
              <span className="font-semibold text-purple-300">MarketMaven</span>
            </div>
            <div className="text-slate-500">Year: 2025</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
