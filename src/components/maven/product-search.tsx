"use client";

import { FC, useEffect, useState } from "react";
import { ProductCard } from "@/components/maven/product-card";
import { AnimatePresence, motion } from "motion/react";
import { ChevronUp, Info, Search, SearchCheck } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SearchProductResult,
  TokopediaSearchResult,
} from "@/lib/types/product";
import { Lens } from "@/components/maven/lens";
import { ProductCardSkeleton } from "@/components/maven/product-card-skeleton";
import { ExtendedToolResult } from "@/lib/types/ai";
import { ShareButton } from "@/components/maven/share-button";
import Image from "next/image";

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
  content: ExtendedToolResult<
    { query: string },
    SearchProductResult<TokopediaSearchResult>
  >;
  isFinished?: boolean;
  isSharedContent?: boolean;
}

export const ProductSearch: FC<ProductsProps> = ({
  content,
  isFinished,
  isSharedContent,
}) => {
  const [isContentReady, setIsContentReady] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState(true);

  const {
    data: { object },
  } = content;

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
    object.products.map((product, index) => (
      <motion.div key={`product-${index}`} variants={animations.item}>
        <ProductCard
          product={product}
          isFinished={isFinished}
          isSharedContent={isSharedContent}
        />
      </motion.div>
    ));

  return (
    <div className="w-full mb-5">
      <div className="w-full rounded-2xl border px-3 py-3 md:px-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          <p>
            Results from
            <Link
              href={"https://www.tokopedia.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-medium text-foreground underline-offset-2 hover:underline"
            >
              Tokopedia
            </Link>
          </p>
        </div>
        {object.screenshot && (
          <div className="my-1 pt-1">
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
                <Image
                  src={object.screenshot}
                  alt={content.args.query}
                  width={1400}
                  height={788}
                  quality={100}
                  placeholder={"blur"}
                  blurDataURL="/blured-placeholder.webp"
                />
              </Lens>
              <div className="w-fit p-1 mt-1 flex items-center justify-between">
                <div className="flex items-start">
                  <Info className="size-4 shrink-0 mr-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Maven is not affiliated with the relevant online
                    marketplace, the displayed results may not match the
                    user&apos;s intent.
                  </p>
                </div>
                <ShareButton
                  title={"Product Search"}
                  type={"product-search"}
                  callId={content.data.callId}
                  disabled={isSharedContent}
                />
              </div>
            </motion.div>
          </div>
        )}
        <Separator className="mb-2" />
        <div className="items-center py-1 pl-1">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <SearchCheck className="size-4 shrink-0" />
              <h3 className="text-sm line-clamp-1 text-muted-foreground">
                Results for
                <span className="ml-1 font-medium text-foreground">{content.args.query}</span>
              </h3>
            </div>
            <div>
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => setOpen((prev) => !prev)}
                className="size-8 rounded-full"
                aria-label={open ? "Collapse results" : "Expand results"}
                aria-expanded={open}
              >
                <ChevronUp
                  className={`size-4 shrink-0 transition-all ${
                    open ? "" : "rotate-180"
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
        <AnimatePresence mode={"wait"}>
          {open && (
            <div className="mt-2">
              <motion.div
                className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3"
                variants={animations.container}
                initial="hidden"
                animate="visible"
              >
                {isContentReady && isFinished
                  ? renderProducts()
                  : renderSkeletons()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
