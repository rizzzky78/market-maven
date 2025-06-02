/* eslint-disable @next/next/no-img-element */
"use client";

import { FC, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Play,
  Search,
  Info,
  ChevronUp,
  FlipHorizontal,
  SquareArrowOutUpRightIcon,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ShareButton } from "@/components/maven/share-button";
import { Button } from "@/components/ui/button";
import { InsightProductCardSkeleton } from "@/components/maven/insight-product-card-skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useMavenStateController } from "@/components/hooks/maven-state-controller";
import { LanguageModelUsage } from "ai";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { HoverCardUsage } from "@/components/maven/hover-card-usage";
import { ExtendedToolResult } from "@/lib/types/ai";
import { MemoProductDetailsInsight } from "@/components/maven/memo-product-details-insight";
import { ExtendedMessage } from "@/components/maven/extended-message";
import { DetailsGlobal, ProductDetails } from "@/lib/types/product";
import { ScrollArea } from "../ui/scroll-area";

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

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

export type ProductDetailsInsightProps = {
  content: ExtendedToolResult<
    {
      query: string;
      source?: "global" | "tokopedia";
      callId: string;
      link?: string;
    },
    ProductDetails<DetailsGlobal>
  >;
  isSharedContent?: boolean;
  opened?: boolean;
  usage?: LanguageModelUsage;
};

