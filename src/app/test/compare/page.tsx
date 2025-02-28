"use client";

import { FC } from "react";
import { RotateCwSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendationsProps {
  recommendation: {
    name: string;
    productModel: string;
    brand: string;
  }[];
}

const recommendations = {
  recommendation: [
    {
      name: "Samsung Galaxy S23 Ultra",
      productModel: "S23 Ultra",
      brand: "Samsung",
    },
    {
      name: "Google Pixel 7 Pro",
      productModel: "Pixel 7 Pro",
      brand: "Google",
    },
    {
      name: "Apple iPhone 14 Pro",
      productModel: "iPhone 14 Pro",
      brand: "Apple",
    },
    {
      name: "OnePlus 11",
      productModel: "11",
      brand: "OnePlus",
    },
    {
      name: "POCO X7 Pro",
      productModel: "X7 Pro",
      brand: "POCO",
    },
  ],
};
// Animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

const searchVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
};

export const RecommendationAction: FC<RecommendationsProps> = ({
  recommendation,
}) => {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <div className="w-full border-[#1A1A1D] dark:border-inherit border rounded-[2rem] py-1 my-6">
        <div className="absolute ml-5 -mt-4">
          <motion.div
            className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center"
            variants={badgeVariants}
          >
            <RotateCwSquare className="size-4 mr-1 text-purple-400" />
            <p className="text-xs font-semibold">Recommendations</p>
          </motion.div>
        </div>
        <div className="p-4 mt-3 -mb-1">
          <motion.div
            className="flex items-center ml-2 mb-4 text-black/90 dark:text-white/90"
            variants={searchVariants}
          >
            <Search className="w-4 h-4 mr-2" />
            <p className="text-sm font-semibold">
              Quick Search Shortcuts
              <span className="ml-2 font-normal text-muted-foreground">
                (tap to append query search)
              </span>
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-2">
            {recommendation.map((item, index) => (
              <motion.div
                key={item.name}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                custom={index}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto bg-[#1A1A1D]/20 w-full flex flex-col rounded-3xl items-start p-2 text-left hover:bg-muted-foreground/50 dark:hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center">
                    <motion.div
                      className="flex p-2 shrink-0 rounded-2xl bg-[#1A1A1D]/20 dark:bg-muted items-center justify-center text-xs font-normal size-20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <p>{item.brand}</p>
                    </motion.div>
                    <p className="ml-3 text-sm font-medium w-full line-clamp-2">
                      {item.name}
                    </p>
                  </div>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export function RecommendationSkeleton() {
  return (
    <div className="w-full border-[#1A1A1D] dark:border-inherit border rounded-[2rem] py-1">
      <div className="absolute ml-5 -mt-4">
        <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center">
          <RotateCwSquare className="size-4 mr-1 text-purple-400" />
          <p className="text-xs font-semibold">Recommendations</p>
        </div>
      </div>
      <div className="p-4 mt-3 -mb-1">
        <div className="flex items-center ml-2 mb-4 text-black/90 dark:text-white/90">
          <Search className="w-4 h-4 mr-2" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-auto w-full flex flex-col rounded-3xl items-start p-2 text-left"
            >
              <div className="flex items-center w-full">
                <Skeleton className="flex p-2 shrink-0 rounded-2xl size-20" />
                <div className="ml-3 flex flex-col gap-1 w-full">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
      <RecommendationAction recommendation={recommendations.recommendation} />
      <RecommendationSkeleton />
    </div>
  );
}
