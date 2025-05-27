"use client";

import { type FC, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronUp,
  SearchCheck,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { LanguageModelUsage } from "ai";
import type { QueryValidationData } from "@/lib/types/subtools";
import { HoverCardUsage } from "./hover-card-usage";
import { QueryValidationSkeleton } from "./query-validation-skeleton";

export type QueryValidationProps = {
  data: QueryValidationData;
  usage?: LanguageModelUsage;
};

export const QueryValidation: FC<QueryValidationProps> = ({ data, usage }) => {
  const {
    query_input,
    is_electronic_product,
    product_exists,
    product_category,
    brand_verified,
    market_availability,
    information_sources,
    confidence_level,
    validation_score,
    detailed_reasoning,
    specifications_found,
    alternative_suggestions,
    red_flags,
  } = data;

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const formatLabel = (str: string) => {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getConfidenceColor = (
    level: QueryValidationData["confidence_level"]
  ) => {
    switch (level) {
      case "very_high":
        return "bg-green-600";
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-600";
      case "low":
        return "bg-orange-500";
      case "very_low":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "#22c55e";
    if (score >= 6) return "#4ade80";
    if (score >= 4) return "#acc15";
    if (score >= 2) return "#fb923c";
    return "#ef4444";
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

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
        ease: "easeOut",
      },
    },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0.1,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const badgeVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 5,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  const progressVariants = {
    hidden: {
      scaleX: 0,
      originX: 0,
    },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <QueryValidationSkeleton />;

  return (
    <div className="w-full flex justify-start">
      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="w-[90%] md:w-full">
        <Card className="w-full md:w-[448px] bg-black/20 dark:bg-transparent rounded-3xl">
          <CardHeader className="pl-4 pr-2 py-[7px] w-full">
            <motion.div
              className="w-full flex justify-between items-center space-x-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  <SearchCheck className="size-4 text-purple-500" />
                </motion.div>
                <h3 className="text-xs">Query Validation</h3>
              </div>
              <div className="flex items-center space-x-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Badge
                    variant={product_exists ? "outline" : "destructive"}
                    className="text-xs px-3 py-1 rounded-full font-normal"
                  >
                    {product_exists ? "Verified" : "Unverified"}
                  </Badge>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
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
              </div>
            </motion.div>
          </CardHeader>

          <AnimatePresence>
            {open && (
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{ overflow: "hidden" }}
              >
                <CardContent className="p-4 pt-2">
                  <motion.div variants={itemVariants} className="pb-3">
                    <h3
                      className="text-sm text-black dark:text-white font-medium leading-none truncate max-w-[200px]"
                      title={query_input}
                    >
                      {query_input}
                    </h3>
                  </motion.div>

                  <div className="space-y-3">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-black dark:text-white/90">
                          Validation Score
                        </span>
                        <motion.span
                          className="font-medium"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                        >
                          {validation_score}/10
                        </motion.span>
                      </div>
                      <motion.div
                        variants={progressVariants}
                        className="relative"
                      >
                        <Progress
                          value={validation_score * 10}
                          className="h-[3px]"
                          customColor={getScoreColor(validation_score)}
                        />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="py-[10px] grid grid-cols-2 gap-2 text-xs text-black/80 dark:text-white/80"
                    >
                      {[
                        {
                          status: is_electronic_product,
                          label: "Electronic Product",
                        },
                        { status: brand_verified, label: "Brand Verified" },
                        { status: product_exists, label: "Product Exists" },
                        { status: specifications_found, label: "Specs Found" },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          className="flex items-center gap-1.5"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.6 + index * 0.1,
                          }}
                        >
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.7 + index * 0.1,
                              type: "spring",
                              stiffness: 200,
                            }}
                          >
                            {getStatusIcon(item.status)}
                          </motion.div>
                          <span>{item.label}</span>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex flex-wrap gap-1.5 *:border-black/20 dark:*:border-white/20"
                    >
                      {[
                        formatLabel(product_category),
                        formatLabel(market_availability),
                        formatLabel(confidence_level),
                      ].map((label, index) => (
                        <motion.div
                          key={label}
                          variants={badgeVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.8 + index * 0.1 }}
                        >
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs px-2 py-1 h-6 rounded-full font-normal",
                              index === 2
                                ? getConfidenceColor(confidence_level)
                                : ""
                            )}
                          >
                            {label}
                          </Badge>
                        </motion.div>
                      ))}
                    </motion.div>

                    <AnimatePresence>
                      {red_flags.length > 0 &&
                        red_flags[0] !== "none_detected" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-start gap-1.5 p-2 rounded-sm"
                          >
                            <motion.div
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                duration: 0.4,
                                type: "spring",
                                stiffness: 200,
                              }}
                            >
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            </motion.div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-red-700">
                                Red Flags:
                              </p>
                              <motion.ul
                                className="text-xs text-red-600 pl-3 list-disc"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                  visible: {
                                    transition: {
                                      staggerChildren: 0.1,
                                    },
                                  },
                                }}
                              >
                                {red_flags.map((flag) => (
                                  <motion.li
                                    key={flag}
                                    variants={{
                                      hidden: { opacity: 0, x: -10 },
                                      visible: { opacity: 1, x: 0 },
                                    }}
                                  >
                                    {formatLabel(flag)}
                                  </motion.li>
                                ))}
                              </motion.ul>
                            </div>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>

                  <motion.div
                    variants={itemVariants}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3, delay: 1.2 }}
                    style={{ originX: 0.5 }}
                  >
                    <Separator className="my-3 bg-black/10 dark:bg-white/10" />
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="space-y-3 text-xs"
                  >
                    <motion.div variants={itemVariants}>
                      <p className="font-medium mb-1 text-black dark:text-white">
                        Reasoning:
                      </p>
                      <motion.p
                        className="text-black/80 dark:text-white/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.3 }}
                      >
                        {detailed_reasoning}
                      </motion.p>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col"
                    >
                      <p className="font-medium text-black dark:text-white mb-1">
                        Information Sources:
                      </p>
                      <motion.div
                        className="flex flex-wrap gap-1.5 *:border-black/20 dark:*:border-white/20"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          visible: {
                            transition: {
                              staggerChildren: 0.05,
                              delayChildren: 1.4,
                            },
                          },
                        }}
                      >
                        {information_sources.map((source) => (
                          <motion.div key={source} variants={badgeVariants}>
                            <Badge
                              variant="outline"
                              className="text-xs rounded-full font-normal h-6 py-1 px-2"
                            >
                              {formatLabel(source)}
                            </Badge>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>

                    <AnimatePresence>
                      {alternative_suggestions.length > 0 && (
                        <motion.div
                          variants={itemVariants}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="font-medium mb-1 text-black dark:text-white">
                            Alternative Suggestions:
                          </p>
                          <motion.ul
                            className="pl-4 list-disc text-black/80 dark:text-white/80"
                            initial="hidden"
                            animate="visible"
                            variants={{
                              visible: {
                                transition: {
                                  staggerChildren: 0.1,
                                  delayChildren: 1.5,
                                },
                              },
                            }}
                          >
                            {alternative_suggestions.map(
                              (suggestion, index) => (
                                <motion.li
                                  key={index}
                                  variants={{
                                    hidden: { opacity: 0, x: -10 },
                                    visible: { opacity: 1, x: 0 },
                                  }}
                                >
                                  {suggestion}
                                </motion.li>
                              )
                            )}
                          </motion.ul>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {usage && (
                      <motion.div
                        className="w-full flex justify-end"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 1.6 }}
                      >
                        <HoverCardUsage usage={usage} />
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
  );
};
