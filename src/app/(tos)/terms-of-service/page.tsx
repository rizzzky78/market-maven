import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { NavigationBar } from "@/components/maven/navigation-bar";
import { Footer } from "@/components/maven/footer";

export default async function TermsOfService() {
  const session = await getServerSession();

  return (
    <div>
      <NavigationBar />
      <div className="sticky top-[70px] right-0 w-full flex justify-center z-[99999]">
        <Link
          href={"https://maven-ai-webpage.vercel.app/"}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <div className="group-hover:translate-y-[10px] transition-all duration-700 border-2 text-lg border-purple-500 h-[60px] w-fit bg-white text-black rounded-full px-4 flex items-center font-semibold">
            <p className="group-hover:text-purple-500 transition-colors duration-300">
              Click here for Maven Webpage v2
            </p>
          </div>
        </Link>
      </div>
      <div className="container mx-auto px-4 py-24">
        <Card className="w-full max-w-6xl mx-auto min-h-screen bg-transparent border-none  *:text-black/80 *:dark:text-white/90">
          <CardHeader className="text-center flex items-center">
            <svg
              className="coolshapes moon-4 max-w-[20rem]"
              height="400"
              width="400"
              fill="none"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#cs_clip_1_moon-4)">
                <mask
                  height="200"
                  id="cs_mask_1_moon-4"
                  style={{ maskType: "alpha" }}
                  width="200"
                  x="0"
                  y="0"
                  maskUnits="userSpaceOnUse"
                >
                  <path
                    d="M27 199.999c-17.334-27.301-27-62.937-27-100C0 62.937 9.666 27.301 27 0v199.999zM200 200a100.003 100.003 0 01-100-100A100.003 100.003 0 01200 0v200zM60.29 175.485C70.51 186.396 82.715 194.701 96 200V0C82.716 5.299 70.51 13.604 60.29 24.515 41.535 44.535 31 71.687 31 100c0 28.312 10.536 55.465 29.29 75.485z"
                    fill="#fff"
                  />
                </mask>
                <g mask="url(#cs_mask_1_moon-4)">
                  <path d="M200 0H0v200h200V0z" fill="#fff" />
                  <path
                    d="M200 0H0v200h200V0z"
                    fill="url(#paint0_linear_748_4527)"
                  />
                  <g filter="url(#filter0_f_748_4527)">
                    <ellipse
                      cx="117.708"
                      cy="149.343"
                      fill="#FF58E4"
                      rx="92.722"
                      ry="73.064"
                      transform="rotate(-33.875 117.708 149.343)"
                    />
                    <ellipse
                      cx="68.482"
                      cy="38.587"
                      fill="#00F0FF"
                      rx="69.531"
                      ry="47.75"
                      transform="rotate(-26.262 68.482 38.587)"
                    />
                  </g>
                </g>
              </g>
              <g
                style={{ mixBlendMode: "overlay" }}
                mask="url(#cs_mask_1_moon-4)"
              >
                <path
                  d="M200 0H0v200h200V0z"
                  fill="gray"
                  stroke="transparent"
                  filter="url(#cs_noise_1_moon-4)"
                />
              </g>
              <defs>
                <filter
                  height="403.182"
                  id="filter0_f_748_4527"
                  width="362.189"
                  x="-77.372"
                  y="-94.144"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood result="BackgroundImageFix" floodOpacity="0" />
                  <feBlend
                    result="shape"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                  />
                  <feGaussianBlur
                    result="effect1_foregroundBlur_748_4527"
                    stdDeviation="40"
                  />
                </filter>
                <linearGradient
                  id="paint0_linear_748_4527"
                  gradientUnits="userSpaceOnUse"
                  x1="158.5"
                  x2="29"
                  y1="12.5"
                  y2="200"
                >
                  <stop stopColor="#0E6FFF" />
                  <stop offset="1" stopColor="#00F0FF" />
                </linearGradient>
                <clipPath id="cs_clip_1_moon-4">
                  <path d="M0 0H200V200H0z" fill="#fff" />
                </clipPath>
              </defs>
              <defs>
                <filter
                  height="100%"
                  id="cs_noise_1_moon-4"
                  width="100%"
                  x="0%"
                  y="0%"
                  filterUnits="objectBoundingBox"
                >
                  <feBlend result="out3" in="SourceGraphic" in2="out2" />
                </filter>
              </defs>
            </svg>
            <CardTitle className="text-6xl pt-6 pb-10 font-bold font-[family-name:var(--font-array)] text-purple-500 tracking-wider">
              Terms of Service
            </CardTitle>
            <CardDescription className="pb-5 text-xl font-[family-name:var(--font-khand)]">
              Please read these terms carefully before using Maven, an
              experimental AI-powered electronic product assistant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 font-[family-name:var(--font-khand)]">
            <Accordion type={"multiple"} className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-3xl font-semibold">
                  1. Introduction
                </AccordionTrigger>
                <AccordionContent className="font-[family-name:var(--font-khand)] text-xl">
                  Welcome to Maven (&quot;App&quot;), a personal portfolio
                  project demonstrating AI capabilities in electronic product
                  analysis. This non-production sample application is open
                  source (Apache 2.0 License) and available at{" "}
                  <Link
                    href="https://github.com/rizzzky78/market-maven"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    GitHub repository
                  </Link>
                  . By using this App, you agree to these Terms. Discontinue use
                  if you disagree.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-3xl font-semibold">
                  2. Description of Services
                </AccordionTrigger>
                <AccordionContent className="font-[family-name:var(--font-khand)] text-xl">
                  <p>The App provides:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>
                      <strong>Electronic Product Search</strong>: Search within
                      electronics category only
                    </li>
                    <li>
                      <strong>AI Recommendations</strong>: Contextual
                      suggestions for electronics
                    </li>
                    <li>
                      <strong>Product Comparisons</strong>: One-to-one product
                      analysis with insights
                    </li>
                    <li>
                      <strong>Shareable Results</strong>: Generate public links
                      for searches, details, and comparisons
                    </li>
                    <li>
                      <strong>Chat Sharing</strong>: Option to publish private
                      chats publicly
                    </li>
                  </ul>

                  <p className="mt-4 font-semibold">Key Limitations:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>
                      Experimental Vercel AI RSC SDK used - all processing
                      occurs server-side
                    </li>
                    <li>
                      Chat sessions have length restrictions to optimize token
                      usage
                    </li>
                    <li>No image/file attachments supported</li>
                    <li>Comparison limited to 2 products at a time</li>
                    <li>
                      Data may be incomplete/outdated - verify independently
                    </li>
                    <li>Shared content becomes public - use discretion</li>
                    <li>No affiliation with any marketplace or retailer</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-3xl font-semibold">
                  3. User Responsibilities
                </AccordionTrigger>
                <AccordionContent className="font-[family-name:var(--font-khand)] text-xl">
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Use only for personal, non-commercial purposes</li>
                    <li>Keep chat sessions concise due to token limitations</li>
                    <li>Verify critical information before making decisions</li>
                    <li>
                      Assume full responsibility for shared public content
                    </li>
                    <li>
                      No reverse engineering or unauthorized access attempts
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-3xl font-semibold">
                  4. Intellectual Property
                </AccordionTrigger>
                <AccordionContent className="font-[family-name:var(--font-khand)] text-xl">
                  <p>
                    Codebase licensed under Apache 2.0 - see repository for
                    details. AI-generated content has no ownership claims - use
                    at your own risk. Original App content (UI, code structure)
                    remains developer property.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-3xl font-semibold">
                  5. Experimental Nature
                </AccordionTrigger>
                <AccordionContent className="font-[family-name:var(--font-khand)] text-xl">
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>
                      <Link
                        href={"https://sdk.vercel.ai/docs/ai-sdk-rsc"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline mr-1"
                      >
                        Vercel AI SDK RSC
                      </Link>
                      is in beta - unexpected behavior may occur
                    </li>
                    <li>
                      UI elements rendered server-side - customizations limited
                    </li>
                    <li>Response quality may vary between sessions</li>
                    <li>No uptime or performance guarantees</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-3xl font-semibold">
                  6. Liability & Warranty
                </AccordionTrigger>
                <AccordionContent className="font-[family-name:var(--font-khand)] text-xl">
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Provided &quot;as-is&quot; without warranties</li>
                    <li>No liability for decisions made using App data</li>
                    <li>Not responsible for public shared content</li>
                    <li>Electronics data may contain errors/omissions</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-3xl font-semibold">
                  7. Changes & Termination
                </AccordionTrigger>
                <AccordionContent className="font-[family-name:var(--font-khand)] text-xl">
                  Terms may change without notice. Service may be
                  modified/discontinued anytime. Shared links may become invalid
                  without warning.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-3xl font-semibold">
                  8. Contact
                </AccordionTrigger>
                <AccordionContent className="font-[family-name:var(--font-khand)] text-xl">
                  For inquiries, you can email me:{" "}
                  <span className="font-semibold">rizzzky78@gmail.com</span>
                  <br />
                  Report issues via
                  <Link
                    href={"https://github.com/rizzzky78/market-maven/issues"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    GitHub repository
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex justify-between pt-[100px] space-x-8">
              <Button
                asChild
                variant={"ghost"}
                className="hover:text-slate-900 hover:bg-slate-200 rounded-full p-[30px] text-xl"
              >
                <Link href="/privacy-policy">View Privacy Policy</Link>
              </Button>
              <Button
                asChild
                variant={"ghost"}
                className="hover:text-slate-900 hover:bg-slate-200 rounded-full p-[30px] text-xl"
              >
                <Link href={session ? "/chat" : "/login"}>
                  {session ? "Go to App" : "Go to Login"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
