"use client";

import { Columns2, Info, Quote, Table, TextQuote } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { MemoProductComparison } from "./memo-product-comparison";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import type { ProductsComparisonProps } from "@/lib/types/props";
import { ShareButton } from "./share-button";
import { ScrollArea } from "../ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { ProductComparisonSkeleton } from "./product-comparison-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Markdown } from "./markdown";

export const ProductComparison: FC<ProductsComparisonProps> = ({
  content,
  isSharedContent,
}) => {
  const {
    args: { compare },
    data: {
      callId,
      object: { userIntent, comparison, markdownTable },
    },
  } = content;

  const { isGenerating } = useAppState();
  const [mounted, setMounted] = useState(false);

  const [one, two] = compare;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <ProductComparisonSkeleton />;

  return (
    <motion.div
      className="w-full mb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="absolute ml-4 -mt-4 z-10"
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center">
          <Columns2 className="size-4 mr-1 text-purple-500" />
          <p className="text-xs font-semibold">
            Product Comparison by
            <motion.span
              className="ml-0.5 text-purple-500 dark:text-purple-600"
              animate={{
                color: ["#a855f7", "#c084fc", "#a855f7"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              Maven
            </motion.span>
          </p>
        </div>
      </motion.div>
      <motion.div
        className="w-full py-1 border px-4 pt-4 pb-4 rounded-[2rem]"
        variants={itemVariants}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col">
          <div className="flex flex-col py-5 px-5">
            <motion.div
              className="flex flex-row space-x-3 items-center"
              variants={itemVariants}
            >
              <motion.div
                className="size-7 border-b border-r"
                initial={{ width: 0, height: 0 }}
                animate={{ width: 28, height: 28 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              <div className="text-sm font-light text-black/50 dark:text-white/50">
                <h4>Comparison</h4>
              </div>
            </motion.div>
            <div className="z-5 py-6 *:line-clamp-1 text-4xl w-full flex flex-col space-y-1 text-black dark:text-white">
              <motion.p variants={titleVariants}>{one.title}</motion.p>
              <motion.p variants={titleVariants} transition={{ delay: 0.1 }}>
                {two.title}
              </motion.p>
            </div>
            <motion.div
              className="-mt-10 w-full flex justify-end"
              variants={itemVariants}
            >
              <div className="flex flex-col">
                <div className="flex flex-row">
                  <motion.div
                    className="size-7 border-b border-r"
                    initial={{ width: 0 }}
                    animate={{ width: 28 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  />
                  <motion.div
                    className="size-7 border-b"
                    initial={{ width: 0 }}
                    animate={{ width: 28 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  />
                </div>
                <motion.div
                  className="size-7 border-r"
                  initial={{ height: 0 }}
                  animate={{ height: 28 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                />
              </div>
            </motion.div>
            <AnimatePresence>
              {userIntent && (
                <motion.div
                  className="text-md py-4 rounded-full flex items-start space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.3,
                    }}
                  >
                    <Quote className="size-5 mt-0.5 text-purple-500" />
                  </motion.div>
                  <motion.p
                    className="line-clamp-2 text-black/80 dark:text-white/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {userIntent}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.div
            className="transition-all duration-500 border-y border-muted w-full py-3 px-2 lg:px-4 mt-4 mb-3 flex items-center justify-between"
            variants={itemVariants}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-start space-x-2">
              <motion.div
                whileHover={{ rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Info className="size-4 shrink-0 text-purple-500 dark:text-purple-500" />
              </motion.div>
              <p className="text-xs pr-2">
                Maven is not affiliated with the relevant online marketplace,
                the displayed results may not match the user&apos;s intent.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ShareButton
                title={"Product Comparison"}
                subtitle={"Product Comparison"}
                type={"products-comparison"}
                callId={callId}
                disabled={isSharedContent || isGenerating}
              />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="object">
            <div className="w-full flex justify-end">
              <TabsList className="rounded-full h-[38px]">
                <TabsTrigger
                  value="object"
                  className="size-8 flex items-center justify-center rounded-full"
                >
                  <TextQuote className="size-4 shrink-0" />
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="size-8 flex items-center justify-center rounded-full"
                >
                  <Table className="size-4 shrink-0" />
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="object">
              <ScrollArea className="h-[500px]">
                <MemoProductComparison data={[comparison]} />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="table">
              <ScrollArea className="pr-4 h-[500px] w-full">
                <Markdown className="selection:bg-purple-200 selection:text-black">
                  {markdownTable ?? "ERROR - CONTENT NOT EXIST"}
                </Markdown>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </motion.div>
        <motion.div
          className="mt-3 -mb-1 flex items-center justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 5,
            }}
          >
            <Info className="size-4 mr-1 text-purple-500 dark:text-purple-300" />
          </motion.div>
          <p className="text-xs">
            AI generated comparison, for reference only.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
