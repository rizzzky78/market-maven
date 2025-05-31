/* eslint-disable @next/next/no-img-element */
"use client";

import { StreamableValue, useStreamableValue } from "ai/rsc";
import { FC, useEffect, useState } from "react";
import { ErrorMessage } from "./error-message";
import { AnimatePresence, motion } from "framer-motion";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import {
  Search,
  FlipHorizontal,
  SquareArrowOutUpRightIcon,
  Info,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { ExtendedMessage } from "./extended-message";
import { MemoProductDetailsInsight } from "./memo-product-details-insight";
import { ShareButton } from "./share-button";
import Link from "next/link";
import { InsightProductCardSkeleton } from "./insight-product-card-skeleton";
import { DetailsGlobal, ProductDetails } from "@/lib/types/product";

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

type StreamProductDetailsProps = {
  content: StreamableValue<Record<string, any>>;
  callId: string;
  data: ProductDetails<DetailsGlobal>["object"];
};

export const StreamProductDetailsInsight: FC<StreamProductDetailsProps> = ({
  callId,
  content,
  data,
}) => {
  const [raw, error] = useStreamableValue(content);
  const [dataStream, setDataStream] = useState<Record<string, any>>({});

  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (raw) setDataStream(raw);
  }, [raw]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <InsightProductCardSkeleton type="details" />;
  }

  if (error) {
    return (
      <ErrorMessage
        errorName="Stream Object Parsing Operation Failed"
        reason="There was an error while parsing the streamable-value input."
        raw={{ trace: raw }}
      />
    );
  }

  const { externalData, previousData, snapshots } = data;

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
                <Loader2 className="size-4 animate-spin" />
              </p>
            </div>
          </motion.div>

          <motion.div
            className="w-full border-inherit border rounded-[2rem] px-4 md:pt-2 pb-2"
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
                  <p className="opacity-70 text-xs">estimated price:</p>
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
                          disabled
                        >
                          <FlipHorizontal className="size-4 text-purple-500 dark:text-purple-300" />
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
                          <Link
                            href={`#${previousData.referenceCallId}`}
                            className="group text-black/60 dark:text-white/60 hover:text-purple-500"
                          >
                            <SquareArrowOutUpRightIcon className="size-5 group-hover:text-purple-500 transition-colors duration-300" />
                          </Link>
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
                  disabled
                />
                <Button
                  variant={"outline"}
                  size={"icon"}
                  onClick={() => setOpen((prev) => !prev)}
                  className="rounded-full shrink-0 size-9"
                  disabled
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
                  <motion.div variants={itemVariants} className="px-0 md:px-4">
                    <MemoProductDetailsInsight data={[dataStream]} />
                    <div className="mt-6 flex items-center space-x-2 justify-start">
                      <Info className="size-4 text-purple-500 dark:text-purple-300" />
                      <p className="text-xs">
                        AI generated information, for reference only.
                      </p>
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
