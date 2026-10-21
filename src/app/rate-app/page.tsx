import { RatingForm } from "@/components/maven/rating-form";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Page() {
  const cookieStore = await cookies();
  const hasSubmitted = cookieStore.has("rating_has_submitted");

  return (
    <main className="flex min-h-dvh flex-col font-(family-name:--font-satoshi)">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <RatingForm initialHasSubmitted={hasSubmitted} />
      </div>
      <footer className="border-t">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <Link
            href="/chat"
            className="transition-colors hover:text-foreground"
          >
            Back to Maven
          </Link>
          <Link
            href="https://github.com/rizzzky78"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub · @rizzzky78
          </Link>
        </div>
      </footer>
    </main>
  );
}
