import { Info, Loader2, MoveRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FC } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LanguageModelUsage } from "ai";
import { Skeleton } from "../ui/skeleton";
import { QueryEnhancedData } from "@/lib/types/subtools";

export interface QueryEnhancementProps {
  data: QueryEnhancedData;
  usage?: LanguageModelUsage;
}

export const QueryEnhancement: FC<QueryEnhancementProps> = ({
  data,
  usage,
}) => {
  const {
    original_query,
    enhanced_query,
    enhancement_type,
    confidence_score,
    reasoning,
  } = data;

  const formatLabel = (str: string) => {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="w-full flex justify-start">
      <Card className="w-full max-w-md bg-black/20 dark:bg-transparent rounded-3xl">
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <h3 className="text-xs">Query Enhancement</h3>
            </div>
            <Badge
              variant={"outline"}
              className="text-xs px-1.5 py-0 h-5 rounded-full font-normal shadow-none hover:bg-transparent"
            >
              {formatLabel(enhancement_type)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2 text-sm text-black dark:text-white font-medium">
            <p>
              Query: <span>{original_query}</span>
            </p>
            <div className="flex items-center space-x-2 font-normal">
              <MoveRight className="size-4 text-black/60 dark:text-white/80" />
              <p>{enhanced_query}</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-black/80 dark:text-white/80">
                Confidence Score: {confidence_score}
              </span>
            </div>
          </div>

          <Separator className="my-2 bg-black/10 dark:bg-white/10" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-black dark:text-white">
              Reasoning:
            </p>
            <p className="text-xs text-black/80 dark:text-white/80">
              {reasoning}
            </p>
            {usage && (
              <div className="w-full flex justify-end text-xs">
                <div className="flex items-center space-x-1 text-black dark:text-white">
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild className="hover:text-purple-500">
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
        </CardContent>
      </Card>
    </div>
  );
};

export const QueryEnhancementSkeleton = () => {
  return (
    <div className="w-full flex justify-start">
      <Card className="w-full max-w-md bg-black/20 dark:bg-transparent rounded-3xl">
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <h3 className="text-xs">Query Enhancement</h3>
              <Loader2 className="animate-spin size-4" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-black dark:text-white font-medium">
                Query:
              </span>
              <Skeleton className="h-4 w-[40px] flex-1" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-40 flex-1" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-start space-x-2 items-center text-xs">
              <span className="text-black/80 dark:text-white/80">
                Confidence Score:
              </span>
              <Skeleton className="mt-1 h-3 w-8" />
            </div>
          </div>

          <Separator className="my-2 bg-black/10 dark:bg-white/10" />

          <div className="space-y-1">
            <p className="text-xs font-medium text-black dark:text-white">
              Reasoning:
            </p>
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>

            <div className="w-full flex justify-end pt-2">
              <div className="flex items-center space-x-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
