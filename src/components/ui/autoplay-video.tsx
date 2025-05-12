"use client";

import { cn } from "@/lib/utils";
import { useRef, useEffect, FC } from "react";

// Define TypeScript interfaces for props
type AutoplayVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  aspectRatio?: string;
  threshold?: number;
  videoClassName?: string;
};

export const AutoplayVideo: FC<AutoplayVideoProps> = ({
  src,
  poster,
  className,
  aspectRatio = "16/9",
  threshold = 0.5,
  videoClassName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to detect when video is in viewport
  useEffect(() => {
    const currentVideo = videoRef.current;
    const currentContainer = containerRef.current;

    if (!currentVideo || !currentContainer) return;

    // Set up intersection observer for viewport detection
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          currentVideo.play().catch((err) => {
            console.warn("Autoplay prevented:", err);
          });
        } else {
          currentVideo.pause();
        }
      },
      { threshold }
    );

    observer.observe(currentContainer);

    // Cleanup function
    return () => {
      observer.unobserve(currentContainer);
    };
  }, [threshold]);

  return (
    <div className="w-full flex justify-center">
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl"
        style={{ aspectRatio }}
      >
        <div className="w-full flex justify-center">
          {/* Video container with consistent width constraints */}
          <div className={cn("w-full max-w-[1200px] px-2 lg:px-0", className)}>
            <video
              ref={videoRef}
              className={cn("w-full h-full object-contain", videoClassName)}
              src={src}
              poster={poster}
              playsInline
              muted
              loop
              preload="metadata"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
