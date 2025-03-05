"use client";

import { motion } from "framer-motion";
import React, { FC } from "react";
import Image from "next/image";

interface SectionProps {
  imageSrc: string;
  text: string;
  direction: "left" | "right";
  clipPathId: string;
  clipPathData: string;
}

const Section: FC<SectionProps> = ({
  imageSrc,
  text,
  direction,
  clipPathId,
  clipPathData,
}) => {
  return (
    <div className="w-full *:font-serif">
      <div
        className={`flex ${
          direction === "left" ? "justify-start" : "justify-end"
        }`}
      >
        <div
          className={`w-full flex flex-col ${
            direction === "left" ? "items-start" : "items-end"
          }`}
        >
          {/* Image Container with Animation */}
          <motion.div
            initial={{
              opacity: 0,
              x: direction === "left" ? -100 : 100,
              scale: 0.9,
            }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="relative size-[80vw] xl:size-[70vh]"
          >
            <svg className="clipppy absolute -top-[999px] -left-[999px] w-0 h-0">
              <defs>
                <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d={clipPathData}
                    fill="#D9D9D9"
                  />
                </clipPath>
              </defs>
            </svg>
            <figure style={{ clipPath: `url(#${clipPathId})` }}>
              <Image
                src={imageSrc}
                alt="image-inset-clip-path"
                width={600}
                height={600}
                className="transition-all duration-300 aspect-[4/5] min-h-full align-bottom object-cover hover:scale-110 w-full"
              />
            </figure>
          </motion.div>

          {/* Text with Animation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="text-lg max-w-2xl mx-3 p-4 -mt-20 z-10 bg-white/20 dark:bg-black/20"
          >
            {text}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export const RateApp: FC = () => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="w-full *:font-serif"
      >
        <div className="text-black/80 dark:text-white flex justify-start">
          <div className="p-6">
            <h1 className="text-xl lg:text-3xl font-bold tracking-tight">
              My First AI-Integrated Application:
              <span className="block mt-1 text-purple-500">
                A Personal Journey
              </span>
            </h1>
          </div>
        </div>
      </motion.div>
      <Section
        imageSrc="/temp-2.jpg"
        text="This is the first AI-integrated application I've developed, and it represents a significant milestone in my learning journey. Coming from a background of creating traditional chatbot applications, diving into agentic AI was challenging but incredibly rewarding. Understanding the intricacies of AI technology took considerable time and effort."
        direction="right"
        clipPathId="clip-pattern"
        clipPathData="M0.71161 0H0V1H0.0362048C0.236734 1 0.42296 0.940031 0.577199 0.837408H0.74407V0.718826H0.888889V0.5H1V0.0562347V0H0.71161Z"
      />
      <Section
        imageSrc="/temp-1.jpg"
        text="Currently, I'm working odd jobs to make ends meet, with an income that barely covers my daily expenses. This application is more than just a technical project—it's a potential stepping stone towards a more stable career in technology. By showcasing my ability to develop AI-integrated solutions, I hope to attract potential employers and open up new professional opportunities."
        direction="left"
        clipPathId="clip-pattern6"
        clipPathData="M0 1H0.152466C0.185351 0.960002 0.327354 0.884713 0.505232 0.884713C0.683109 0.884713 0.818635 0.968237 0.849028 1H1V0.347104C0.985052 0.222406 0.838565 0.00477544 0.497758 6.98837e-05C0.156951 -0.00463567 0.0239163 0.229466 0 0.347104V1Z"
      />
      <Section
        imageSrc="/temp-3.jpg"
        text="My goal is twofold: to create a genuinely useful application and to demonstrate my technical skills. This project reflects my dedication to learning and my passion for innovative technology. I'm hoping that the insights and experience gained from developing this application will help me secure a more permanent position in the tech industry."
        direction="right"
        clipPathId="clip-pattern3"
        clipPathData="M1 1H0.293592V0.868235H0V0.412941C0.0268256 0.241176 0.256754 0.0822454 0.500745 0C0.788326 0.098025 0.962742 0.26 0.99851 0.409412L1 1Z"
      />
      <Section
        imageSrc="/temp-4.jpg"
        text="This application is not just a product, but a reflection of my professional growth and aspirations. I'm excited to see where this journey takes me and how it might contribute to my future career development."
        direction="left"
        clipPathId="clip-pattern7"
        clipPathData="M0 0.578143V0H0.298507C0.725373 0.027027 0.958209 0.27027 1 0.518214V1H0.147761V0.694477H0.061194V0.578143H0Z"
      />
    </div>
  );
};
