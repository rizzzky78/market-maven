import { RatingForm } from "@/components/maven/rating-form";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Page() {
  const cookieStore = await cookies();
  const hasSubmitted = cookieStore.has("rating_has_submitted");

  return (
    <main className="w-full my-10 mx-auto flex flex-col max-w-6xl space-y-40 mt-14">
      <div className="min-h-screen flex items-center justify-center px-4">
        <RatingForm initialHasSubmitted={hasSubmitted} />
      </div>
      <footer className="font-[family-name:var(--font-khand)] border-t border-purple-500/20 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <Link
              href="https://github.com/rizzzky78"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl mb-2 sm:mb-0 hover:text-purple-300 transition-colors"
            >
              Github: @rizzzky78
            </Link>
            <div className="mb-2 sm:mb-0 text-xl">
              <span>Portfolio: </span>
              <span className="font-semibold text-purple-300">MAVEN</span>
            </div>
            <div className="text-slate-500 text-xl">Year: 2025</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
