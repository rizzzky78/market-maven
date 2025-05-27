"use client";

import { ChevronUp, MoveRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type FC, useEffect, useState } from "react";
import type { LanguageModelUsage } from "ai";
import type { QueryEnhancedData } from "@/lib/types/subtools";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { QueryEnhancementSkeleton } from "@/components/maven/query-enhancement-skeleton";
import { HoverCardUsage } from "./hover-card-usage";

export interface QueryEnhancementProps {
  data: QueryEnhancedData;
  usage?: LanguageModelUsage;
}

export const QueryEnhancement: FC<QueryEnhancementProps> = ({
  data,
  usage,
}) => {
  const {
    original_query,
    enhanced_query,
    enhancement_type,
    confidence_score,
    reasoning,
  } = data;

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);

  const formatLabel = (str: string) => {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <QueryEnhancementSkeleton />;

  // Animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
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

  const contentVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const queryVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  const enhancedQueryVariants = {
    hidden: { opacity: 0, x: 15 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: 0.1 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  return (
    <motion.div
      className="w-full flex justify-start"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <div className="w-[90%] md:w-full">
        <motion.div variants={itemVariants}>
          <Card className="w-full md:w-[448px] bg-black/20 dark:bg-transparent rounded-3xl overflow-hidden">
            <CardHeader className="pl-4 pr-2 py-[7px] w-full">
              <motion.div
                className="flex items-center justify-between"
                variants={headerVariants}
              >
                <motion.div
                  className="flex items-center space-x-2"
                  variants={itemVariants}
                >
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  </motion.div>
                  <motion.h3 className="text-xs" variants={itemVariants}>
                    Query Enhancement
                  </motion.h3>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-2"
                  variants={itemVariants}
                >
                  <motion.div variants={itemVariants}>
                    <Badge
                      variant={"outline"}
                      className="text-xs px-3 py-1 rounded-full font-normal"
                    >
                      {formatLabel(enhancement_type)}
                    </Badge>
                  </motion.div>
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      onClick={() => setOpen((prev) => !prev)}
                      className="rounded-full shrink-0 size-8"
                    >
                      <motion.div
                        animate={{ rotate: open ? 0 : 180 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <ChevronUp className="size-3 shrink-0" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </CardHeader>
            <AnimatePresence mode="wait">
              {open && (
                <motion.div
                  key="content"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <CardContent className="p-4 space-y-3">
                    <motion.div
                      className="space-y-2 text-sm text-black dark:text-white font-medium"
                      variants={itemVariants}
                    >
                      <motion.p variants={queryVariants}>
                        Query: <span>{original_query}</span>
                      </motion.p>
                      <motion.div
                        className="flex items-center space-x-2 font-normal"
                        variants={enhancedQueryVariants}
                      >
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <MoveRight className="size-4 text-black/60 dark:text-white/80" />
                        </motion.div>
                        <p>{enhanced_query}</p>
                      </motion.div>
                    </motion.div>

                    <motion.div className="space-y-1" variants={itemVariants}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-black/80 dark:text-white/80">
                          Confidence Score: {confidence_score}
                        </span>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Separator className="my-2 bg-black/10 dark:bg-white/10" />
                    </motion.div>

                    <motion.div className="space-y-1" variants={itemVariants}>
                      <motion.p
                        className="text-xs font-medium text-black dark:text-white"
                        variants={itemVariants}
                      >
                        Reasoning:
                      </motion.p>
                      <motion.p
                        className="text-xs text-black/80 dark:text-white/80"
                        variants={itemVariants}
                      >
                        {reasoning}
                      </motion.p>
                      {usage && (
                        <motion.div
                          className="w-full flex justify-end pt-4"
                          variants={itemVariants}
                        >
                          <motion.div className="flex items-center space-x-1 text-black dark:text-white">
                            <HoverCardUsage usage={usage} />
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
