"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

// Define the props for the Progress component
interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  customColor?: string;
}

// Create the Progress component with forwardRef
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, customColor, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={`h-full w-full flex-1 transition-all`}
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`,
        backgroundColor: customColor ?? "#a855f7",
      }}
    />
  </ProgressPrimitive.Root>
));

// Set display name for better debugging
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
