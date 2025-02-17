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
import { ChevronRight } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { ErrorMessage } from "./error-message";
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useSmartTextarea } from "../hooks/use-smart-textare";
import { StreamGeneration } from "@/lib/types/ai";
import { generateId } from "ai";
import { UserMessage } from "./user-message";
import { toast } from "sonner";

interface RelatedProps {
  related: RelatedQuery;
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

  const isButtonDisabled = Boolean(attachment) || Boolean(activeComparison);

  return (
    <div className="w-full max-w-2xl bg-muted/30 rounded-lg p-3 text-sm">
      <h3 className="text-xs font-medium text-muted-foreground mb-2">
        Related Queries
      </h3>
      <div className="space-y-1">
        {related.items.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 pb-1 last:pb-0 border-b last:border-b-0 border-border/50"
          >
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {item?.label}:
            </span>
            <Button
              variant="ghost"
              className="h-auto py-1 px-2 text-xs font-normal justify-between hover:bg-muted"
              onClick={async () =>
                await relatedActionSubmit(item?.query as string)
              }
              disabled={isButtonDisabled}
            >
              <span className="truncate text-left">{item?.query}</span>
              <ChevronRight className="h-3 w-3 shrink-0 opacity-50 ml-1" />
            </Button>
          </div>
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

  const isButtonDisabled = Boolean(attachment) || Boolean(activeComparison);

  return (
    <div className="w-full max-w-2xl bg-muted/30 rounded-lg p-3 text-sm">
      <h3 className="text-xs font-medium text-muted-foreground mb-2">
        Related Queries
      </h3>
      <div className="space-y-1">
        {Array.isArray(related?.items) ? (
          related.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 pb-1 last:pb-0 border-b last:border-b-0 border-border/50"
            >
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {item?.label}:
              </span>
              <Button
                variant="ghost"
                className="h-auto py-1 px-2 text-xs font-normal justify-between hover:bg-muted"
                onClick={async () =>
                  await relatedActionSubmit(item?.query as string)
                }
                disabled={isButtonDisabled}
              >
                <span className="truncate text-left">{item?.query}</span>
                <ChevronRight className="h-3 w-3 shrink-0 opacity-50 ml-1" />
              </Button>
            </div>
          ))
        ) : (
          <div>Invalid Related Query Items</div>
        )}
      </div>
    </div>
  );
};
