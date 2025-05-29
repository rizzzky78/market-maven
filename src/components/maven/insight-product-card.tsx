/* eslint-disable @next/next/no-img-element */
"use client";

import { FC, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  ExternalLink,
  MapPin,
  Star,
  Search,
  Info,
  ChevronUp,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ShareButton } from "./share-button";
import { Button } from "@/components/ui/button";
import type { DataSourceInsight } from "@/lib/types/subtools";
import { InsightProductCardSkeleton } from "./insight-product-card-skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";
import { useMavenStateController } from "../hooks/maven-state-controller";
import { generateId, LanguageModelUsage } from "ai";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { HoverCardUsage } from "./hover-card-usage";
import { ExtendedToolResult, RefferenceDataSource } from "@/lib/types/ai";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
      ease: "easeOut",
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const carouselVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const collapsibleVariants = {
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
    },
  },
};

const storeItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export type InsightProductCardProps = {
  content: ExtendedToolResult<
    {
      query: string;
      reffSource: RefferenceDataSource;
    },
    DataSourceInsight
  >;
  isSharedContent?: boolean;
  opened?: boolean;
  usage?: LanguageModelUsage;
};

export const InsightProductCard: FC<InsightProductCardProps> = ({
  content,
  isSharedContent,
  usage,
  opened = false,
}) => {
  const [open, setOpen] = useState(opened);
  const [mounted, setMounted] = useState(false);
  const { isGenerating } = useAppState();

  const { attach, detach, activeComparison } = useMavenStateController();

  console.log(JSON.stringify(content));

  const {
    data: { data: product, callId },
  } = content;

  const handleAttach = () => {
    detach();
    attach({
      product: {
        id: generateId(),
        title: product.title ?? "error-no-title",
        source: "global",
      },
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <InsightProductCardSkeleton />;
  }

  const comparisonState = activeComparison
    ? activeComparison.for.length > 0
    : false;

  const isButtonDisabled = isGenerating || comparisonState;

  return (
    <motion.div
      className="w-full mt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="w-full mb-5">
        <motion.div
          className="z-10 absolute ml-4 -mt-4"
          variants={itemVariants}
        >
          <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center">
            <Search className="size-4 mr-1 text-blue-400" />
            <p className="text-xs font-semibold">
              Search Product by{" "}
              <Link
                href={"https://serper.dev/"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-600"
              >
                Serper
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.div
          className="w-full border-inherit border rounded-[2rem] px-4 py-2"
          variants={headerVariants}
        >
          <div className="md:pt-6 flex space-y-6 md:space-y-0 flex-col-reverse md:flex-row justify-between lg:min-h-[360px] items-start">
            <motion.div
              className="pl-2 md:pl-4 flex flex-col space-y-4 lg:justify-start h-full w-full lg:max-w-[350px]"
              variants={itemVariants}
            >
              <div
                id={callId}
                className="text-2xl md:text-3xl lg:text-4xl line-clamp-4 font-semibold text-black dark:text-white leading-tight"
              >
                <h4>{product.title}</h4>
              </div>
              <div className="pt-5 flex flex-col text-black dark:text-white">
                <p className="opacity-70 text-xs">estimated price:</p>
                <p className="text-xl md:text-2xl">{product.estimatedPrice}</p>
              </div>

              <div className="w-full flex justify-center md:justify-start py-[20px]">
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        className="relative h-10 w-fit overflow-hidden rounded-3xl px-14 md:px-10 font-bold bg-gray-300 text-black shadow-sm transition-all duration-300 hover:bg-blue-200 hover:text-indigo-900"
                        onClick={handleAttach}
                        disabled={isSharedContent ? true : isButtonDisabled}
                      >
                        <span className="relative z-7">Ask AI</span>
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <div className="gradient-bg bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-400 rounded-full w-40 h-40 blur-xl opacity-50 animate-spin-slow transition-all duration-300" />
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-3xl">
                      <p className="max-w-sm font-semibold">
                        Ask AI for product details
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>

            <motion.div
              className="h-full md:max-w-sm flex items-start justify-center w-full md:justify-start"
              variants={carouselVariants}
            >
              <div className="pb-7 lg:pb-0 flex flex-col px-2 md:px-4">
                <Carousel className="lg:max-w-[340px] h-full flex items-center pb-2 justify-center w-full">
                  <CarouselContent className="">
                    {product.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <motion.div
                          className="p-2 cursor-grab active:cursor-grabbing aspect-square bg-gray-50 rounded-2xl lg:rounded-xl overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
                <p className="text-black/70 dark:text-white/50 text-xs">
                  *swipe to explore images
                </p>
                <div className="hidden md:flex justify-end">
                  {usage && <HoverCardUsage usage={usage} />}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div className="w-full" variants={itemVariants}>
            <div
              className="transition-all duration-500 border-y border-muted w-full py-3 px-2 lg:px-4 mt-4 mb-3 flex items-center justify-between"
              style={{
                borderColor: open ? "" : "transparent",
              }}
            >
              <div className="flex items-start space-x-2">
                <Info className="size-4 shrink-0 text-purple-500 dark:text-purple-300" />
                <p className="text-xs pr-1">
                  Maven is not affiliated with the relevant online marketplace,
                  the displayed results may not match the user&apos;s intent.
                </p>
              </div>
              <ShareButton
                title={"Product Search"}
                type={"product-search"}
                callId={callId}
                disabled={isSharedContent}
              />
              <Button
                variant={"outline"}
                size={"icon"}
                onClick={() => setOpen((prev) => !prev)}
                className="rounded-full shrink-0 size-9"
              >
                <motion.div
                  animate={{ rotate: open ? 0 : 180 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronUp className="size-3 shrink-0" />
                </motion.div>
              </Button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                variants={collapsibleVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{ overflow: "hidden" }}
              >
                <motion.div
                  className="w-full flex flex-col space-y-1 pt-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="flex items-center justify-start space-x-3 px-3 lg:px-5 text-sm text-black/90 dark:text-white/90"
                    variants={itemVariants}
                  >
                    <p className="">Available Store</p>
                    <div className="h-6 w-px bg-muted" />
                    <div
                      style={{
                        backgroundColor:
                          product.marketSource === "shopee"
                            ? "#FF5722"
                            : "#1A1A1D",
                      }}
                      className="capitalize text-white py-1 px-3 border border-muted rounded-full"
                    >
                      {product.marketSource}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="pb-4">
                    <ScrollArea className="w-full h-[240px] py-4 px-3 lg:px-5">
                      <div className="space-y-3">
                        {product.availableStore.map((store, index) => (
                          <motion.div
                            key={index}
                            className="border-b border-b-muted last:border-b-0"
                            variants={storeItemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.1 }}
                          >
                            <Link
                              href={store.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group *:transition-all *:duration-300 flex items-center justify-between gap-3 h-full"
                            >
                              <div className="group-hover:translate-x-2 duration-300">
                                <div className="flex items-center gap-2 mb-1 max-w-[340px] lg:max-w-md">
                                  <h4 className="line-clamp-1 group-hover:text-purple-500 font-medium text-black/90 dark:text-white/90 text-sm truncate">
                                    {store.name}
                                  </h4>
                                  {store.isOfficial && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs rounded-full"
                                    >
                                      Official
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{store.location}</span>
                                  </div>
                                  {store.rating && store.rating !== "-" && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3" />
                                      <span>{store.rating}</span>
                                    </div>
                                  )}
                                  {store.sold && store.sold !== "-" && (
                                    <div className="text-gray-500">
                                      {store.sold} sold
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="group-hover:-translate-x-2 h-full flex items-center text-xs rounded-full text-black/90 dark:text-white/90 ">
                                <ExternalLink className="size-[16px] group-hover:text-purple-500" />
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};
