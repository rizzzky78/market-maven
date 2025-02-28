"use client";

import { Button } from "@/components/ui/button";
import { PartialRelated, RelatedQuery } from "@/lib/agents/schema/related";
import {
  readStreamableValue,
  StreamableValue,
  useActions,
  useStreamableValue,
  useUIState,
} from "ai/rsc";
import { ArrowRight, ArrowRightLeft } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { ErrorMessage } from "./error-message";
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useSmartTextarea } from "../hooks/use-smart-textare";
import { StreamGeneration } from "@/lib/types/ai";
import { generateId } from "ai";
import { UserMessage } from "./user-message";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

interface RelatedProps {
  related: RelatedQuery | null;
}

export const RelatedMessage: FC<RelatedProps> = ({ related }) => {
  const [, setUIState] = useUIState<typeof AI>();
  const { orchestrator } = useActions<typeof AI>();
  const { isGenerating, setIsGenerating } = useAppState();
  const { attachment, flush, activeComparison } = useSmartTextarea();

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

        const { id, display, generation } = await orchestrator({
          textInput: query,
        });

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
    [flush, isGenerating, orchestrator, setIsGenerating, setUIState]
  );

  const isButtonDisabled = attachment
    ? true
    : activeComparison
    ? true
    : isGenerating;

  return (
    <div className="w-full my-10 text-sm border-[#1A1A1D] dark:border-inherit border rounded-3xl">
      <div className="flex items-center ml-3.5 pt-3">
        <ArrowRightLeft className="size-4 mr-1 shrink-0" />
        <h3 className="text-sm font-medium">
          Related
          <span className="ml-2 text-xs opacity-60 font-normal">
            (tap to append query)
          </span>
        </h3>
      </div>
      <div className="space-y-1 rounded-3xl py-2 px-2">
        <Separator className="bg-[#1A1A1D] dark:bg-muted" />
        <div className="pt-1">
          {related &&
            related.items.map((item, index) => (
              <div
                key={index}
                className="flex w-full flex-wrap lg:flex-nowrap items-center pb-1 last:pb-0"
              >
                <p className="ml-2 text-xs mr-0 md:mr-1 font-medium whitespace-nowrap">
                  {item?.label}:
                </p>
                <Button
                  variant={"link"}
                  className="h-auto rounded-2xl w-full py-1 px-2 text-xs font-normal justify-between hover:bg-purple-400/50 dark:hover:bg-purple-400/20"
                  onClick={async () =>
                    await relatedActionSubmit(item?.query as string)
                  }
                  disabled={isButtonDisabled}
                >
                  <span className="truncate text-left">{item?.query}</span>
                  <ArrowRight className="size-4 shrink-0 ml-1" />
                </Button>
              </div>
            ))}
        </div>
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
    <div className="w-full my-10 max-w-2xl text-sm border-[#1A1A1D] dark:border-inherit border rounded-3xl">
      <div className="flex items-center ml-3.5 pt-3">
        <ArrowRightLeft
          className={`size-4 mr-1 shrink-0 ${
            pending ? "animate-spin" : "animate-none"
          }`}
        />
        <h3 className="text-sm font-medium">
          Related
          <span className="ml-2 text-xs opacity-60 font-normal">
            (tap to append query)
          </span>
        </h3>
      </div>
      <div className="space-y-1 rounded-3xl py-2 px-2">
        <Separator className="bg-[#1A1A1D] dark:bg-muted" />
        <div className="pt-1">
          {Array.isArray(related?.items) ? (
            related.items.map((item, index) => (
              <div
                key={index}
                className="flex w-full items-center space-x-2 pb-1 last:pb-0"
              >
                <p className="ml-2 text-xs font-medium whitespace-nowrap">
                  {item?.label}:
                </p>
                <Button
                  variant={"link"}
                  className="h-auto rounded-2xl w-full py-1 px-2 text-xs font-normal justify-between hover:bg-purple-400/50"
                  disabled
                >
                  <span className="truncate text-left">{item?.query}</span>
                  <ArrowRight className="size-4 shrink-0 ml-1" />
                </Button>
              </div>
            ))
          ) : (
            <div>
              <Skeleton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
