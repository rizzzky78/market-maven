"use client";

import { useRef, useState, useEffect, RefObject, FC } from "react";
import ReactPlayer from "react-player";
import { useIntersectionObserver } from "../hooks/use-intersection-observer";

interface VideoPlayerProps {
  url: string;
  className?: string;
}

export const VideoPlayer: FC<VideoPlayerProps> = ({ url, className = "" }) => {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure rendering happens only on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Detect if the video is in the viewport (50% visible)
  const isVisible = useIntersectionObserver({
    ref: containerRef as RefObject<Element>,
    options: {
      threshold: 0.5,
    },
  });

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-lg ${className}`}
    >
      {isClient && !hasError ? (
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={isVisible} // Play only when in viewport
          loop={true}
          muted={true}
          playsinline={true}
          controls={false}
          onError={() => setHasError(true)}
          config={{
            file: {
              attributes: {
                controlsList: "nodownload",
                disablePictureInPicture: true,
              },
            },
          }}
        />
      ) : hasError ? (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-center">
          <p className="text-gray-700">Video could not be loaded</p>
        </div>
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};
