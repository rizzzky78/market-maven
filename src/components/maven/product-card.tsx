"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  MapPin,
  ShieldCheck,
  Store,
  BadgeDollarSign,
  Package,
  CircleArrowRight,
  Copy,
  CopyCheck,
  Loader,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { FC, useState } from "react";
import { toast } from "sonner";
import { Product } from "@/lib/types/product";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useMavenStateController } from "../hooks/maven-state-controller";
import { generateId } from "ai";

interface ProductProps {
  product: Partial<Product>;
  isFinished?: boolean;
  isSharedContent?: boolean;
}

export const ProductCard: FC<ProductProps> = ({
  product,
  isFinished,
  isSharedContent,
}) => {
  const { isGenerating } = useAppState();
  const { attach, detach, activeComparison } = useMavenStateController();

  const [copied, setCopied] = useState(false);

  const copyToClipboard = (contentText: string) => {
    toast("Link Copied Successfully!", {
      position: "top-center",
      richColors: true,
      className:
        "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
    });
    navigator.clipboard.writeText(contentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { title, image, price, rating, sold, link, store } = product;

  const fallbackImgUrl = `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  };

  const handleAttach = () => {
    // setInput("I want you to give me the product details or information");
    detach();
    attach({
      product: {
        purpose: "get-product-details",
        title: title ?? "error-no-title",
        link: link ?? "error-no-link",
        callId: `tkp-${generateId()}`,
        source: "tokopedia",
      },
    });
  };

  const comparisonState = activeComparison
    ? activeComparison.for.length > 0
    : false;

  const isButtonDisabled = !isFinished || isGenerating || comparisonState;

  return (
    <motion.div
      className="w-full mx-auto"
      variants={cardVariants}
      whileHover="hover"
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Card
        className={`overflow-hidden rounded-xl py-0 h-full flex flex-col gap-0 shadow-none transition-colors hover:border-foreground/20 ${
          isFinished ? "animate-none" : "animate-pulse"
        }`}
      >
        <CardContent className="p-0 grow relative">
          {image && (
            <Image
              src={isFinished ? image : fallbackImgUrl}
              alt={title || "Product image"}
              width={280}
              height={280}
              className="aspect-square w-full bg-muted object-cover"
            />
          )}
          <motion.div
            className="absolute top-2 right-2 rounded-md bg-background/90 p-1 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <ShieldCheck
                    className={`w-5 h-5 ${
                      store?.isOfficial
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent className="rounded-3xl">
                  <p className="max-w-sm font-semibold">
                    {store?.isOfficial
                      ? "Official/Trusted Store"
                      : "Not Official/Trusted Store"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
          <div className="px-3 pt-2 pb-1 space-y-1 text-xs">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <h3 className="line-clamp-2 text-sm font-semibold">
                    {title || "Untitled Product"}
                  </h3>
                </TooltipTrigger>
                <TooltipContent className="rounded-3xl">
                  <p className="max-w-sm font-semibold">{title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center">
              <BadgeDollarSign className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-sm font-semibold">{price ?? "-"}</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground *:text-xs">
              <div className="flex items-center">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                <p>{rating ?? "-"}</p>
              </div>
              <div>|</div>
              <div className="flex items-center">
                <p className="mr-1">sold</p>
                <Package className="w-3 h-3" />
                <p className="ml-1">{sold ?? "-"}</p>
              </div>
            </div>
          </div>
          <div className="px-3 py-1 text-xs text-muted-foreground">
            <div className="flex items-start">
              <Store className="w-3 h-3 mr-1 mt-px" />
              <span className="line-clamp-1">{store?.name ?? "-"}</span>
            </div>
            <div className="flex items-start">
              <MapPin className="w-3 h-3 mr-1 mt-px" />
              <span>{store?.location ?? "-"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 pt-2 pb-3">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 flex-1 rounded-full text-xs"
                    onClick={handleAttach}
                    disabled={isSharedContent ? true : isButtonDisabled}
                  >
                    {isFinished ? (
                      "Ask"
                    ) : (
                      <Loader className="size-4 animate-spin" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-3xl">
                  <p className="max-w-sm font-semibold">
                    Ask AI for product details
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 rounded-full"
                    onClick={() => copyToClipboard(link || "undefined")}
                    aria-label="Copy product link"
                  >
                    {copied ? (
                      <CopyCheck className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-3xl mb-1">
                  <p className="max-w-sm font-semibold">Copy product link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 rounded-full"
                  >
                    <Link
                      href={link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open product page"
                    >
                      <CircleArrowRight className="size-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-3xl mb-1">
                  <p className="max-w-sm font-semibold">Go to product page</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
