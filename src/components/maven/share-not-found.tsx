"use client";

import { motion } from "framer-motion";
import { Search, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FC } from "react";

export const ShareNotFound: FC = () => {
  // Animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl w-full space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-purple-100 rounded-full blur-2xl opacity-50"></div>
            <Search className="relative w-20 h-20 text-purple-400 mx-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Oops! We couldn&apos;t find that page
          </h1>
          <p className="text-black/80 dark:text-white/80 max-w-md mx-auto">
            We couldn&apos;t locate the page you&apos;re looking for. The URL
            might be incorrect or the page may have been moved.
          </p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Alert className="rounded-3xl">
            <AlertCircle className="size-5 *:text-red-400 shrink-0" />
            <AlertTitle className="">Invalid Parameters Detected</AlertTitle>
            <AlertDescription className="">
              <span className="text-black/80 dark:text-white/80">
                Please ensure your URL includes valid:
              </span>
              <ul className="list-disc text-black/70 dark:text-white/70 list-inside mt-2 space-y-1 text-sm">
                <li>
                  Type (product-search, product-details, products-comparison, or
                  public-chat)
                </li>
                <li>Component ID must be a valid UUID</li>
              </ul>
            </AlertDescription>
          </Alert>
        </motion.div>
        <motion.div variants={itemVariants} className="text-center">
          <div className="text-sm text-black/90 dark:text-white/90 space-x-4">
            <Link
              href="/chat"
              className="hover:text-purple-600 transition-colors"
            >
              Go Back to App
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-purple-600 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/history"
              className="hover:text-purple-600 transition-colors"
            >
              Chat History
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
