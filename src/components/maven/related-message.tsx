"use client";

import { PartialRelated, RelatedQuery } from "@/lib/agents/schema/related";
import {
  readStreamableValue,
  StreamableValue,
  useActions,
  useStreamableValue,
  useUIState,
} from "ai/rsc";
import { ArrowRightLeft } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { ErrorMessage } from "./error-message";
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useMavenStateController } from "../hooks/maven-state-controller";
import { StreamGeneration } from "@/lib/types/ai";
import { generateId } from "ai";
import { UserMessage } from "./user-message";
import { toast } from "sonner";
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
  const [, setUIState] = useUIState<typeof AI>();
  const { orchestrator } = useActions<typeof AI>();
  const { isGenerating, setIsGenerating } = useAppState();
  const {
    attachment,
    flush,
    activeComparison,
    search,
    related: relatedOpt,
    reffSource,
  } = useMavenStateController();

  const relatedActionSubmit = useCallback(
    async (query: string) => {
      if (isGenerating) return;

      try {
        setIsGenerating(true);

        const componentId = generateId();

        setUIState((prevUI) => [
          ...prevUI,
          {
            id: generateId(),
            display: (
              <UserMessage
                key={componentId}
                content={{
                  text_input: query,
                }}
              />
            ),
          },
        ]);

        flush();

        const { id, display, generation } = await orchestrator(
          {
            textInput: query,
          },
          {
            onRequest: { search, related: relatedOpt, reffSource },
          }
        );

        setUIState((prevUI) => [...prevUI, { id, display }]);

        if (generation) {
          const gens = readStreamableValue(
            generation
          ) as AsyncIterable<StreamGeneration>;
          for await (const { loading } of gens) {
            setIsGenerating(loading);
          }
        }
      } catch (error) {
        console.error("An Error occurred when submitting the query!", error);
        toast.error("Error When Submitting the Query!", {
          position: "top-center",
          richColors: true,
          className:
            "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [
      flush,
      isGenerating,
      orchestrator,
      reffSource,
      relatedOpt,
      search,
      setIsGenerating,
      setUIState,
    ]
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
          <ArrowRightLeft className="size-4 text-purple-500" />
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
                  <CardTitle className="text-sm text-start text-black/90 dark:text-white/90">
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
  content: StreamableValue<PartialRelated>;
}

export const StreamRelatedMessage: FC<StreamRelatedProps> = ({ content }) => {
  const [data, error, pending] = useStreamableValue(content);
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
            className={`size-4 text-purple-500 ${
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
                <CardTitle className="text-sm text-black/90 dark:text-white/90">
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
          <Skeleton className="w-full h-4" />
        )}
      </div>
    </div>
  );
};
