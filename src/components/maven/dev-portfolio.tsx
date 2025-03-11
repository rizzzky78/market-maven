"use client";

import { useState, useEffect, FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, CodeXml, Laptop, Sparkles } from "lucide-react";

export const DevPortfolio: FC = () => {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(66);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl w-full space-y-10 text-center"
      >
        {/* Animated Icon Group */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="flex justify-center"
        >
          <div className="relative inline-flex items-center justify-center h-24 w-24">
            <motion.div
              animate={{
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut",
              }}
              className="text-purple-600 dark:text-purple-500"
              aria-hidden="true"
            >
              <Laptop size={86} strokeWidth={1.5} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7, ease: "easeInOut" }}
              className="absolute top-0 -right-5"
              aria-hidden="true"
            >
              <CodeXml size={32} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1, duration: 0.7, ease: "easeInOut" }}
              className="absolute bottom-0 -left-6"
              aria-hidden="true"
            >
              <Sparkles size={32} />
            </motion.div>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-2"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-500 dark:from-purple-400 dark:to-purple-600">
            Dev Portfolio
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto max-w-xs"
          />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-5"
        >
          <h2 className="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-200">
            Under Construction
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
            I&apos;m currently building something amazing. Check back soon to
            see my latest projects and skills.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="pt-4"
        >
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full max-w-md mx-auto overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{
                width: `${progress}%`,
                transition: { delay: 1, duration: 1.5, ease: "easeInOut" },
              }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
            />
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                x: ["0%", "100%"],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
              className="absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-purple-200 to-transparent rounded-full"
              style={{ filter: "blur(8px)" }}
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            {progress}% Complete
          </p>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="pt-6"
        >
          <AnimatePresence>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "React",
                "Next.js",
                "TypeScript",
                "Tailwind CSS",
                "Framer Motion",
              ].map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.2 + index * 0.1,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-1.5 text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 rounded-full shadow-sm"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};
