"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, MoveHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ImagePreviewerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ImagePreviewer({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
}: ImagePreviewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isValidExtension, setIsValidExtension] = useState(true);

  // Validate file extension
  useEffect(() => {
    const fileExtension = src.split(".").pop()?.toLowerCase();
    setIsValidExtension(
      ["jpg", "jpeg", "png", "svg"].includes(fileExtension || "")
    );
  }, [src]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSliderChange = (value: number[]) => {
    setScale(value[0]);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Add event listeners for mouse events outside the component
  useEffect(() => {
    const handleMouseUpOutside = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    window.addEventListener("mouseup", handleMouseUpOutside);
    window.addEventListener("touchend", handleMouseUpOutside);

    return () => {
      window.removeEventListener("mouseup", handleMouseUpOutside);
      window.removeEventListener("touchend", handleMouseUpOutside);
    };
  }, [isDragging]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {!isValidExtension ? (
        <div className="flex items-center justify-center bg-muted rounded-lg h-[400px] w-full p-4 text-muted-foreground">
          Unsupported file format. Please use JPG, PNG, or SVG images.
        </div>
      ) : (
        <>
          <div
            ref={containerRef}
            className="relative overflow-hidden bg-white rounded-2xl h-[440px] w-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <div
              className="absolute transition-transform duration-100 ease-out"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: "center",
              }}
            >
              <Image
                src={src || "/placeholder.svg"}
                alt={alt}
                width={width}
                height={height}
                className="pointer-events-none"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  aria-label="Zoom out"
                  className="rounded-full"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>

                <div className="w-[200px] px-2">
                  <Slider
                    value={[scale]}
                    min={0.5}
                    max={3}
                    step={0.1}
                    onValueChange={handleSliderChange}
                    aria-label="Zoom level"
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={scale >= 3}
                  aria-label="Zoom in"
                  className="rounded-full"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                className="flex items-center gap-2 rounded-full"
              >
                <MoveHorizontal className="h-4 w-4 shrink-0" />
                <span>Reset</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
