"use client";

import { Fragment, memo, useId, useState } from "react";
import { ChevronUp, FlaskConical } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FC } from "react";
import { dynamicObjectRender } from "./dynamic-object-render";

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

interface ProductDetailsProps {
  /** Dynamic product data */
  data: Record<string, any>[];
  /** Query product name */
  query: string;
  /** Product link */
  link?: string;
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
              <Link
                href={link || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
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
                      <Fragment key={key}>
                        {dynamicObjectRender(value, key)}
                      </Fragment>
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
