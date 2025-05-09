"use client";

import { FC, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle2, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RateLimitResponse } from "@/lib/types/ai";

interface RateLimitUIProps {
  data: RateLimitResponse;
}

export const RateLimit: FC<RateLimitUIProps> = ({ data }) => {
  const [open, setOpen] = useState(false);

  // Calculate percentages for progress bars
  const requestsPercentage = Math.round(
    (data.current.requests / data.limits.requestsPerDay) * 100
  );
  const conversationPercentage = Math.round(
    (data.current.conversationLength / data.limits.conversationLength) * 100
  );

  // Determine if user is approaching limits
  const isApproachingRequestLimit = requestsPercentage >= 80;
  const isApproachingConversationLimit = conversationPercentage >= 80;
  const isApproachingAnyLimit =
    isApproachingRequestLimit || isApproachingConversationLimit;

  const getBackgroundProgressColor = (value: number): string => {
    const thresholds: [number, string][] = [
      [90, "#ef4444"], // Red for 90+ (highest priority)
      [80, "#f59e0b"], // Orange for 80-89
      [0, "#a855f7"], // Purple for <80 (default)
    ];
    return (
      thresholds.find(([threshold]) => value >= threshold)?.[1] ?? "#a855f7"
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        className="*:font-[family-name:var(--font-satoshi)]"
      >
        <Button
          variant="outline"
          className={cn(
            "bg-transparent min-h-9 min-w-9 justify-center font-normal rounded-full text-xs px-0",
            isApproachingAnyLimit && "text-amber-400 hover:text-amber-800",
            !data.eligible && " text-red-700 hover:text-red-800"
          )}
        >
          <BarChart2 className="h-5 w-5 mx-2" />
          {!data.eligible && (
            <Badge
              variant="outline"
              className="hidden md:inline-flex -ml-3 pl-0 pr-3 py-0 border-none rounded-full text-red-700 text-[10px]"
            >
              Limited
            </Badge>
          )}
          {isApproachingAnyLimit && data.eligible && (
            <Badge
              variant="outline"
              className="hidden md:inline-flex -ml-3 pl-0 pr-3 py-0 border-none h-6 rounded-full text-amber-700 text-[10px]"
            >
              {Math.min(data.remaining.requests, data.remaining.messages)} left
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-xl md:rounded-3xl max-w-md lg:max-w-lg *:font-[family-name:var(--font-satoshi)]">
        <Card className="bg-background border-0 shadow-none pt-8">
          <CardHeader className="px-0 pt-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary text-md font-medium">
                Usage Limits
              </CardTitle>
              {data.eligible ? (
                <Badge
                  variant="outline"
                  className="bg-purple-50 rounded-full text-purple-700 border-purple-200"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-50 rounded-full text-red-700 border-red-200"
                >
                  <AlertCircle className="mr-1 h-3 w-3" /> Limited
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {!data.eligible &&
                data.reason === "RPD_LIMIT_EXCEEDED" &&
                "You've reached your daily request limit. Try again tomorrow or upgrade your plan."}
              {!data.eligible &&
                data.reason === "CONVERSATION_LIMIT_EXCEEDED" &&
                "This conversation has reached the maximum length. Please start a new conversation."}
              {data.eligible && "Your current API usage and remaining limits"}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 px-0">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="text-primary text-sm font-medium">
                  Daily Requests
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.current.requests} / {data.limits.requestsPerDay}
                </div>
              </div>
              <Progress
                value={requestsPercentage}
                className="h-1"
                customColor={getBackgroundProgressColor(requestsPercentage)}
              />
              <div className="text-xs text-muted-foreground">
                {data.remaining.requests} requests remaining today
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="text-primary text-sm font-medium">
                  Conversation Length
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.current.conversationLength} /{" "}
                  {data.limits.conversationLength}
                </div>
              </div>
              <Progress
                value={conversationPercentage}
                className="h-1"
                customColor={getBackgroundProgressColor(conversationPercentage)}
              />
              <div className="text-xs text-muted-foreground">
                {data.remaining.messages} messages remaining in this
                conversation
              </div>
            </div>

            {data.reset && (
              <>
                <Separator className="my-1" />
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-2 h-3 w-3" />
                  <span>Limits reset at {data.reset.formatted}</span>
                </div>
              </>
            )}

            {data.current.isFirstTimeUser && (
              <div className="rounded-md p-3 text-xs bg-white text-purple-500 border">
                <p className="font-medium mb-1">Welcome to our service!</p>
                <p>
                  As a first-time user, you have {data.limits.requestsPerDay}{" "}
                  requests per day, which includes a bonus of 5 additional
                  requests.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
