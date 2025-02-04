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

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <Card className="w-full max-w-4xl mx-auto bg-transparent border-none">
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
          <CardTitle className="text-3xl font-bold ">Privacy Policy</CardTitle>
          <CardDescription className="">
            Learn how we collect, use, and protect your data when using our
            AI-powered shopping assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type={"multiple"} className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold ">
                1. Introduction
              </AccordionTrigger>
              <AccordionContent className="">
                This Privacy Policy outlines how the App collects, uses, and
                protects your data. By using the App, you consent to the
                practices described herein.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold ">
                2. Data Collection
              </AccordionTrigger>
              <AccordionContent className="">
                <p>The App may collect the following types of data:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    <strong>User Queries</strong>: Text-based queries submitted
                    for product searches.
                  </li>
                  <li>
                    <strong>Usage Data</strong>: Information about how you use
                    the App, such as search frequency and categories.
                  </li>
                </ul>
                <p className="mt-4 font-semibold">No Sensitive Data:</p>
                <p>
                  The App does not collect personally identifiable information
                  (PII) such as names, email addresses, or payment information.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold ">
                3. Use of Data
              </AccordionTrigger>
              <AccordionContent className="">
                <p>The data collected is used to:</p>
                <ol className="list-decimal pl-6 mt-2 space-y-1">
                  <li>
                    Improve the App&apos;s AI recommendations and functionality.
                  </li>
                  <li>
                    Analyze trends and user behavior for performance
                    enhancement.
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold ">
                4. Data Sharing
              </AccordionTrigger>
              <AccordionContent className="">
                The App does not share your data with third parties unless
                required by law or to protect the rights and safety of users.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold ">
                5. Data Security
              </AccordionTrigger>
              <AccordionContent className="">
                The App employs reasonable measures to protect collected data
                from unauthorized access, alteration, or disclosure. However, no
                system is entirely secure, and the App cannot guarantee absolute
                data security.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold ">
                6. Data Retention
              </AccordionTrigger>
              <AccordionContent className="">
                Data collected through the App is stored temporarily for
                analysis and improvement purposes and is deleted periodically.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-semibold ">
                7. Third-Party Links
              </AccordionTrigger>
              <AccordionContent className="">
                The App may display links to third-party websites or platforms.
                The developer is not responsible for the privacy practices or
                content of these external sites.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg font-semibold ">
                8. Changes to the Privacy Policy
              </AccordionTrigger>
              <AccordionContent className="">
                This Privacy Policy may be updated periodically. Continued use
                of the App after such updates constitutes acceptance of the
                revised Privacy Policy.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-9">
              <AccordionTrigger className="text-lg font-semibold ">
                9. Contact Information
              </AccordionTrigger>
              <AccordionContent className="">
                For questions or concerns regarding this Privacy Policy, please
                contact: [Your Contact Information]
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex justify-center mt-6 space-x-5">
            <Button asChild variant={"ghost"} className="rounded-full">
              <Link href="/terms-of-service">View Terms of Service</Link>
            </Button>
            <Button asChild variant={"ghost"} className="rounded-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
