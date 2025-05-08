"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { TextSearch } from "lucide-react";
import { useMavenStateController } from "@/components/hooks/maven-state-controller";

export default function SearchSourceSelect() {
  // Set a default value from the available options
  const { reffSource, setReffSource } = useMavenStateController();

  const options = [
    {
      label: "Insight",
      value: "insight",
      src: "/platform/insight.png",
      description:
        "Use internal search references without information from online marketplace platform (LLM plus API data sources), only display exact product without any variants.",
    },
    {
      label: "Tokopedia",
      value: "tokopedia",
      src: "/platform/tokopedia.png",
      description:
        "Use Tokpedia platform as the data source, will gives exact information data as is on platform as well as products that match the query.",
    },
    {
      label: "Shopee",
      value: "shopee",
      src: "/platform/shopee.jpeg",
      description:
        "Unlike Tokopedia, this will behave as Insight but with product links reference that match the query and not get any related data from Shopee platform.",
    },
  ];

  return (
    <div className="h-screen bg-black flex w-full justify-center items-center">
      <div className="h-[300px] w-[500px] flex flex-col justify-between">
        <div className="text-white">
          <p className="text-4xl">{reffSource}</p>
        </div>
        <div className="w-full">
          <Select
            value={reffSource}
            onValueChange={(value) => setReffSource(value)}
          >
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <SelectTrigger className="rounded-full text-xs space-x-2 *:hover:text-purple-500">
                    <SelectValue
                      placeholder="Select source"
                      className="capitalize *:text-xs md:text-xs"
                    />
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent className="rounded-xl max-w-sm">
                  <div className="flex flex-col">
                    <p className="mb-2">
                      Prefer to use insight or from related marketplace
                      information references
                    </p>
                    <div className="space-y-1 lg:space-y-2">
                      {options.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 lg:space-x-3"
                        >
                          <Image
                            src={item.src}
                            alt={item.label}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                          <p>
                            <span className="font-semibold">{item.label}</span>,{" "}
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <SelectContent className="rounded-[20px]">
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="rounded-full *:hover:text-purple-500"
                >
                  <div className="flex items-center space-x-2">
                    <TextSearch className="size-4 shrink-0" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
