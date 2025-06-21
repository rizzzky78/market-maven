"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { FC } from "react";
import { MagneticWrapper } from "../ui/magnetic-wrapper";
import { StaggerText } from "../ui/stagger-text";

// Animation variants for better organization
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

interface AnimatedTextProps {
  text: string;
  className?: string;
  highlightColor?: string;
}

const AnimatedText: FC<AnimatedTextProps> = ({
  text,
  className,
  highlightColor = "text-purple-500",
}) => {
  // Split text into words
  const words = text.split(" ");

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => {
        // Check if word should be highlighted
        const isHighlight = word === "AI" || word === "Smarter";

        return (
          <motion.span
            key={i}
            className="inline-block mx-1"
            variants={itemVariants}
          >
            <span className={isHighlight ? highlightColor : ""}>{word}</span>
          </motion.span>
        );
      })}
    </motion.span>
  );
};

export const HeroSection: FC = () => {
  return (
    <section className="*:font-sans min-h-screen container flex flex-col justify-center mx-auto pb-20 px-4 md:px-6">
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6"
        >
          <motion.h1
            variants={itemVariants}
            className="mt-[50px] lg:mt-0 font-[family-name:var(--font-array)] text-5xl md:text-5xl lg:text-7xl font-semibold tracking-widest"
          >
            <AnimatedText text="AI for Smarter Electronic Product Choices" />
          </motion.h1>
          <StaggerText animateOnScroll>
            <p className="text-2xl lg:text-3xl text-black/80 dark:text-white/80 font-[family-name:var(--font-khand)]">
              From research to recommendations, Maven helps you{" "}
              <span className="text-purple-400">find</span>,{" "}
              <span className="text-purple-400">compare</span>, and understand
              products with ease.
            </p>
          </StaggerText>
          <motion.div
            className="flex flex-row gap-4 font-[family-name:var(--font-khand)]"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <MagneticWrapper>
                <Button
                  variant={"secondary"}
                  className="p-[30px] text-lg rounded-full bg-purple-500 text-white/90 hover:text-purple-500 hover:bg-white/90"
                >
                  <Link href={"/register"}>Try Maven Now</Link>
                </Button>
              </MagneticWrapper>
            </motion.div>

            <motion.div variants={itemVariants}>
              <MagneticWrapper>
                <Button
                  variant={"link"}
                  className="p-[30px] text-lg text-purple-500 hover:text-purple-400"
                >
                  <Link href={"/cookbook"}>Learn More</Link>
                </Button>
              </MagneticWrapper>
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-[80px] lg:mt-0 relative h-[400px] w-full flex justify-center"
        >
          <svg
            className="coolshapes polygon-7 "
            height="400"
            width="400"
            fill="none"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#cs_clip_1_polygon-7)">
              <mask
                height="200"
                id="cs_mask_1_polygon-7"
                style={{ maskType: "alpha" }}
                width="182"
                x="9"
                y="0"
                maskUnits="userSpaceOnUse"
              >
                <path
                  d="M86.449 3.601a27.296 27.296 0 0127.102 0l63.805 36.514C185.796 44.945 191 53.9 191 63.594v72.812c0 9.694-5.204 18.649-13.644 23.479l-63.805 36.514a27.3 27.3 0 01-27.102 0l-63.805-36.514C14.204 155.055 9 146.1 9 136.406V63.594c0-9.694 5.204-18.649 13.644-23.48L86.45 3.602z"
                  fill="#fff"
                />
              </mask>
              <g mask="url(#cs_mask_1_polygon-7)">
                <path d="M200 0H0v200h200V0z" fill="#fff" />
                <path d="M200 0H0v200h200V0z" fill="#0E6FFF" />
                <g filter="url(#filter0_f_748_4355)">
                  <path d="M209 126H-9v108h218V126z" fill="#8F5BFF" />
                  <ellipse cx="87" cy="57.5" fill="#00F0FF" rx="59" ry="34.5" />
                </g>
              </g>
            </g>
            <g
              style={{ mixBlendMode: "overlay" }}
              mask="url(#cs_mask_1_polygon-7)"
            >
              <path
                d="M200 0H0v200h200V0z"
                fill="gray"
                stroke="transparent"
                filter="url(#cs_noise_1_polygon-7)"
              />
            </g>
            <defs>
              <filter
                height="331"
                id="filter0_f_748_4355"
                width="338"
                x="-69"
                y="-37"
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
                  result="effect1_foregroundBlur_748_4355"
                  stdDeviation="30"
                />
              </filter>
              <clipPath id="cs_clip_1_polygon-7">
                <path d="M0 0H200V200H0z" fill="#fff" />
              </clipPath>
            </defs>
            <defs>
              <filter
                height="100%"
                id="cs_noise_1_polygon-7"
                width="100%"
                x="0%"
                y="0%"
                filterUnits="objectBoundingBox"
              >
                <feBlend result="out3" in="SourceGraphic" in2="out2" />
              </filter>
            </defs>
          </svg>
        </motion.div>
      </div>
    </section>
  );
};
