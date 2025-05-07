"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Checkbox } from "../ui/checkbox";
import { useRouter } from "next/navigation";
import { FC, ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const LoginForm: FC = () => {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/chat");
    }
  }, [status, router]);

  async function login(provider: string) {
    setIsLoading(true);
    if (!checked) {
      toast("Please accept terms & condition of App!", {
        position: "top-center",
        richColors: true,
        className:
          "font-[family-name:var(--font-array)] text-lg flex justify-center rounded-full border-none text-red-300 dark:text-red-500 bg-[#1A1A1D] dark:bg-white",
      });
      setIsLoading(false);
      return;
    }
    await signIn(provider, { callbackUrl: "/chat" });
    setIsLoading(false);
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className="bg-[#D8D2C2] dark:bg-black rounded-[2rem] w-full border-none lg:pl-6">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <motion.div
                className="w-full flex flex-col items-center lg:items-start text-center lg:text-left"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="font-[family-name:var(--font-array)] text-3xl tracking-wider font-semibold text-black dark:text-white">
                  Login to <span className="text-purple-500">MAVEN AI</span>
                </h1>
                <p className="font-[family-name:var(--font-khand)] text-balance text-lg text-muted-foreground mt-2">
                  Login to your account using your preferred method with
                  <Link
                    href={"https://oauth.net/2/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-500 underline"
                  >
                    OAuth
                  </Link>
                </p>
              </motion.div>
              <div className="grid gap-4 font-[family-name:var(--font-khand)]">
                {authProvider.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={"outline"}
                        className="w-full text-lg rounded-3xl text-black dark:text-white hover:text-white/90 dark:hover:text-black/80 py-6 flex items-center justify-center space-x-2 transition-all hover:bg-primary"
                        onClick={() => login(provider.id)}
                        disabled={isLoading || !provider.enabled}
                      >
                        {provider.node}
                      </Button>
                    </motion.div>
                  </motion.div>
                ))}
                <motion.div
                  className="flex flex-col *:text-xs w-full pt-5 font-[family-name:var(--font-khand)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => setChecked(!checked)}
                        id="terms"
                        className="w-[0.8rem] h-[0.8rem] focus:w-[0.8rem] focus:h-[0.8rem] checked:w-[0.8rem] checked:h-[0.8rem]"
                      />
                    </div>
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Continue accept terms and conditions
                    </label>
                  </div>
                  <div className="pl-5 w-full">
                    <p className="text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                      By clicking continue, you agree to our{" "}
                      <Link href="/terms-of-service">Terms of Service</Link> and{" "}
                      <Link href="/privacy-policy">Privacy Policy</Link>.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          <motion.div
            className="relative hidden md:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Image
              fill
              src="/login-pict.png"
              alt="Login background"
              className="absolute inset-0 h-full w-full object-contain"
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const authProvider: { id: string; node: ReactNode; enabled?: boolean }[] = [
  {
    id: "google",
    enabled: true,
    node: (
      <>
        <svg
          width="256"
          height="262"
          viewBox="0 0 256 262"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid"
        >
          <path
            d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
            fill="#4285F4"
          />
          <path
            d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
            fill="#34A853"
          />
          <path
            d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
            fill="#FBBC05"
          />
          <path
            d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
            fill="#EB4335"
          />
        </svg>
        <span>Google</span>
      </>
    ),
  },
  {
    id: "twitter",
    enabled: false,
    node: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 1200 1227"
        >
          <path
            fill="currentColor"
            d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
          />
        </svg>
        <span>Twitter/X</span>
      </>
    ),
  },
  {
    id: "github",
    enabled: true,
    node: (
      <>
        <svg
          viewBox="0 0 256 250"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid"
        >
          <path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z" />
        </svg>
        <span>GitHub</span>
      </>
    ),
  },
  {
    id: "tiktok",
    enabled: false,
    node: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid"
          viewBox="0 0 256 290"
        >
          <path
            fill="#FF004F"
            d="M189.72022 104.42148c18.67797 13.3448 41.55932 21.19661 66.27233 21.19661V78.08728c-4.67694.001-9.34196-.48645-13.91764-1.4554v37.41351c-24.71102 0-47.5894-7.85181-66.27232-21.19563v96.99656c0 48.5226-39.35537 87.85513-87.8998 87.85513-18.11308 0-34.94847-5.47314-48.93361-14.85978 15.96175 16.3122 38.22162 26.4315 62.84826 26.4315 48.54742 0 87.90477-39.33253 87.90477-87.85712v-96.99457h-.00199Zm17.16896-47.95275c-9.54548-10.4231-15.81283-23.89299-17.16896-38.78453v-6.11347h-13.18894c3.31982 18.92715 14.64335 35.09738 30.3579 44.898ZM69.67355 225.60685c-5.33316-6.9891-8.21517-15.53882-8.20226-24.3298 0-22.19236 18.0009-40.18631 40.20915-40.18631 4.13885-.001 8.2529.6324 12.19716 1.88328v-48.59308c-4.60943-.6314-9.26154-.89945-13.91167-.80117v37.82253c-3.94726-1.25089-8.06328-1.88626-12.20313-1.88229-22.20825 0-40.20815 17.99196-40.20815 40.1873 0 15.6937 8.99747 29.28075 22.1189 35.89954Z"
          />
          <path d="M175.80259 92.84876c18.68293 13.34382 41.5613 21.19563 66.27232 21.19563V76.63088c-13.79353-2.93661-26.0046-10.14114-35.18573-20.16215-15.71554-9.80162-27.03808-25.97185-30.3579-44.898H141.8876v189.84333c-.07843 22.1318-18.04855 40.05229-40.20915 40.05229-13.05889 0-24.66039-6.22169-32.00788-15.8595-13.12044-6.61879-22.1179-20.20683-22.1179-35.89854 0-22.19336 17.9999-40.1873 40.20815-40.1873 4.255 0 8.35614.66217 12.20312 1.88229v-37.82254c-47.69165.98483-86.0473 39.93316-86.0473 87.83429 0 23.91184 9.55144 45.58896 25.05353 61.4276 13.98514 9.38565 30.82053 14.85978 48.9336 14.85978 48.54544 0 87.89981-39.33452 87.89981-87.85612V92.84876h-.00099Z" />
          <path
            fill="#00F2EA"
            d="M242.07491 76.63088V66.51456c-12.4384.01886-24.6326-3.46278-35.18573-10.04683 9.34196 10.22255 21.64336 17.27121 35.18573 20.16315Zm-65.54363-65.06015a67.7881 67.7881 0 0 1-.72869-5.45726V0h-47.83362v189.84531c-.07644 22.12883-18.04557 40.04931-40.20815 40.04931-6.50661 0-12.64987-1.54375-18.09025-4.28677 7.34749 9.63681 18.949 15.8575 32.00788 15.8575 22.15862 0 40.13171-17.9185 40.20915-40.0503V11.57073h34.64368ZM99.96593 113.58077V102.8112c-3.9969-.54602-8.02655-.82003-12.06116-.81805C39.35537 101.99315 0 141.32669 0 189.84531c0 30.41846 15.46735 57.22621 38.97116 72.99536-15.5021-15.83765-25.05353-37.51576-25.05353-61.42661 0-47.90014 38.35466-86.84847 86.0483-87.8333Z"
          />
        </svg>
        <span>TikTok</span>
      </>
    ),
  },
  {
    id: "instagram",
    enabled: false,
    node: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid"
          viewBox="0 0 256 256"
        >
          <path
            fill="currentColor"
            d="M128 23.064c34.177 0 38.225.13 51.722.745 12.48.57 19.258 2.655 23.769 4.408 5.974 2.322 10.238 5.096 14.717 9.575 4.48 4.479 7.253 8.743 9.575 14.717 1.753 4.511 3.838 11.289 4.408 23.768.615 13.498.745 17.546.745 51.723 0 34.178-.13 38.226-.745 51.723-.57 12.48-2.655 19.257-4.408 23.768-2.322 5.974-5.096 10.239-9.575 14.718-4.479 4.479-8.743 7.253-14.717 9.574-4.511 1.753-11.289 3.839-23.769 4.408-13.495.616-17.543.746-51.722.746-34.18 0-38.228-.13-51.723-.746-12.48-.57-19.257-2.655-23.768-4.408-5.974-2.321-10.239-5.095-14.718-9.574-4.479-4.48-7.253-8.744-9.574-14.718-1.753-4.51-3.839-11.288-4.408-23.768-.616-13.497-.746-17.545-.746-51.723 0-34.177.13-38.225.746-51.722.57-12.48 2.655-19.258 4.408-23.769 2.321-5.974 5.095-10.238 9.574-14.717 4.48-4.48 8.744-7.253 14.718-9.575 4.51-1.753 11.288-3.838 23.768-4.408 13.497-.615 17.545-.745 51.723-.745M128 0C93.237 0 88.878.147 75.226.77c-13.625.622-22.93 2.786-31.071 5.95-8.418 3.271-15.556 7.648-22.672 14.764C14.367 28.6 9.991 35.738 6.72 44.155 3.555 52.297 1.392 61.602.77 75.226.147 88.878 0 93.237 0 128c0 34.763.147 39.122.77 52.774.622 13.625 2.785 22.93 5.95 31.071 3.27 8.417 7.647 15.556 14.763 22.672 7.116 7.116 14.254 11.492 22.672 14.763 8.142 3.165 17.446 5.328 31.07 5.95 13.653.623 18.012.77 52.775.77s39.122-.147 52.774-.77c13.624-.622 22.929-2.785 31.07-5.95 8.418-3.27 15.556-7.647 22.672-14.763 7.116-7.116 11.493-14.254 14.764-22.672 3.164-8.142 5.328-17.446 5.95-31.07.623-13.653.77-18.012.77-52.775s-.147-39.122-.77-52.774c-.622-13.624-2.786-22.929-5.95-31.07-3.271-8.418-7.648-15.556-14.764-22.672C227.4 14.368 220.262 9.99 211.845 6.72c-8.142-3.164-17.447-5.328-31.071-5.95C167.122.147 162.763 0 128 0Zm0 62.27C91.698 62.27 62.27 91.7 62.27 128c0 36.302 29.428 65.73 65.73 65.73 36.301 0 65.73-29.428 65.73-65.73 0-36.301-29.429-65.73-65.73-65.73Zm0 108.397c-23.564 0-42.667-19.103-42.667-42.667S104.436 85.333 128 85.333s42.667 19.103 42.667 42.667-19.103 42.667-42.667 42.667Zm83.686-110.994c0 8.484-6.876 15.36-15.36 15.36-8.483 0-15.36-6.876-15.36-15.36 0-8.483 6.877-15.36 15.36-15.36 8.484 0 15.36 6.877 15.36 15.36Z"
          />
        </svg>
        <span>Instagram</span>
      </>
    ),
  },
];
