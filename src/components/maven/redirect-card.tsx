"use client";

import { FC, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface RedirectCardProps {
  redirectTo: string;
  redirectDelay?: number;
  message?: string;
}

export const RedirectCard: FC<RedirectCardProps> = ({
  redirectTo,
  redirectDelay = 3000,
  message = "You are already logged in, redirecting to App",
}) => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + redirectDelay;

    const updateProgress = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const newProgress = Math.min((elapsed / redirectDelay) * 100, 100);
      setProgress(newProgress);

      if (currentTime < endTime) {
        requestAnimationFrame(updateProgress);
      } else {
        router.push(redirectTo);
      }
    };

    const animation = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animation);
  }, [redirectDelay, redirectTo, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-3 lg:px-0">
      <Card className="rounded-3xl bg-background w-full max-w-4xl mx-auto overflow-hidden shadow-lg">
        <CardContent className="p-6">
          <div className="h-1 bg-gray-200 mt-[40px] mb-4">
            <div
              className="rounded h-full bg-purple-500 transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center">
              <h3 className="py-[40px] font-[family-name:var(--font-array)] text-4xl font-semibold tracking-wider text-black/90 dark:text-white/90">
                {message}
              </h3>
              <p className="text-xl mt-1 font-[family-name:var(--font-khand)]">
                Redirecting in{" "}
                {Math.ceil(
                  (redirectDelay - (progress / 100) * redirectDelay) / 1000
                )}{" "}
                seconds...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
