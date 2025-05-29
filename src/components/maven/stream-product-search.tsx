"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types/product";
import { DeepPartial } from "ai";
import { StreamableValue, useStreamableValue } from "ai/rsc";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Info, SearchCheck, ChevronUp } from "lucide-react";
import { FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/maven/error-message";
import { Lens } from "@/components/maven/lens";
import { ProductCard } from "@/components/maven/product-card";
import { ShareButton } from "@/components/maven/share-button";
import { Separator } from "@/components/ui/separator";

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

interface StreamProps {
  query: string;
  products: StreamableValue<DeepPartial<Product[]>>;
  screenshot?: string;
  callId: string;
}

export const StreamProductSearch: FC<StreamProps> = ({
  query,
  products,
  screenshot,
  callId,
}) => {
  const [raw, error, pending] = useStreamableValue(products);
  const [data, setData] = useState<DeepPartial<Product[]>>([]);
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (raw) setData(raw);
  }, [raw]);

  if (error) {
    return (
      <ErrorMessage
        errorName="Products Container (Stream)"
        reason="Error stream-object-generation"
        raw={{ raw }}
      />
    );
  }

  return (
    <div className="w-full mb-5">
      <div className="absolute ml-4 -mt-4">
        <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center">
          <Search className="size-4 mr-1" />
          <p className="text-xs font-semibold">
            Search Product by
            <Link
              href={"https://www.tokopedia.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-700"
            >
              Tokopedia
            </Link>
          </p>
        </div>
      </div>
      <div className="w-full border-[#1A1A1D] dark:border-inherit border rounded-[2rem] px-4 py-2">
        {screenshot && (
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
                  src={screenshot}
                  alt={query}
                  width={1400}
                  height={788}
                  quality={100}
                  placeholder={"blur"}
                  blurDataURL="/blured-placeholder.webp"
                />
              </Lens>
              <div className="w-fit p-1 mt-1 flex items-center justify-between">
                <div className="flex items-start">
                  <Info className="size-4 shrink-0 mr-1 text-purple-500 dark:text-purple-300" />
                  <p className="text-xs">
                    Maven is not affiliated with the relevant online
                    marketplace, the displayed results may not match the
                    user&apos;s intent.
                  </p>
                </div>
                <ShareButton
                  title={"Product Search"}
                  type={"product-search"}
                  callId={callId}
                />
              </div>
            </motion.div>
          </div>
        )}
        <Separator className="mb-4 bg-[#1A1A1D] dark:bg-muted" />
        <div className="bg-[#1A1A1D] mt-2 items-center dark:bg-white text-white dark:text-black mb-2 py-1 pl-3 pr-1 rounded-3xl">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <SearchCheck className="size-4 shrink-0" />
              <h3 className="text-sm line-clamp-1">
                Product Search:
                <span className="ml-1 font-semibold">{query}</span>
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
            <div className="mt-4 mb-2">
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2"
                variants={animations.container}
                initial="hidden"
                animate="visible"
              >
                {Array.isArray(data)
                  ? data.map((product, index) => (
                      <motion.div
                        key={`product-${index}`}
                        variants={animations.item}
                      >
                        <ProductCard
                          product={product as Partial<Product>}
                          isFinished={!pending}
                        />
                      </motion.div>
                    ))
                  : null}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
