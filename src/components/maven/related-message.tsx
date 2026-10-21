"use client";

import { PartialRelated, RelatedQuery } from "@/lib/agents/schema/related";
import { readStreamed } from "@/lib/utils";
import type { Streamed } from "@/lib/types/ai";
import { ArrowRightLeft } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { ErrorMessage } from "./error-message";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useMavenChat } from "@/lib/utility/provider/chat-provider";
import { useMavenStateController } from "../hooks/maven-state-controller";
import { Skeleton } from "../ui/skeleton";
import {
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Card,
} from "../ui/card";

interface RelatedProps {
  related: RelatedQuery | null;
}

export const RelatedMessage: FC<RelatedProps> = ({ related }) => {
  const { submit } = useMavenChat();
  const { isGenerating } = useAppState();
  const { attachment, flush, activeComparison } = useMavenStateController();

  const relatedActionSubmit = useCallback(
    async (query: string) => {
      if (isGenerating) return;

      flush();
      await submit({ textInput: query });
    },
    [flush, isGenerating, submit]
  );

  const isButtonDisabled = attachment
    ? true
    : activeComparison
    ? true
    : isGenerating;

  const handleSubmit = async (query: string) => {
    if (isButtonDisabled) return;
    await relatedActionSubmit(query);
  };

  return (
    <div className="my-12 w-full">
      <div className="mb-2">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Related Queries</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {related &&
          related.items.map((item, index) => (
            <button
              key={index}
              onClick={async () => await handleSubmit(item.query)}
              className={`${
                isButtonDisabled ? "cursor-default" : "cursor-pointer"
              } w-full`}
              disabled={isButtonDisabled}
            >
              <Card
                className={`h-full ${
                  isButtonDisabled
                    ? "opacity-75"
                    : "hover:bg-foreground/5 bg-background"
                }`}
              >
                <CardHeader className="pt-2 pb-1 px-3">
                  <CardTitle className="text-sm text-start text-foreground">
                    {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2">
                  <CardDescription className="text-xs text-start">
                    {item.query}
                  </CardDescription>
                </CardContent>
              </Card>
            </button>
          ))}
      </div>
    </div>
  );
};

interface StreamRelatedProps {
  content: Streamed<PartialRelated>;
}

export const StreamRelatedMessage: FC<StreamRelatedProps> = ({ content }) => {
  const [data, error, pending] = readStreamed(content);
  const [related, setRelated] = useState<PartialRelated>();

  useEffect(() => {
    if (data) setRelated(data);
  }, [data]);

  if (error)
    return (
      <ErrorMessage
        errorName={"Related Query Stream Error"}
        reason="There was an error stream generation when crafting an related query"
        raw={{ data }}
      />
    );

  return (
    <div className="my-12 w-full">
      <div className="mb-2">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft
            className={`size-4 text-muted-foreground ${
              pending ? "animate-spin" : "animate-none"
            }`}
          />
          <h2 className="text-sm font-semibold">Related Queries</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {related && Array.isArray(related.items) ? (
          related.items.map((item, index) => (
            <Card
              key={index}
              className="hover:bg-foreground/5 h-full bg-background cursor-wait"
            >
              <CardHeader className="pt-2 pb-1 px-3">
                <CardTitle className="text-sm text-foreground">
                  {item?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2">
                <CardDescription className="text-xs">
                  {item?.query}
                </CardDescription>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Skeleton className="w-full h-[40px]" />
            <Skeleton className="w-full h-[40px]" />
            <Skeleton className="w-full h-[40px]" />
          </>
        )}
      </div>
    </div>
  );
};
