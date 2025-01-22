/* eslint-disable @next/next/no-img-element */
"use client";

import { FC, useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, Globe, Info, Search, SearchCheck } from "lucide-react";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ProductsResponse } from "@/lib/types/product";
import { Lens } from "./lens";
import { ProductCardSkeleton } from "./product-card-skeleton";
import { ExtendedToolResult } from "@/lib/types/ai";

// Animation configurations
const ANIMATION_CONSTANTS = {
  DELAY_MS: 1000,
  STAGGER_DELAY: 0.1,
  INITIAL_Y_OFFSET: 20,
  SKELETON_COUNT: 3,
} as const;

const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: ANIMATION_CONSTANTS.STAGGER_DELAY,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: ANIMATION_CONSTANTS.INITIAL_Y_OFFSET },
    visible: { opacity: 1, y: 0 },
  },
  product: {
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
  },
};

interface ProductsProps {
  content: ExtendedToolResult<{ query: string }, ProductsResponse>;
  isFinished?: boolean;
}

export const ProductsContainer: FC<ProductsProps> = ({
  content,
  isFinished,
}) => {
  const [isContentReady, setIsContentReady] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(
      () => setIsContentReady(true),
      ANIMATION_CONSTANTS.DELAY_MS
    );
    return () => clearTimeout(timer);
  }, []);

  const renderSkeletons = () =>
    Array.from({ length: ANIMATION_CONSTANTS.SKELETON_COUNT }).map((_, idx) => (
      <div key={`skeleton-${idx}`}>
        <ProductCardSkeleton />
      </div>
    ));

  const renderProducts = () =>
    content.data.data.map((product, index) => (
      <motion.div key={`product-${index}`} variants={animations.item}>
        <ProductCard product={product} isFinished={isFinished} id={index} />
      </motion.div>
    ));

  return (
    <div className="w-full mb-5">
      <div className="absolute ml-4 -mt-4">
        <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center">
          <Search className="size-4 mr-1" />
          <p className="text-xs font-semibold">
            Search Product by
            <span className="ml-0.5 text-green-400 dark:text-green-600">
              Tokopedia
            </span>
          </p>
        </div>
      </div>
      <div className="w-full border-[#1A1A1D] dark:border-inherit border rounded-[2rem] px-4 py-2">
        {content.data.screenshot && (
          <div className="mb-2 mt-2">
            {isContentReady && isFinished ? (
              <motion.div
                variants={animations.item}
                initial="hidden"
                animate="visible"
              >
                <Lens
                  hovering={hovering}
                  setHovering={setHovering}
                  zoomFactor={2}
                  lensSize={270}
                >
                  <img
                    src={content.data.screenshot}
                    alt="Searhced Products"
                    className="rounded-3xl object-cover"
                  />
                </Lens>
              </motion.div>
            ) : (
              <div className="bg-muted rounded-3xl animate-pulse w-full h-[360px]" />
            )}
            <div className="w-fit p-1 mt-2">
              <div className="flex items-start space-x-2">
                <Globe className="size-4 shrink-0" />
                <p className="text-xs">
                  Source:
                  <Link
                    href={"https://www.tokopedia.com/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-500"
                  >
                    Tokopedia
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
        <Separator className="mb-4 bg-[#1A1A1D] dark:bg-muted" />
        <div className="bg-[#1A1A1D] mt-2 items-center dark:bg-white text-white dark:text-black mb-2 py-1 pl-3 pr-1 rounded-3xl">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <SearchCheck className="size-4 shrink-0" />
              <h3 className="text-sm font-semibold line-clamp-1">
                Product Search: {content.args.query}
              </h3>
            </div>
            <div>
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => setOpen((prev) => !prev)}
                className="rounded-full"
              >
                <ChevronUp
                  className={`size-3 shrink-0 transition-all ${
                    open ? "" : "rotate-180"
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
        <AnimatePresence mode={"wait"}>
          {open && (
            <div className="mt-4">
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2"
                variants={animations.container}
                initial="hidden"
                animate="visible"
              >
                {isContentReady && isFinished
                  ? renderProducts()
                  : renderSkeletons()}
              </motion.div>
              <div className="w-fit p-1 mt-2 rounded-full">
                <div className="flex items-start space-x-2">
                  <Info className="size-4 shrink-0" />
                  <p className="text-xs">
                    MarketMaven is not affiliated with the relevant online
                    marketplace, the displayed results may not match the
                    user&apos;s intent.
                  </p>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
