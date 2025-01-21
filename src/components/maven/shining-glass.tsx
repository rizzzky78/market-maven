"use client";

import React from "react";
import { motion } from "framer-motion";

interface ShiningGlassTextProps {
  text: string;
}

export const ShiningGlassText: React.FC<ShiningGlassTextProps> = ({ text }) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <motion.h1
        className="text-6xl relative overflow-hidden glass-text rounded-full px-6 py-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {text.split(" ").map((word, wordIndex) => (
          <React.Fragment key={wordIndex}>
            {wordIndex > 0 && " "}
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={`${wordIndex}-${charIndex}`}
                className="inline-block animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: (wordIndex * word.length + charIndex) * 0.05,
                }}
              >
                {char}
              </motion.span>
            ))}
          </React.Fragment>
        ))}
        <motion.span
          className="absolute inset-0 shine"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        />
      </motion.h1>
    </div>
  );
};
