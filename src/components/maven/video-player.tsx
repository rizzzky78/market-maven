"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface VideoPlayerProps {
  url: string;
  className?: string;
}

export default function VideoPlayer({ url, className = "" }: VideoPlayerProps) {
  const playerRef = useRef<typeof ReactPlayer>(null);

  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${className}`}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={true}
        loop={true}
        muted={true}
        playsinline={true}
        controls={false}
        config={{
          file: {
            attributes: {
              controlsList: "nodownload",
              disablePictureInPicture: true,
            },
          },
        }}
      />
    </div>
  );
}
