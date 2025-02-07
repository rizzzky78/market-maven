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
import { motion } from "framer-motion";
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
import { useSmartTextarea } from "../hooks/use-smart-textare";
import { generateId } from "ai";

interface ProductProps {
  product: Partial<Product>;
  isFinished?: boolean;
  id?: number;
}

export const ProductCard: FC<ProductProps> = ({ product, isFinished, id }) => {
  const { isGenerating } = useAppState();
  const { attach, detach, setInput } = useSmartTextarea();

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

  const cardVariants = {
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
        id: generateId(),
        title: title ?? "error-no-title",
        link: link ?? "error-no-link",
      },
    });
  };

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
        className={`overflow-hidden border rounded-3xl border-[#1A1A1D] bg-[#1A1A1D] text-green-50 h-full flex flex-col ${
          isFinished ? "animate-none" : "animate-pulse"
        }`}
      >
        <CardContent className="p-0 flex-grow relative">
          {image && (
            <Image
              src={isFinished ? image : fallbackImgUrl}
              alt={title || "Product image"}
              width={280}
              height={280}
              className="w-full h-40 object-cover"
            />
          )}
          <motion.div
            className="absolute top-2 right-2 bg-[#1A1A1D] p-1 rounded-lg"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <ShieldCheck
                    className={`w-5 h-5 ${
                      store?.isOfficial ? "text-green-500" : "text-gray-400"
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
              <BadgeDollarSign className="w-3 h-3 text-green-400 mr-1" />
              <span className="font-bold">{price ?? "-"}</span>
            </div>
            <div className="flex items-center space-x-1 *:text-xs">
              <div className="flex items-center">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                <p>{rating ?? "-"}</p>
              </div>
              <div>|</div>
              <div className="flex items-center">
                <p className="mr-1">sold</p>
                <Package className="w-3 h-3 text-purple-400" />
                <p className="ml-1 text-gray-300">{sold ?? "-"}</p>
              </div>
            </div>
          </div>
          <div className="px-3 py-1 text-xs rounded-xl">
            <div className="flex items-start">
              <Store className="w-3 h-3 mr-1 mt-[1px]" />
              <span className="line-clamp-1">{store?.name ?? "-"}</span>
            </div>
            <div className="flex items-start">
              <MapPin className="w-3 h-3 mr-1 mt-[1px]" />
              <span>{store?.location ?? "-"}</span>
            </div>
          </div>
          <div className="px-2 space-x-2 pb-3 flex *:text-xs items-center justify-between pt-2">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    className="relative ml-2 h-7 w-full overflow-hidden rounded-3xl px-6 font-bold bg-gray-300 text-black shadow-sm transition-all duration-300 hover:bg-blue-200 hover:text-indigo-900"
                    onClick={handleAttach}
                    disabled={!isFinished || isGenerating}
                  >
                    {isFinished ? (
                      <span className="relative z-7">Ask AI</span>
                    ) : (
                      <Loader className="relative z-7 size-4 animate-spin" />
                    )}
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
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div
                    className="flex rounded-full w-fit items-center cursor-pointer"
                    onClick={() => copyToClipboard(link || "undefined")}
                  >
                    {copied ? (
                      <CopyCheck className="text-purple-200 h-5 w-5" />
                    ) : (
                      <Copy className="text-purple-200 h-5 w-5" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="rounded-3xl mb-1">
                  <p className="max-w-sm font-semibold">Copy product link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="flex rounded-full items-center pr-2">
                    <Link
                      href={link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className=""
                    >
                      <CircleArrowRight className="text-purple-200 h-5 w-5" />
                    </Link>
                  </div>
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
