"use client";

import { motion } from "framer-motion";
import { FC, Fragment, memo } from "react";
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

interface MemoProps {
  data: Record<string, any>[];
}

export const PureProductDetailsInsight: FC<MemoProps> = ({ data }) => {
  return (
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
              <Fragment key={key}>{dynamicObjectRender(value, key)}</Fragment>
            ))}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export const MemoProductDetailsInsight = memo(
  PureProductDetailsInsight,
  (prevProps, nextProps) => prevProps.data === nextProps.data
);
