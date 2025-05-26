"use client";

import { FC, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  SearchCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LanguageModelUsage } from "ai";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "../ui/skeleton";
import { QueryValidationData } from "@/lib/types/subtools";

export type QueryValidationProps = {
  data: QueryValidationData;
  usage?: LanguageModelUsage;
};

export const QueryValidation: FC<QueryValidationProps> = ({ data, usage }) => {
  const {
    query_input,
    is_electronic_product,
    product_exists,
    product_category,
    brand_verified,
    market_availability,
    information_sources,
    confidence_level,
    validation_score,
    detailed_reasoning,
    specifications_found,
    alternative_suggestions,
    red_flags,
  } = data;
  const [isExpanded, setIsExpanded] = useState(false);

  const formatLabel = (str: string) => {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getConfidenceColor = (
    level: QueryValidationData["confidence_level"]
  ) => {
    switch (level) {
      case "very_high":
        return "bg-green-600";
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-600";
      case "low":
        return "bg-orange-500";
      case "very_low":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "#22c55e";
    if (score >= 6) return "#4ade80";
    if (score >= 4) return "#acc15";
    if (score >= 2) return "#fb923c";
    return "#ef4444";
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="w-full flex justify-start">
      <Card className="w-full max-w-md bg-black/20 dark:bg-transparent rounded-3xl">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-5">
              <div className="flex items-center gap-1.5">
                <SearchCheck className="size-4 text-purple-500" />
                <h3 className="text-xs">Query Validation</h3>
              </div>
              <h3
                className="text-sm text-black dark:text-white font-medium leading-none truncate max-w-[200px]"
                title={query_input}
              >
                {query_input}
              </h3>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge
                variant={product_exists ? "default" : "destructive"}
                className="text-xs px-2 py-0 h-5 rounded-full font-normal"
              >
                {product_exists ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-black dark:text-white/90">
                  Validation Score
                </span>
                <span className="font-medium">{validation_score}/10</span>
              </div>
              <Progress
                value={validation_score * 10}
                className="h-[3px]"
                customColor={getScoreColor(validation_score)}
              />
            </div>

            <div className="py-[10px] grid grid-cols-2 gap-2 text-xs text-black/80 dark:text-white/80">
              <div className="flex items-center gap-1.5">
                {getStatusIcon(is_electronic_product)}
                <span>Electronic Product</span>
              </div>
              <div className="flex items-center gap-1.5">
                {getStatusIcon(brand_verified)}
                <span>Brand Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                {getStatusIcon(product_exists)}
                <span>Product Exists</span>
              </div>
              <div className="flex items-center gap-1.5">
                {getStatusIcon(specifications_found)}
                <span>Specs Found</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 *:border-black/20 dark:*:border-white/20">
              <Badge
                variant="outline"
                className="text-xs px-2 py-1 h-6 rounded-full font-normal"
              >
                {formatLabel(product_category)}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs px-2 py-1 h-6 rounded-full font-normal"
              >
                {formatLabel(market_availability)}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-2 py-1 h-6 rounded-full font-normal",
                  getConfidenceColor(confidence_level)
                )}
              >
                {formatLabel(confidence_level)}
              </Badge>
            </div>

            {red_flags.length > 0 && red_flags[0] !== "none_detected" && (
              <div className="flex items-start gap-1.5 p-2 rounded-sm">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-red-700">Red Flags:</p>
                  <ul className="text-xs text-red-600 pl-3 list-disc">
                    {red_flags.map((flag) => (
                      <li key={flag}>{formatLabel(flag)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {isExpanded && (
            <>
              <Separator className="my-3 bg-black/10 dark:bg-white/10" />

              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-medium mb-1 text-black dark:text-white">
                    Reasoning:
                  </p>
                  <p className="text-black/80 dark:text-white/80">
                    {detailed_reasoning}
                  </p>
                </div>

                <div className="flex flex-col">
                  <p className="font-medium text-black dark:text-white mb-1">
                    Information Sources:
                  </p>
                  <div className="flex flex-wrap gap-1.5 *:border-black/20 dark:*:border-white/20">
                    {information_sources.map((source) => (
                      <Badge
                        key={source}
                        variant="outline"
                        className="text-xs rounded-full font-normal h-6 py-1 px-2"
                      >
                        {formatLabel(source)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {alternative_suggestions.length > 0 && (
                  <div>
                    <p className="font-medium mb-1 text-black dark:text-white">
                      Alternative Suggestions:
                    </p>
                    <ul className="pl-4 list-disc text-black/80 dark:text-white/80">
                      {alternative_suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {usage && (
                  <div className="w-full flex justify-end">
                    <div className="flex items-center space-x-1 text-black dark:text-white">
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger
                            asChild
                            className="hover:text-purple-500"
                          >
                            <Info className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent className="rounded-3xl">
                            <div className="p-2">
                              <p className="font-medium mb-1 text-white dark:text-black">
                                Usage for this action:
                              </p>
                              <ul className="pl-4 list-disc text-white/80 dark:text-black/80">
                                {Object.entries(usage).map(
                                  ([key, value], index) => (
                                    <li key={index}>
                                      {key} <span>{value}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <p>Usage</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="p-2 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 w-full rounded-full hover:bg-muted"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <span className="flex items-center gap-1">
                Show Less <ChevronUp className="h-3 w-3" />
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Show More <ChevronDown className="h-3 w-3" />
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export const QueryValidationSkeleton = () => {
  return (
    <div className="w-full flex justify-start">
      <Card className="w-full max-w-md bg-black/20 dark:bg-transparent rounded-3xl">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <SearchCheck className="size-4 text-purple-500" />
                <h3 className="text-xs">Query Validation</h3>
                <Loader2 className="animate-spin size-4" />
              </div>
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-black dark:text-white/90">
                  Validation Score
                </span>
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-[4px] w-full rounded-full" />
            </div>

            <div className="py-[10px] grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4 rounded-full" />
                <span className="text-black/80 dark:text-white/80">
                  Electronic Product
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4 rounded-full" />
                <span className="text-black/80 dark:text-white/80">
                  Brand Verified
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4 rounded-full" />
                <span className="text-black/80 dark:text-white/80">
                  Product Exists
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4 rounded-full" />
                <span className="text-black/80 dark:text-white/80">
                  Specs Found
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-2 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 w-full rounded-full hover:bg-muted"
            disabled
          >
            <span className="flex items-center gap-1">
              Show More <ChevronDown className="h-3 w-3" />
            </span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
