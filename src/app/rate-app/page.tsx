/* eslint-disable @next/next/no-img-element */
import { RatingForm } from "@/components/maven/rating-form";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const hasSubmitted = cookieStore.has("marketMavenRatingSubmitted");

  return (
    <main className="w-full my-10 mx-auto flex flex-col max-w-4xl space-y-40 mt-14">
      <div className="w-full *:font-serif">
        <div className="text-black/80 dark:text-white flex justify-start">
          <div className="p-6">
            <h1 className="text-xl lg:text-3xl font-bold tracking-tight">
              My First AI-Integrated Application:
              <span className="block mt-1 text-purple-400 dark:text-purple-200">
                A Personal Journey
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full *:font-serif">
        <div className="flex justify-end">
          <div className="w-full flex flex-col items-end">
            <div className="relative size-[80vw] xl:size-[70vh]">
              <svg className="clipppy absolute -top-[999px] -left-[999px] w-0 h-0">
                <defs>
                  <clipPath
                    id="clip-pattern"
                    clipPathUnits={"objectBoundingBox"}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.71161 0H0V1H0.0362048C0.236734 1 0.42296 0.940031 0.577199 0.837408H0.74407V0.718826H0.888889V0.5H1V0.0562347V0H0.71161Z"
                      fill="#D9D9D9"
                    />
                  </clipPath>
                </defs>
              </svg>
              <figure style={{ clipPath: "url(#clip-pattern)" }}>
                <img
                  src="/rate-img-5.jpg"
                  alt="image-inset-clip-path"
                  className="transition-all duration-300  aspect-[4/5] min-h-full align-bottom object-cover  hover:scale-110 w-full"
                />
              </figure>
            </div>
            <p className="text-lg max-w-2xl mx-3 p-4 -mt-20 z-10 bg-white/20 dark:bg-black/20">
              This is the first AI-integrated application I&apos;ve developed,
              and it represents a significant milestone in my learning journey.
              Coming from a background of creating traditional chatbot
              applications, diving into agentic AI was challenging but
              incredibly rewarding. Understanding the intricacies of AI
              technology took considerable time and effort.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full *:font-serif">
        <div className="flex justify-start">
          <div className="w-full flex flex-col items-start">
            <div className="relative size-[80vw] xl:size-[70vh]">
              <svg className="clipppy absolute -top-[999px] -left-[999px] w-0 h-0">
                <defs>
                  <clipPath
                    id="clip-pattern6"
                    clipPathUnits={"objectBoundingBox"}
                  >
                    <path
                      d="M0 1H0.152466C0.185351 0.960002 0.327354 0.884713 0.505232 0.884713C0.683109 0.884713 0.818635 0.968237 0.849028 1H1V0.347104C0.985052 0.222406 0.838565 0.00477544 0.497758 6.98837e-05C0.156951 -0.00463567 0.0239163 0.229466 0 0.347104V1Z"
                      fill="#D9D9D9"
                    />
                  </clipPath>
                </defs>
              </svg>
              <figure style={{ clipPath: "url(#clip-pattern6)" }}>
                <img
                  src="/rate-img-2.jpg"
                  alt="image-inset-clip-path"
                  className="transition-all duration-300  aspect-[4/5] min-h-full align-bottom object-cover  hover:scale-110 w-full"
                />
              </figure>
            </div>
            <p className="text-lg max-w-2xl mx-3 p-4 -mt-20 z-10 bg-white/20 dark:bg-black/20">
              Currently, I&apos;m working odd jobs to make ends meet, with an
              income that barely covers my daily expenses. This application is
              more than just a technical project—it&apos;s a potential stepping
              stone towards a more stable career in technology. By showcasing my
              ability to develop AI-integrated solutions, I hope to attract
              potential employers and open up new professional opportunities.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full *:font-serif">
        <div className="flex justify-end">
          <div className="w-full flex flex-col items-end">
            <div className="relative size-[80vw] xl:size-[70vh]">
              <svg className="clipppy absolute -top-[999px] -left-[999px] w-0 h-0">
                <defs>
                  <clipPath
                    id="clip-pattern3"
                    clipPathUnits={"objectBoundingBox"}
                  >
                    <path
                      d="M1 1H0.293592V0.868235H0V0.412941C0.0268256 0.241176 0.256754 0.0822454 0.500745 0C0.788326 0.098025 0.962742 0.26 0.99851 0.409412L1 1Z"
                      fill="#D9D9D9"
                    />
                  </clipPath>
                </defs>
              </svg>
              <figure style={{ clipPath: "url(#clip-pattern3)" }}>
                <img
                  src="/rate-img-3.jpg"
                  alt="image-inset-clip-path"
                  className="transition-all duration-300  aspect-[4/5] min-h-full align-bottom object-cover  hover:scale-110 w-full"
                />
              </figure>
            </div>
            <p className="text-lg max-w-2xl mx-3 p-4 -mt-20 z-10 bg-white/20 dark:bg-black/20">
              My goal is twofold: to create a genuinely useful application and
              to demonstrate my technical skills. This project reflects my
              dedication to learning and my passion for innovative technology.
              I&apos;m hoping that the insights and experience gained from
              developing this application will help me secure a more permanent
              position in the tech industry.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full *:font-serif">
        <div className="flex justify-start">
          <div className="w-full flex flex-col items-start">
            <div className="relative size-[80vw] xl:size-[70vh]">
              <svg className="clipppy absolute -top-[999px] -left-[999px] w-0 h-0">
                <defs>
                  <clipPath
                    id="clip-pattern7"
                    clipPathUnits={"objectBoundingBox"}
                  >
                    <path
                      d="M0 0.578143V0H0.298507C0.725373 0.027027 0.958209 0.27027 1 0.518214V1H0.147761V0.694477H0.061194V0.578143H0Z"
                      fill="#D9D9D9"
                    />
                  </clipPath>
                </defs>
              </svg>
              <figure style={{ clipPath: "url(#clip-pattern7)" }}>
                <img
                  src="/rate-img-4.jpg"
                  alt="image-inset-clip-path"
                  className="transition-all duration-300  aspect-[4/5] min-h-full align-bottom object-cover  hover:scale-110 w-full"
                />
              </figure>
            </div>
            <p className="text-lg max-w-2xl mx-3 p-4 -mt-20 z-10 bg-white/40 dark:bg-black/20">
              This application is not just a product, but a reflection of my
              professional growth and aspirations. I&apos;m excited to see where
              this journey takes me and how it might contribute to my future
              career development.
            </p>
          </div>
        </div>
      </div>

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
