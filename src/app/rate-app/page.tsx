// app/rate-app/page.tsx
import { RatingForm } from "@/components/maven/rating-form";
import { Badge } from "@/components/ui/badge";
import { CircleArrowDown } from "lucide-react";
import { cookies } from "next/headers";

export default async function RatingPage() {
  // Check if rating has been submitted via server-side cookie check
  const cookie = await cookies();
  const hasSubmitted = cookie.has("marketMavenRatingSubmitted");

  return (
    <div>
      <main className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8`}>
        <article className="max-w-2xl mt-8 mx-auto rounded-3xl overflow-hidden">
          <header className="px-6 py-4 bg-purple-500">
            <h1 className="text-lg lg:text-2xl font-bold">
              My First AI-Integrated Application:
              <br />A Personal Journey
            </h1>
          </header>
          <div className="text-xs lg:text-base px-6 py-4 space-y-4 leading-relaxed bg-[#212121]">
            <p>
              This is the first AI-integrated application I&apos;ve developed,
              and it represents a significant milestone in my learning journey.
              Coming from a background of creating traditional chatbot
              applications, diving into agentic AI was challenging but
              incredibly rewarding. Understanding the intricacies of AI
              technology took considerable time and effort.
            </p>
            <p>
              Currently, I&apos;m working odd jobs to make ends meet, with an
              income that barely covers my daily expenses. This application is
              more than just a technical project—it&apos;s a potential stepping
              stone towards a more stable career in technology. By showcasing my
              ability to develop AI-integrated solutions, I hope to attract
              potential employers and open up new professional opportunities.
            </p>
            <p>
              My goal is twofold: to create a genuinely useful application and
              to demonstrate my technical skills. This project reflects my
              dedication to learning and my passion for innovative technology.
              I&apos;m hoping that the insights and experience gained from
              developing this application will help me secure a more permanent
              position in the tech industry.
            </p>
            <p>
              This application is not just a product, but a reflection of my
              professional growth and aspirations. I&apos;m excited to see where
              this journey takes me and how it might contribute to my future
              career development.
            </p>
          </div>
        </article>
        <div className="flex items-center justify-center mt-6">
          <Badge
            variant={"outline"}
            className="flex items-center text-sm rounded-3xl"
          >
            <CircleArrowDown className="size-3 mr-1" />
            <span className="font-normal">
              Scroll to bottom for Review Form
            </span>
          </Badge>
        </div>
      </main>
      <div className="flex justify-center items-center min-h-screen p-4">
        <RatingForm initialHasSubmitted={hasSubmitted} />
      </div>
      <div className="mt-8 flex items-center justify-center px-4">
        <div className="max-w-2xl border-purple-500 border-x border-t rounded-t-3xl w-full p-8 h-24">
          <div className="flex items-center justify-between text-xs">
            <p>Github: @rizzzky78</p>
            <p>
              Portfolio:
              <span className="ml-0.5 font-semibold">MarketMaven</span>
            </p>
            <p>Year: 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
