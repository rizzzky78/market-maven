'use client'

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

// Define the props interface for TypeScript
interface MermaidProps {
  chart: string; // Mermaid syntax as a string
  className?: string; // Optional CSS class for styling
}

// Functional component
export const Mermaid: React.FC<MermaidProps> = ({ chart, className }) => {
  // Ref to the container div
  const mermaidRef = useRef<HTMLDivElement>(null);
  // Unique ID for each diagram instance, stored in a ref to persist across renders
  const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  // Effect to render the diagram when the chart prop changes
  useEffect(() => {
    if (mermaidRef.current) {
      mermaid.render(
        id.current, // Unique ID for this diagram
        chart, // Mermaid syntax
        (svgCode: any) => {
          // Callback receives the rendered SVG
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svgCode;
          }
        }
      );
    }
  }, [chart]); // Re-run effect if chart changes

  // Render the container div
  return <div ref={mermaidRef} className={className} />;
};


