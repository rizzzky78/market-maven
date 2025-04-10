/* eslint-disable @next/next/no-img-element */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, FlaskConical, Grip, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { FC, Fragment, JSX, memo, useState } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

const containerVariants = {
  initial: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0 },
    },
  },
  animate: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.4 },
      opacity: { duration: 0.3 },
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.4 },
      opacity: { duration: 0.3 },
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

const cardVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const sanitizeStr = (url: string) => {
  const isUrl = url.startsWith("https://");
  if (isUrl) {
    return (
      <div className="rounded-[2rem] block my-1 w-fit px-4 hover:rotate-6 transition-all">
        <Link href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt={`review-${url}`}
            className="size-[8rem] object-cover rounded-3xl"
          />
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-3xl my-0.5 w-fit bg-gray-300 dark:bg-[#4A4947] py-1 pl-2 pr-3">
      <div className="flex items-center space-x-1">
        <Minus className="size-5 shrink-0" /> <p>{url}</p>
      </div>
    </div>
  );
};

const sanitizeKeyName = (input: string) =>
  input
    ? input
        .split("_")
        .filter(Boolean)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ")
    : "there-is-no-keys";

interface ProductComparisonProps {
  callId: string;
  isGenerating?: boolean;
  compare: { title: string; callId: string }[];
  data: Record<string, any>;
}

const PureProductComparison: FC<ProductComparisonProps> = ({
  callId,
  data,
  compare,
  isGenerating,
}) => {
  const [open, setOpen] = useState(true);

  const renderValue = (value: any, key: string): JSX.Element | null => {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return (
        <motion.div
          variants={itemVariants}
          className="px-4 mb-1 flex lg:items-center flex-wrap"
        >
          <div className="rounded-[2rem] bg-gray-400/60 dark:bg-muted py-2 px-4 shrink-0 mr-1">
            <p className="font-medium">{sanitizeKeyName(key)}</p>
          </div>
          <div className="rounded-2xl bg-gray-300 dark:bg-[#4A4947] py-2 px-4">
            <p>{String(value)}</p>
          </div>
        </motion.div>
      );
    } else if (Array.isArray(value)) {
      return (
        <motion.div variants={itemVariants} className="my-1">
          <div className="rounded-[2rem] w-fit bg-[#1A1A1D] py-1 pl-2 pr-8 mb-0.5 mt-1">
            <div className="flex items-center space-x-1 text-white">
              <Plus className="size-5" />
              <p className="font-semibold text-sm">{sanitizeKeyName(key)}:</p>
            </div>
          </div>
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-wrap justify-between"
          >
            {value.map((item, index) => (
              <motion.div
                key={`${key}-${index}`}
                variants={itemVariants}
                className=""
              >
                {typeof item === "object" ? (
                  <div className="">
                    {Object.entries(item).map(([subKey, subValue]) => (
                      <Fragment key={`${key}-${index}-${subKey}`}>
                        {renderValue(subValue, subKey)}
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start">
                    {sanitizeStr(String(item))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      );
    } else if (typeof value === "object" && value !== null) {
      return (
        <motion.div variants={itemVariants} className="my-3">
          <div className="rounded-[2rem] w-fit bg-purple-300 dark:bg-[#FBF5E5] py-1 pl-4 pr-8 my-1">
            <div className="flex items-center space-x-1 text-black">
              <Grip className="size-5" />
              <p className="font-semibold text-sm">{sanitizeKeyName(key)}:</p>
            </div>
          </div>
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="my-2"
          >
            {Object.entries(value).map(([subKey, subValue]) => (
              <Fragment key={`${key}-${subKey}`}>
                {renderValue(subValue, subKey)}
              </Fragment>
            ))}
          </motion.div>
        </motion.div>
      );
    }
    /** Return NULL if no specified key-value  */
    return null;
  };

  const comparison = data as {
    products: Record<string, any>[];
    key_differences: string[];
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className=""
    >
      <div className="flex justify-center">
        <div className="flex items-center justify-between bg-[#1A1A1D] text-white dark:bg-white dark:text-black py-1 px-1 w-full rounded-[2rem]">
          <div className="flex items-center mx-3">
            <FlaskConical
              className={`size-6 text-purple-400 mr-2 ${
                isGenerating ? "animate-spin" : "animate-none"
              }`}
            />
            <div className="w-full">
              <div className="flex flex-col">
                <div className="grid grid-cols-2 gap-1 md:gap-2">
                  {compare.map((v) => (
                    <div key={v.callId} className="">
                      <Link href={`/point/$${v.callId}`}>
                        <h2 className="text-sm font-bold line-clamp-1 hover:text-muted/80">
                          {v.title}
                        </h2>
                      </Link>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-200 dark:text-gray-800">
                  Request ID: {callId ?? "no-call-id"}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant={"ghost"}
            onClick={() => setOpen((prev) => !prev)}
            className="size-10 rounded-full shrink-0"
          >
            <ChevronUp
              className={`transition-all ${open ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
      </div>
      <AnimatePresence mode={"wait"}>
        {open && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="my-3"
          >
            <div className="*:text-xs grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div className="lg:border-r border-y border-[#1A1A1D] dark:border-inherit rounded-3xl px-3 pb-1">
                {Array.isArray(comparison?.products) &&
                  [comparison.products[0]].map(
                    (item: Record<string, any>, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="pt-4"
                      >
                        <motion.div
                          variants={containerVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="space-y-3"
                        >
                          {Object.entries(item).map(([key, value]) => (
                            <Fragment key={key}>
                              {renderValue(value, key)}
                            </Fragment>
                          ))}
                        </motion.div>
                      </motion.div>
                    )
                  )}
              </div>
              <div className="lg:border-l border-y border-[#1A1A1D] dark:border-inherit rounded-3xl px-3 pb-1">
                {Array.isArray(comparison?.products) &&
                  [comparison.products[1]].map(
                    (item: Record<string, any>, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="pt-4"
                      >
                        <motion.div
                          variants={containerVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="space-y-3"
                        >
                          {Object.entries(item).map(([key, value]) => (
                            <Fragment key={key}>
                              {renderValue(value, key)}
                            </Fragment>
                          ))}
                        </motion.div>
                      </motion.div>
                    )
                  )}
              </div>
            </div>
            {Array.isArray(comparison?.key_differences) &&
              comparison.key_differences && (
                <div className="border-y border-[#1A1A1D] dark:border-inherit rounded-3xl px-3 *:text-xs my-2 py-2">
                  <motion.div
                    variants={itemVariants}
                    className="border-t pt-4 first:border-t-0 first:pt-0"
                  >
                    <div className="rounded-[2rem] w-fit bg-[#1A1A1D] py-1 pl-2 pr-8 mb-0.5 mt-1">
                      <div className="flex items-center space-x-1 text-white">
                        <Plus className="size-5" />
                        <p className="font-semibold text-sm">
                          Key Differences:
                        </p>
                      </div>
                    </div>
                    <motion.div
                      variants={containerVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <div>
                        {comparison.key_differences.map(
                          (diff: string, index) => (
                            <motion.div
                              key={index}
                              variants={itemVariants}
                              className=" flex lg:items-center flex-wrap"
                            >
                              {sanitizeStr(diff)}
                            </motion.div>
                          )
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const MemoProductComparison = memo(
  PureProductComparison,
  (prev, next) =>
    prev.callId === next.callId &&
    prev.data === next.data &&
    prev.isGenerating === next.isGenerating
);

interface SkeletonProductComparisonProps {
  callId: string;
  isGenerating?: boolean;
  compare: { title: string; callId: string }[];
}

export const SkeletonProductComparison: FC<SkeletonProductComparisonProps> = ({
  callId,
  isGenerating,
  compare,
}) => {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className=""
    >
      <div className="flex justify-center">
        <div className="flex items-center justify-between bg-[#1A1A1D] text-white dark:bg-white dark:text-black py-1 px-1 w-full rounded-[2rem]">
          <div className="flex items-center mx-3">
            <FlaskConical
              className={`size-6 text-purple-400 mr-2 ${
                isGenerating ? "animate-spin" : "animate-none"
              }`}
            />
            <div className="w-full">
              <div className="flex flex-col">
                <div className="grid grid-cols-2 gap-1 md:gap-2">
                  {compare.map((v) => (
                    <div key={v.callId} className="">
                      <Link href={`/point/$${v.callId}`}>
                        <h2 className="text-sm font-bold line-clamp-1 hover:text-muted/80">
                          {v.title}
                        </h2>
                      </Link>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-200 dark:text-gray-800">
                  Request ID: {callId ?? "no-call-id"}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant={"ghost"}
            onClick={() => setOpen((prev) => !prev)}
            className="size-10 rounded-full shrink-0"
          >
            <ChevronUp
              className={`transition-all ${open ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
      </div>
      <AnimatePresence mode={"wait"}>
        {open && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="my-3"
          >
            <div className="*:text-xs grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div className="lg:border-r border-y border-[#1A1A1D] dark:border-inherit rounded-3xl px-3 pb-1">
                <div className="pt-4 space-y-3 pb-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <div className="lg:border-l border-y border-[#1A1A1D] dark:border-inherit rounded-3xl px-3 pb-1">
                <div className="pt-4 space-y-3 pb-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
            <div className="border-[#1A1A1D] dark:border-inherit rounded-3xl px-3 my-2 py-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
