"use client";

import { FC } from "react";
import { RotateCwSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendationAction } from "@/components/maven/recommendation-action";

const recommendations = {
  recommendation: [
    {
      name: "Samsung Galaxy S23 Ultra",
      productModel: "S23 Ultra",
      brand: "Samsung",
    },
    {
      name: "Google Pixel 7 Pro",
      productModel: "Pixel 7 Pro",
      brand: "Google",
    },
    {
      name: "Apple iPhone 14 Pro",
      productModel: "iPhone 14 Pro",
      brand: "Apple",
    },
    {
      name: "OnePlus 11",
      productModel: "11",
      brand: "OnePlus",
    },
    {
      name: "POCO X7 Pro",
      productModel: "X7 Pro",
      brand: "POCO",
    },
  ],
};

export default function Page() {
  return (
    <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
      HELLO WORLD
    </div>
  );
}