export const ProductDetailsInsight: FC<ProductDetailsInsightProps> = ({
  content,
  isSharedContent,
  usage,
  opened = false,
}) => {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [open, setOpen] = useState(opened);
  const [mounted, setMounted] = useState(false);
  const { isGenerating } = useAppState();

  const { activeComparison, addToComparison, attachment } =
    useMavenStateController();

  const {
    args,
    data: {
      callId,
      object: { previousData, snapshots, externalData, productDetails },
    },
  } = content;

  const attachComparison = () => {
    addToComparison({
      for: { title: args.query, callId },
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <InsightProductCardSkeleton type="details" />;
  }

  const comparisonState = activeComparison
    ? activeComparison.for.length === 2 ||
      Boolean(activeComparison.for.find((v) => v.callId === callId))
    : false;

  const isButtonDisabled = Boolean(attachment) || comparisonState;

  const sharedContent = isSharedContent ?? false;

  return (
    <div className="w-full">
      {externalData?.tavily && externalData?.markdown && (
        <ExtendedMessage
          content={externalData.markdown}
          tavilyAnswer={externalData.tavily}
        />
      )}
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
            <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center space-x-2">
              <Search className="size-4 text-purple-500" />
              <p className="text-xs font-semibold">
                Product Details by{" "}
                <Link
                  href={"https://serper.dev/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-600"
                >
                  Serper
                </Link>{" "}
                &{" "}
                <Link
                  href={"https://tavily.com/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-600"
                >
                  Tavily
                </Link>
              </p>
            </div>
          </motion.div>

          <motion.div
            className="w-full border rounded-[2rem] px-4 md:pt-2 pb-2"
            variants={headerVariants}
          >
            <div className="md:pt-6 flex space-y-6 md:space-y-0 flex-col-reverse md:flex-row-reverse justify-between lg:min-h-[360px] items-start">
              <motion.div
                className="pl-2 md:pl-4 flex flex-col space-y-4 lg:justify-start h-full w-full lg:max-w-[350px]"
                variants={itemVariants}
              >
                <div className="flex flex-col space-y-1">
                  <p className="lowercase text-xs text-black/50 dark:text-white/50">
                    Product Details for:
                  </p>
                  <div className="text-2xl md:text-3xl lg:text-4xl line-clamp-4 font-semibold text-black dark:text-white leading-tight">
                    <h4>{previousData.title}</h4>
                  </div>
                </div>
                <div className="pt-5 flex flex-col text-black dark:text-white">
                  <p className="opacity-50 text-xs">estimated price:</p>
                  <p className="text-xl md:text-2xl">
                    {previousData.estimatedPrice}
                  </p>
                </div>

                <div className="w-full flex items-center justify-center md:justify-start py-[20px] space-x-4">
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={"outline"}
                          size={"sm"}
                          className="rounded-3xl h-9 text-md px-4 font-normal bg-[#1A1A1D] dark:bg-background text-white hover:border-[#1A1A1D]"
                          onClick={attachComparison}
                          disabled={sharedContent ? true : isButtonDisabled}
                        >
                          <FlipHorizontal className="size-4 text-purple-500 dark:text-purple-500" />
                          <span>Compare</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-3xl">
                        <p className="max-w-sm font-semibold">
                          Attach to products comparison
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{
                            rotate: 45,
                            transition: { duration: 0.3, ease: "easeInOut" },
                          }}
                        >
                          <Button
                            variant={"ghost"}
                            className="size-9 rounded-full group text-black/60 dark:text-white/60 hover:text-purple-500"
                            onClick={() => {
                              const target = document.getElementById(
                                previousData.referenceCallId
                              );
                              if (target) {
                                target.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                  inline: "end",
                                });
                              }
                            }}
                          >
                            <SquareArrowOutUpRightIcon className="size-5 group-hover:text-purple-500 transition-colors duration-300" />
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-3xl">
                        <p className="max-w-sm font-semibold">
                          See the available store links
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
                      {snapshots.images.map((image, index) => (
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
                  <Info className="size-4 shrink-0 text-purple-500 dark:text-purple-500" />
                  <p className="text-xs pr-1">
                    Maven is not affiliated with the relevant online
                    marketplace, the displayed results may not match the
                    user&apos;s intent.
                  </p>
                </div>
                <ShareButton
                  title={"Product Details"}
                  subtitle={previousData.title}
                  type={"product-details"}
                  callId={callId}
                  disabled={isSharedContent}
                />
                <Button
                  variant={"outline"}
                  size={"icon"}
                  onClick={() => setOpen((prev) => !prev)}
                  className="rounded-full shrink-0 size-9"
                  disabled={isGenerating}
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
                >
                  <motion.div variants={itemVariants} className="px-0 md:px-4">
                    <ScrollArea className="h-[500px]">
                      <MemoProductDetailsInsight data={[productDetails]} />
                    </ScrollArea>
                    <div className="mt-6 flex items-center space-x-2 justify-start">
                      <Info className="size-4 text-purple-500 dark:text-purple-300" />
                      <p className="text-xs">
                        AI generated information, for reference only.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Separator className="my-10" />
                  </motion.div>

                  <motion.div
                    className="w-full flex flex-col px-0 md:px-4 pb-4"
                    variants={itemVariants}
                  >
                    <div className="">
                      <div className="mb-3">
                        <p className="text-sm text-black dark:text-white">
                          Related Videos
                        </p>
                      </div>
                      <div className="pt-0 space-y-3">
                        {/* Main Video Player */}
                        <motion.div
                          className="aspect-video rounded-md overflow-hidden"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          {(() => {
                            const videoId = getYouTubeVideoId(
                              snapshots.videos[selectedVideoIndex]
                            );
                            return videoId ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={`Product video ${
                                  selectedVideoIndex + 1
                                }`}
                                className="w-full h-full"
                                allowFullScreen
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Play className="w-12 h-12" />
                              </div>
                            );
                          })()}
                        </motion.div>

                        {/* Video Thumbnails */}
                        <motion.div
                          className="flex gap-2 overflow-x-auto pb-2 justify-between"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          {snapshots.videos.map((video, index) => {
                            const videoId = getYouTubeVideoId(video);
                            return (
                              <motion.button
                                key={index}
                                onClick={() => setSelectedVideoIndex(index)}
                                className={`flex-shrink-0 w-[100px] h-[60px] rounded-lg border-2 overflow-hidden transition-colors ${
                                  selectedVideoIndex === index
                                    ? "border-purple-500"
                                    : "bg-black/5 dark:bg-transparent hover:border-purple-500"
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  duration: 0.3,
                                  delay: index * 0.1 + 0.5,
                                  hover: { duration: 0.2 },
                                  tap: { duration: 0.1 },
                                }}
                              >
                                {videoId ? (
                                  <img
                                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                    alt={`Video ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Play className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
