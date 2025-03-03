"use client";

import type React from "react";

import { FC, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedSection: FC<AnimatedSectionProps> = ({
  children,
  delay = 0.1,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="py-4"
    >
      {children}
    </motion.div>
  );
};
