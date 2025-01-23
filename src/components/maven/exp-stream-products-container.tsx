/* eslint-disable @next/next/no-img-element */
"use client";

import { Product } from "@/lib/types/product";
import { DeepPartial } from "ai";
import { StreamableValue, useStreamableValue } from "ai/rsc";
import { FC, useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import { ChevronUp, Globe, Info, Search, SearchCheck } from "lucide-react";
import { Button } from "../ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Lens } from "./lens";
import Link from "next/link";
import { ProductCard } from "./product-card";
import { ErrorMessage } from "./error-message";

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
};

interface StreamProps {
  query: string;
  products: StreamableValue<DeepPartial<Product[]>>;
  screenshot?: string;
}

export const StreamProductsContainer: FC<StreamProps> = ({
  query,
  products,
  screenshot,
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
        name="Products Container (Stream)"
        messsage="Error stream-object-generation"
        raw={{ stream_object: JSON.stringify(raw, null, 2) }}
      />
    );
  }

  return (
    <div className="w-full">
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
          <div className="mb-4 mt-3">
            <Separator className="mb-3" />

            <Lens
              hovering={hovering}
              setHovering={setHovering}
              zoomFactor={2}
              lensSize={270}
            >
              <img
                src={screenshot}
                alt="Searhced Products"
                className="rounded-3xl object-cover"
              />
            </Lens>
          </div>
        )}
        <Separator className="mb-4 bg-[#1A1A1D] dark:bg-muted" />
        <div className="bg-[#1A1A1D] mt-2 items-center dark:bg-white text-white dark:text-black mb-2 py-1 pl-3 pr-1 rounded-3xl">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <SearchCheck className="size-4 shrink-0" />
              <h3 className="text-sm line-clamp-1">
                Product Search Results:
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
            <div className="mt-4">
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
                          id={index}
                        />
                      </motion.div>
                    ))
                  : null}
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
