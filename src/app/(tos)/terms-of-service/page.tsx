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

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto min-h-screen bg-transparent border-none">
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
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          <CardDescription className="">
            Please read these terms carefully before using our AI-powered
            shopping assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type={"multiple"} className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold ">
                1. Introduction
              </AccordionTrigger>
              <AccordionContent className="">
                Welcome to our AI-powered shopping assistant (&quot;App&quot;).
                This App is a personal portfolio project designed to showcase
                advanced AI capabilities in product search and decision-making
                assistance. By using this App, you agree to comply with these
                Terms of Service (&quot;Terms&quot;). If you do not agree with
                these Terms, please refrain from using the App.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold ">
                2. Description of Services
              </AccordionTrigger>
              <AccordionContent className="">
                <p>The App provides the following services:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    <strong>Product Search</strong>: Allows users to search for
                    products across various categories.
                  </li>
                  <li>
                    <strong>Recommendations</strong>: Offers AI-generated
                    product suggestions and recommendations based on user
                    queries.
                  </li>
                  <li>
                    <strong>Product Information</strong>: Fetches and displays
                    detailed information about selected products.
                  </li>
                  <li>
                    <strong>Trend Analysis</strong>: Provides insights into
                    market trends and popular products.
                  </li>
                </ul>
                <p className="mt-4 font-semibold">Limitations:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    The App does not facilitate direct purchases or orders.
                  </li>
                  <li>
                    The App has no official affiliation or partnership with any
                    marketplace or online platform.
                  </li>
                  <li>
                    Data provided by the App is for informational and
                    recommendation purposes only and may not always be accurate
                    or meet user expectations.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold ">
                3. User Responsibilities
              </AccordionTrigger>
              <AccordionContent className="">
                <p>By using this App, you agree to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    Use the App solely for personal, non-commercial purposes.
                  </li>
                  <li>
                    Ensure that any actions you take based on recommendations or
                    information from the App are made at your own discretion.
                  </li>
                  <li>
                    Avoid using the App for unlawful activities, spamming, or
                    malicious purposes.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold ">
                4. Intellectual Property
              </AccordionTrigger>
              <AccordionContent className="">
                The App and its content, including but not limited to text,
                graphics, logos, and code, are the intellectual property of the
                developer unless otherwise stated. You may not reproduce,
                distribute, or exploit any content without prior written
                permission.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold ">
                5. Disclaimer of Warranties
              </AccordionTrigger>
              <AccordionContent className="">
                <p>
                  The App is provided &quot;as is&quot; and &quot;as
                  available&quot; without warranties of any kind, either express
                  or implied. The developer does not guarantee:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    The accuracy, reliability, or completeness of the
                    information provided.
                  </li>
                  <li>
                    That the App will operate without errors or interruptions.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold ">
                6. Limitation of Liability
              </AccordionTrigger>
              <AccordionContent className="">
                <p>
                  The developer shall not be held liable for any damages or
                  losses resulting from:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    Use of or reliance on the App&apos;s recommendations or
                    information.
                  </li>
                  <li>
                    Errors, inaccuracies, or interruptions in the App&apos;s
                    functionality.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-semibold ">
                7. Changes to the Terms
              </AccordionTrigger>
              <AccordionContent className="">
                These Terms may be updated periodically. Continued use of the
                App after such updates constitutes acceptance of the revised
                Terms.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg font-semibold ">
                8. Contact Information
              </AccordionTrigger>
              <AccordionContent className="">
                For questions or concerns regarding these Terms, please contact:
                [Your Contact Information]
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex justify-center mt-6 space-x-5">
            <Button
              asChild
              variant={"ghost"}
              className="hover:text-slate-900 hover:bg-slate-200 rounded-full"
            >
              <Link href="/privacy-policy">View Privacy Policy</Link>
            </Button>
            <Button
              asChild
              variant={"ghost"}
              className="hover:text-slate-900 hover:bg-slate-200 rounded-full"
            >
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
