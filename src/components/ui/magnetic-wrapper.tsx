"use client";

import React, { useRef } from "react";
import { motion, useSpring, useTransform, MotionValue } from "framer-motion";

interface MagneticProps {
  children: React.ReactElement;
}

export function MagneticWrapper({ children }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Create motion values for x and y coordinates
  const x = useSpring(0, { stiffness: 400, damping: 30 }); // Similar to elastic.out
  const y = useSpring(0, { stiffness: 400, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();

    // Calculate distance from the center
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Apply the same 0.35 multiplier as in the GSAP version
    x.set((clientX - centerX) * 0.35);
    y.set((clientY - centerY) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Wrap the child in a motion.div that applies the magnetic effect
  return (
    <motion.div
      ref={ref}
      style={{ x, y, display: "inline-block" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
