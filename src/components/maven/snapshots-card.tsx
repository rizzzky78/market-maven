"use client";

import {
  useTransform,
  motion,
  useScroll,
  type MotionValue,
} from "framer-motion";
import { FC, useRef } from "react";
import Image from "next/image";

const projects = [
  {
    title: "App Chat Homepage",
    color: "#1A1A1D",
    src: "/snapshots/app-chat-home.png",
    blur: "/snapshots/blur/app-chat-home.webp",
  },
  {
    title: "Agentic - Recommendator",
    color: "#AA60C8",
    src: "/snapshots/app-chat-0.png",
    blur: "/snapshots/blur/app-chat-0.webp",
  },
  {
    title: "Agentic - Search Product",
    color: "#1A1A1D",
    src: "/snapshots/app-chat-1.png",
    blur: "/snapshots/blur/app-chat-1.webp",
  },
  {
    title: "Agentic - Get Product Details",
    color: "#AA60C8",
    src: "/snapshots/app-chat-2.png",
    blur: "/snapshots/blur/app-chat-2.webp",
  },
  {
    title: "Agentic - Products Comparison",
    color: "#1A1A1D",
    src: "/snapshots/app-chat-3.png",
    blur: "/snapshots/blur/app-chat-3.webp",
  },
  {
    title: "Agentic - Comparison Insight",
    color: "#AA60C8",
    src: "/snapshots/app-chat-4.png",
    blur: "/snapshots/blur/app-chat-4.webp",
  },
];

export function SnapshotCard() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <main className="mb-[30vh]" ref={container}>
      <div>
        <section className="text-purple-500 h-[70vh] w-full grid place-content-center">
          <h1 className="font-[family-name:var(--font-array)] 2xl:text-7xl text-5xl px-8 font-semibold text-center tracking-widest leading-[120%]">
            App Snapshots
          </h1>
        </section>
      </div>

      <section className="text-white w-full">
        {projects.map((project, i) => {
          const targetScale = 1 - (projects.length - i) * 0.05;
          return (
            <Card
              key={`p_${i}`}
              i={i}
              src={project.src}
              blur={project.blur}
              title={project?.title}
              color={project?.color}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </section>
    </main>
  );
}

interface CardProps {
  i: number;
  title: string;
  src: string;
  blur: string;
  color: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

export const Card: FC<CardProps> = ({
  i,
  title,
  src,
  blur,
  color,
  progress,
  range,
  targetScale,
}) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="h-screen flex items-center justify-center sticky top-0"
    >
      <motion.div
        style={{
          backgroundColor: color,
          scale,
          top: `calc(1vh + ${i * 25}px)`,
        }}
        className="flex flex-col relative -top-[25%] h-[230px] xl:h-[640px] w-[97%] lg:w-[80%] rounded-lg lg:rounded-[2rem] border p-2 lg:p-10 origin-top"
      >
        {/* Removed title and text content, keeping only the image */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-[97%] h-[97%] rounded-lg overflow-hidden">
            <motion.div className="w-full h-full" style={{ scale: imageScale }}>
              <Image
                src={src}
                alt={title}
                placeholder="blur"
                blurDataURL={blur}
                height={860}
                width={1440}
                className=""
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
