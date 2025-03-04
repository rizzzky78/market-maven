"use client";

import { cn } from "@/lib/utils";
import { Hexagon, MoveRight, Laptop, Sun, Moon } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Separator } from "../ui/separator";

export const Footer: FC = () => {
  const { setTheme, theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true after the component mounts on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Define base and selected classes for the buttons
  const baseClass =
    "inline-flex items-center justify-center rounded-2xl px-2.5 py-1.5 text-xs font-medium transition-all hover:bg-muted hover:text-foreground";
  const selectedClass = "bg-secondary text-secondary-foreground shadow-sm";

  return (
    <footer className="border-t border-border/40 mt-32 py-12 px-4 md:px-12">
      <div className="container mx-auto">
        <div className=" flex flex-wrap gap-5 xl:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Hexagon className="h-6 w-6 text-purple-500" />
              <span className="text-xl font-bold tracking-tight">Maven AI</span>
            </div>
            <p className="text-black/90 dark:text-white/90">
              Your AI-powered product assistant for smarter decisions.
            </p>
          </div>
          <div className="bg-[#1A1A1D] text-white pt-2 pb-4 px-4 h-fit w-fit">
            <h3 className="font-semibold">Application</h3>
            <Separator className="my-2 bg-purple-500" />
            <ul className="space-y-2 *:text-sm">
              <li>
                <Link
                  href="/features"
                  className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                >
                  <MoveRight className="size-4 shrink-0" />
                  <span>Features</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/cookbook"
                  className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                >
                  <MoveRight className="size-4 shrink-0" />
                  <span>Cookbook</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews"
                  className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                >
                  <MoveRight className="size-4 shrink-0" />
                  <span>Public Reviews</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/workflow"
                  className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                >
                  <MoveRight className="size-4 shrink-0" />
                  <span>Workflow</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="bg-[#1A1A1D] text-white pt-2 pb-4 px-4 h-fit w-fit">
            <h3 className="font-semibold">Legal</h3>
            <Separator className="my-2 bg-purple-500" />
            <ul className="space-y-2 *:text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                >
                  <MoveRight className="size-4 shrink-0" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                >
                  <MoveRight className="size-4 shrink-0" />
                  <span>Terms of Service</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-[#1A1A1D] text-white pt-2 pb-4 px-4 h-fit w-fit">
            <h3 className="font-semibold">Developer Contacts</h3>
            <Separator className="my-2 bg-purple-500" />
            <ul className="space-y-2 *:text-sm">
              <li>
                <Link
                  href="https://www.linkedin.com/in/rizky-agung-prasetyo-544a95251"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                >
                  <svg
                    width="1em"
                    height="1em"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"
                      fill="#0A66C2"
                    />
                  </svg>
                  <span>LinkedIn</span>
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.instagram.com/rizzzkyy78/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    preserveAspectRatio="xMidYMid"
                    viewBox="0 0 256 256"
                  >
                    <path
                      fill="#fff"
                      d="M128 23.064c34.177 0 38.225.13 51.722.745 12.48.57 19.258 2.655 23.769 4.408 5.974 2.322 10.238 5.096 14.717 9.575 4.48 4.479 7.253 8.743 9.575 14.717 1.753 4.511 3.838 11.289 4.408 23.768.615 13.498.745 17.546.745 51.723 0 34.178-.13 38.226-.745 51.723-.57 12.48-2.655 19.257-4.408 23.768-2.322 5.974-5.096 10.239-9.575 14.718-4.479 4.479-8.743 7.253-14.717 9.574-4.511 1.753-11.289 3.839-23.769 4.408-13.495.616-17.543.746-51.722.746-34.18 0-38.228-.13-51.723-.746-12.48-.57-19.257-2.655-23.768-4.408-5.974-2.321-10.239-5.095-14.718-9.574-4.479-4.48-7.253-8.744-9.574-14.718-1.753-4.51-3.839-11.288-4.408-23.768-.616-13.497-.746-17.545-.746-51.723 0-34.177.13-38.225.746-51.722.57-12.48 2.655-19.258 4.408-23.769 2.321-5.974 5.095-10.238 9.574-14.717 4.48-4.48 8.744-7.253 14.718-9.575 4.51-1.753 11.288-3.838 23.768-4.408 13.497-.615 17.545-.745 51.723-.745M128 0C93.237 0 88.878.147 75.226.77c-13.625.622-22.93 2.786-31.071 5.95-8.418 3.271-15.556 7.648-22.672 14.764C14.367 28.6 9.991 35.738 6.72 44.155 3.555 52.297 1.392 61.602.77 75.226.147 88.878 0 93.237 0 128c0 34.763.147 39.122.77 52.774.622 13.625 2.785 22.93 5.95 31.071 3.27 8.417 7.647 15.556 14.763 22.672 7.116 7.116 14.254 11.492 22.672 14.763 8.142 3.165 17.446 5.328 31.07 5.95 13.653.623 18.012.77 52.775.77s39.122-.147 52.774-.77c13.624-.622 22.929-2.785 31.07-5.95 8.418-3.27 15.556-7.647 22.672-14.763 7.116-7.116 11.493-14.254 14.764-22.672 3.164-8.142 5.328-17.446 5.95-31.07.623-13.653.77-18.012.77-52.775s-.147-39.122-.77-52.774c-.622-13.624-2.786-22.929-5.95-31.07-3.271-8.418-7.648-15.556-14.764-22.672C227.4 14.368 220.262 9.99 211.845 6.72c-8.142-3.164-17.447-5.328-31.071-5.95C167.122.147 162.763 0 128 0Zm0 62.27C91.698 62.27 62.27 91.7 62.27 128c0 36.302 29.428 65.73 65.73 65.73 36.301 0 65.73-29.428 65.73-65.73 0-36.301-29.429-65.73-65.73-65.73Zm0 108.397c-23.564 0-42.667-19.103-42.667-42.667S104.436 85.333 128 85.333s42.667 19.103 42.667 42.667-19.103 42.667-42.667 42.667Zm83.686-110.994c0 8.484-6.876 15.36-15.36 15.36-8.483 0-15.36-6.876-15.36-15.36 0-8.483 6.877-15.36 15.36-15.36 8.484 0 15.36 6.877 15.36 15.36Z"
                    />
                  </svg>
                  <span>Instagram</span>
                </Link>
              </li>
              <li>
                <Link
                  href="https://x.com/rizzzky78"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="none"
                    viewBox="0 0 1200 1227"
                  >
                    <path
                      fill="#fff"
                      d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
                    />
                  </svg>
                  <span>X/Twitter</span>
                </Link>
              </li>
              <li>
                <Link
                  href="https://discord.com/users/rizzzu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                >
                  <svg
                    viewBox="0 0 256 199"
                    width="1em"
                    height="1em"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                  >
                    <path
                      d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z"
                      fill="#5865F2"
                    />
                  </svg>
                  <span>Discord</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="inline-flex space-x-1 h-10 items-center justify-center rounded-3xl border border-input bg-background px-1 text-muted-foreground shadow-sm">
              <Button
                variant={"ghost"}
                size={"sm"}
                className={cn(
                  baseClass,
                  isMounted && theme === "system" ? selectedClass : ""
                )}
                onClick={() => setTheme("system")}
                aria-label="System theme"
              >
                <Laptop className="h-4 w-4 text-purple-500" />
                <span>System</span>
              </Button>
              <Button
                variant={"ghost"}
                size={"sm"}
                className={cn(
                  baseClass,
                  isMounted && theme === "light" ? selectedClass : ""
                )}
                onClick={() => setTheme("light")}
                aria-label="Light theme"
              >
                <Sun className="h-4 w-4 text-purple-500" />
                <span>Light</span>
              </Button>
              <Button
                variant={"ghost"}
                size={"sm"}
                className={cn(
                  baseClass,
                  isMounted && theme === "dark" ? selectedClass : ""
                )}
                onClick={() => setTheme("dark")}
                aria-label="Dark theme"
              >
                <Moon className="h-4 w-4 text-purple-500" />
                <span>Dark</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-purple-500 border-t border-border/40 text-center text-muted-foreground">
          <p className="text-sm text-black/90 dark:text-white/80">
            © 2025 Maven AI. Made with ❤ by
            <Link href={"/rzky"} className="ml-1 hover:text-purple-500">
              Rzky
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};
