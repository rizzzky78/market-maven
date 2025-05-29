"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import { Circle, Grip, Plus } from "lucide-react";
import Link from "next/link";
import { Fragment, JSX } from "react";

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

const sanitizeStr = (url: string) => {
  const isUrl = url.includes("https://");
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
    <div className="rounded-[2rem] my-0.5 w-fit bg-gray-300 dark:bg-[#4A4947] py-1 pl-2 pr-3">
      <div className="flex items-center">
        <Circle className="size-4 shrink-0 mr-2" /> <p>{url}</p>
      </div>
    </div>
  );
};

export const dynamicObjectRender = (value: any, key: string): JSX.Element => {
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
        <div className="rounded-[2rem] bg-gray-400 dark:bg-muted py-1 px-4 shrink-0 mr-1">
          <p className="font-medium">{sanitizeKeyName(key)}:</p>
        </div>
        <div className="rounded-[2rem] bg-gray-300 dark:bg-[#4A4947] py-1 px-4">
          <p>{String(value)}</p>
        </div>
      </motion.div>
    );
  } else if (Array.isArray(value)) {
    return (
      <motion.div variants={itemVariants} className="my-3">
        <div className="rounded-[2rem] w-fit bg-[#1A1A1D] py-1 pl-2 pr-20 my-1">
          <div className="flex items-center text-white">
            <Plus className="size-4 mr-2" />
            <p className="font-semibold text-sm">{sanitizeKeyName(key)}:</p>
          </div>
        </div>
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-wrap gap-x-1"
        >
          {value.map((item, index) => (
            <motion.div key={`${key}-${index}`} variants={itemVariants}>
              {typeof item === "object" ? (
                <div className="">
                  {Object.entries(item).map(([subKey, subValue]) => (
                    <Fragment key={`${key}-${index}-${subKey}`}>
                      {dynamicObjectRender(subValue, subKey)}
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
        <div className="rounded-[2rem] w-fit bg-purple-300 dark:bg-[#FBF5E5] py-1 pl-2 pr-20 my-2">
          <div className="flex items-center text-black">
            <Grip className="size-4 mr-2" />
            <p className="font-semibold text-sm">{sanitizeKeyName(key)}:</p>
          </div>
        </div>
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="my-1"
        >
          {Object.entries(value).map(([subKey, subValue]) => (
            <Fragment key={`${key}-${subKey}`}>
              {dynamicObjectRender(subValue, subKey)}
            </Fragment>
          ))}
        </motion.div>
      </motion.div>
    );
  }
  return <p className="text-sm text-red-500">{key}: (Unsupported data type)</p>;
};
