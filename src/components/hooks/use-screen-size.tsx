"use client";

import { useEffect, useState } from "react";

/**
 * Define breakpoint types for better type safety
 */
export type Breakpoint = "default" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Interface for screen size state
 */
export type ScreenSize = {
  width: number;
  height: number;
  breakpoint: Breakpoint;
};

/**
 * Breakpoint width thresholds in pixels
 */
const BREAKPOINTS: Record<Exclude<Breakpoint, "default">, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * A hook that provides current screen dimensions and responsive breakpoint
 * @returns Current screen dimensions and detected breakpoint
 */
export function useScreenSize(): ScreenSize {
  // Initialize with safe default values for SSR
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    breakpoint: "default",
  });

  useEffect(() => {
    /**
     * Function to determine breakpoint based on width
     */
    const getBreakpoint = (width: number): Breakpoint => {
      // Start with default and check each breakpoint in ascending order
      if (width >= BREAKPOINTS["2xl"]) return "2xl";
      if (width >= BREAKPOINTS.xl) return "xl";
      if (width >= BREAKPOINTS.lg) return "lg";
      if (width >= BREAKPOINTS.md) return "md";
      if (width >= BREAKPOINTS.sm) return "sm";

      return "default";
    };

    /**
     * Function to update screen size and breakpoint
     */
    const updateScreenSize = (): void => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getBreakpoint(width);

      setScreenSize({ width, height, breakpoint });
    };

    // Set initial size
    updateScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", updateScreenSize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return screenSize;
}
