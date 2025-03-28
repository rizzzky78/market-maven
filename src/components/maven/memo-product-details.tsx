"use client";

/* eslint-disable @next/next/no-img-element */
import { Fragment, JSX, memo, useId, useState } from "react";
import { ChevronUp, Circle, FlaskConical, Grip, Plus } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FC } from "react";

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

interface ProductDetailsProps {
  /** Dynamic product data */
  data: Record<string, any>[];
  /** Query product name */
  query: string;
  /** Product link */
  link: string;
  /** Call id pf tools */
  callId?: string;
  /** Generation state */
  isGenerating?: boolean;
}

const PureProductDetails: FC<ProductDetailsProps> = ({
  data,
  query,
  link,
  callId,
  isGenerating,
}) => {
  const [open, setOpen] = useState(true);
  const componentId = useId();

  const renderValue = (value: any, key: string): JSX.Element => {
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
                {renderValue(subValue, subKey)}
              </Fragment>
            ))}
          </motion.div>
        </motion.div>
      );
    }
    return (
      <p className="text-sm text-red-500">{key}: (Unsupported data type)</p>
    );
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="*:text-sm mb-3"
      key={componentId}
    >
      <div className="flex justify-center">
        <div className="flex items-center justify-between bg-[#1A1A1D] text-white dark:bg-white dark:text-black py-1 px-1 w-full rounded-[2rem]">
          <div className="flex items-center mx-3">
            <FlaskConical
              className={`size-6 text-purple-400 mr-2 shrink-0 ${
                isGenerating ? "animate-spin" : "animate-none"
              }`}
            />
            <div className="flex flex-col">
              <Link href={link} target="_blank" rel="noopener noreferrer">
                <h2 className="text-sm hover:text-purple-400 font-bold line-clamp-1">
                  {query}
                </h2>
              </Link>
              <p className="text-xs -mt-1 text-gray-200 dark:text-gray-800">
                Request ID: {callId ?? "no-call-id"}
              </p>
            </div>
          </div>
          <Button
            variant={"ghost"}
            onClick={() => setOpen((prev) => !prev)}
            className="size-10 rounded-full"
          >
            <ChevronUp
              className={`transition-all ${open ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {open && (
          <div>
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-1 *:text-sm flex flex-wrap"
            >
              {data.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="border-t pt-1 first:border-t-0 first:pt-0"
                >
                  <div className="rounded-[2rem] w-fit bg-purple-400 dark:bg-[#FBF5E5] py-1 pl-4 pr-20 mt-6 mb-2">
                    <div className="flex items-center space-x-2 text-black">
                      <p className="font-semibold text-sm">Product:</p>
                    </div>
                  </div>
                  <motion.div
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-1"
                  >
                    {Object.entries(item).map(([key, value]) => (
                      <Fragment key={key}>{renderValue(value, key)}</Fragment>
                    ))}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * A memoized product details
 */
export const MemoProductDetails = memo(
  PureProductDetails,
  (prevProps, nextProps) =>
    prevProps.data === nextProps.data &&
    prevProps.callId === nextProps.callId &&
    prevProps.isGenerating === nextProps.isGenerating
);
