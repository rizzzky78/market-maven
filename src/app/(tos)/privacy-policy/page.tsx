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

export default async function PrivacyPolicy() {
  const session = await getServerSession();

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <Card className="w-full max-w-4xl mx-auto bg-transparent border-none *:text-black/80 *:dark:text-white/90">
        <CardHeader className="text-center flex items-center">
          <svg
            className="coolshapes moon-8 max-w-[20rem]"
            height="400"
            width="400"
            fill="none"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#cs_clip_1_moon-8)">
              <mask
                height="200"
                id="cs_mask_1_moon-8"
                style={{ maskType: "alpha" }}
                width="200"
                x="0"
                y="0"
                maskUnits="userSpaceOnUse"
              >
                <path
                  d="M170.71 170.711A100.001 100.001 0 01100 200v-99.775C99.877 127.736 77.54 150 50 150c-27.614 0-50-22.386-50-50s22.386-50 50-50c27.54 0 49.878 22.264 50 49.775V0a99.999 99.999 0 0170.71 170.711z"
                  fill="#fff"
                />
              </mask>
              <g mask="url(#cs_mask_1_moon-8)">
                <path d="M200 0H0v200h200V0z" fill="#fff" />
                <path
                  d="M200 0H0v200h200V0z"
                  fill="#907CFF"
                  fillOpacity="0.6"
                />
                <g filter="url(#filter0_f_748_4488)">
                  <path d="M212.25-20H100v139.75h112.25V-20z" fill="#18A0FB" />
                  <path d="M129.875 0H11v128.25h118.875V0z" fill="#907CFF" />
                  <path d="M84 75v142h136V75H84z" fill="#EE46D3" />
                </g>
              </g>
            </g>
            <g
              style={{ mixBlendMode: "overlay" }}
              mask="url(#cs_mask_1_moon-8)"
            >
              <path
                d="M200 0H0v200h200V0z"
                fill="gray"
                stroke="transparent"
                filter="url(#cs_noise_1_moon-8)"
              />
            </g>
            <defs>
              <filter
                height="397"
                id="filter0_f_748_4488"
                width="369"
                x="-69"
                y="-100"
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
                  result="effect1_foregroundBlur_748_4488"
                  stdDeviation="40"
                />
              </filter>
              <clipPath id="cs_clip_1_moon-8">
                <path d="M0 0H200V200H0z" fill="#fff" />
              </clipPath>
            </defs>
            <defs>
              <filter
                height="100%"
                id="cs_noise_1_moon-8"
                width="100%"
                x="0%"
                y="0%"
                filterUnits="objectBoundingBox"
              >
                <feBlend result="out3" in="SourceGraphic" in2="out2" />
              </filter>
            </defs>
          </svg>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          <CardDescription>
            Effective Date: Feb 2025 <br />
            This Privacy Policy explains how Market Maven (&quot;App&quot;)
            collects, uses, and protects your data. By using this App, you agree
            to the practices described below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type={"multiple"} className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                1. Scope and Purpose
              </AccordionTrigger>
              <AccordionContent>
                Market Maven is an experimental, open-source AI-powered
                electronic product assistant. This Privacy Policy applies to all
                data collected during your use of the App. The App is part of a
                developer portfolio and is not intended for production use.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                2. Data We Collect
              </AccordionTrigger>
              <AccordionContent>
                <p>The App collects the following data:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    <strong>User Inputs</strong>: Text-based queries, product
                    comparisons, and chat interactions.
                  </li>
                  <li>
                    <strong>Usage Data</strong>: Information about your
                    interactions with the App, such as search history, session
                    duration, and feature usage.
                  </li>
                  <li>
                    <strong>Technical Data</strong>: Device information (e.g.,
                    browser type, IP address) for operational and security
                    purposes.
                  </li>
                </ul>
                <p className="mt-4 font-semibold">What We Do Not Collect:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    Personally Identifiable Information (PII) such as names,
                    email addresses, or payment details.
                  </li>
                  <li>Images, files, or any multimedia content.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                3. How We Use Your Data
              </AccordionTrigger>
              <AccordionContent>
                <p>Your data is used for the following purposes:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    To provide and improve the App&apos;s functionality,
                    including AI-generated recommendations and product
                    comparisons.
                  </li>
                  <li>To analyze usage patterns and optimize performance.</li>
                  <li>
                    To ensure compliance with legal obligations and protect
                    against misuse.
                  </li>
                </ul>
                <p className="mt-4 font-semibold">AI and Data Processing:</p>
                <p>
                  The App uses the
                  <Link
                    href={"https://sdk.vercel.ai/docs/ai-sdk-rsc"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mx-1"
                  >
                    Vercel AI SDK RSC
                  </Link>
                  (experimental) for server-side processing. Data may be
                  temporarily stored for analysis but is not used to train
                  third-party models.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                4. Data Sharing and Disclosure
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Your data is not shared with third parties except in the
                  following cases:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    <strong>Public Sharing</strong>: If you choose to share
                    product searches, comparisons, or chat sessions publicly,
                    the shared content will be accessible via unique links.
                  </li>
                  <li>
                    <strong>Legal Requirements</strong>: Data may be disclosed
                    if required by law or to protect the rights and safety of
                    others.
                  </li>
                </ul>
                <p className="mt-4 font-semibold">No Commercial Use:</p>
                <p>
                  Your data will not be sold, rented, or used for commercial
                  purposes.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                5. Data Security
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  We implement reasonable security measures to protect your
                  data, including:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Encryption of data in transit.</li>
                  <li>
                    Regular security reviews of the App&apos;s infrastructure.
                  </li>
                </ul>
                <p className="mt-4 font-semibold">Limitations:</p>
                <p>
                  No system is entirely secure. While we strive to protect your
                  data, we cannot guarantee absolute security.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">
                6. Data Retention
              </AccordionTrigger>
              <AccordionContent>
                <p>Your data is retained only as long as necessary:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    User inputs and usage data are stored temporarily for
                    analysis and deleted periodically.
                  </li>
                  <li>
                    Publicly shared content (e.g., product comparisons) may
                    persist until manually removed or the App is discontinued.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-semibold">
                7. Your Rights
              </AccordionTrigger>
              <AccordionContent>
                <p>You have the following rights regarding your data:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    <strong>Access</strong>: Request a copy of your data stored
                    by the App.
                  </li>
                  <li>
                    <strong>Deletion</strong>: Request deletion of your data,
                    excluding publicly shared content.
                  </li>
                  <li>
                    <strong>Opt-Out</strong>: Discontinue use of the App if you
                    do not agree with this policy.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg font-semibold">
                8. Third-Party Links
              </AccordionTrigger>
              <AccordionContent>
                The App may include links to third-party websites or platforms.
                We are not responsible for their privacy practices or content.
                Use third-party services at your own risk.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger className="text-lg font-semibold">
                9. Changes to This Policy
              </AccordionTrigger>
              <AccordionContent>
                This Privacy Policy may be updated periodically. Continued use
                of the App after changes constitutes acceptance of the revised
                policy. Significant changes will be communicated via the App or
                repository.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger className="text-lg font-semibold">
                10. Contact Us
              </AccordionTrigger>
              <AccordionContent>
                For questions or concerns about this Privacy Policy, contact:
                <span className="ml-1 font-semibold">rizzzky78@gmail.com</span>
                <br />
                Report issues or contribute to the project via the
                <Link
                  href="https://github.com/rizzzky78/market-maven"
                  className="text-blue-600 hover:underline ml-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub repository
                </Link>
                .
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-center mt-6 space-x-5">
            <Button asChild variant={"ghost"} className="rounded-full">
              <Link href="/terms-of-service">View Terms of Service</Link>
            </Button>
            <Button asChild variant={"ghost"} className="rounded-full">
              <Link href={session ? "/chat" : "/login"}>
                {session ? "Go to App" : "Go to Login"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
