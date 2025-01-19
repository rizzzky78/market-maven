"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageLoader: React.FC<ImageProps> = ({
  src,
  alt,
  className = "",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {!isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {hasError ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
          Error loading image
        </div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
};
