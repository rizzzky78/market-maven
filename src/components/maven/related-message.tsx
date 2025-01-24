"use client";

import React, { useCallback, useEffect, useId, useState } from "react";
import { CornerDownRight } from "lucide-react";
import {
  readStreamableValue,
  StreamableValue,
  useActions,
  useStreamableValue,
  useUIState,
} from "ai/rsc";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { generateId } from "ai";
import { UserMessage } from "./user-message";
import { PartialRelated } from "@/lib/agents/schema/related";
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { Separator } from "../ui/separator";
import { StreamGeneration } from "@/lib/types/ai";
import { toast } from "sonner";

export interface RelatedProps {
  relatedQueries: StreamableValue<PartialRelated>;
}

export const RelatedMessage: React.FC<RelatedProps> = ({ relatedQueries }) => {
  const [data, error, pending] = useStreamableValue(relatedQueries);
  const [related, setRelated] = useState<PartialRelated>();
  const { isGenerating, setIsGenerating } = useAppState();

  const [_, setUIState] = useUIState<typeof AI>();
  const { sendMessage } = useActions<typeof AI>();

  useEffect(() => {
    if (data) setRelated(data);
  }, [data]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsGenerating(true);

      try {
        const f = new FormData(e.currentTarget as HTMLFormElement);

        const submitter = (e.nativeEvent as SubmitEvent)
          .submitter as HTMLInputElement;
        let query = "";
        if (submitter) {
          f.append(submitter.name, submitter.value);
          query = submitter.value;
        }

        const componentId = generateId();

        setUIState((prevUI) => [
          ...prevUI,
          {
            id: generateId(),
            display: (
              <UserMessage key={componentId} content={{ text_input: query }} />
            ),
          },
        ]);

        const { id, display, generation } = await sendMessage({
          textInput: query,
        });

        const gens = readStreamableValue(
          generation
        ) as AsyncGenerator<StreamGeneration>;

        for await (const { process, loading, error } of gens) {
          setIsGenerating(loading);
        }

        setUIState((prevUI) => [...prevUI, { id, display }]);
      } catch (error) {
        console.error("An Error occured when submitting the query!", error);
        toast.error("Error When Submitting the Query!", {
          position: "top-center",
          richColors: true,
          className:
            "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
        });
      }
    },
    [sendMessage, setIsGenerating, setUIState]
  );

  return related ? (
    <div className="flex flex-col">
      <h4>Related</h4>
      <Separator />
      <form
        className="flex flex-wrap p-6 rounded-xl my-5"
        onSubmit={handleSubmit}
      >
        {Array.isArray(related.items)
          ? related.items
              ?.filter((item) => item?.query !== "")
              .map((item, index) => (
                <div className="flex items-start w-full" key={index}>
                  <CornerDownRight className="h-4 w-4 text-purple-200 mr-2 mt-1 flex-shrink-0 text-accent-foreground/50" />
                  <Button
                    variant="link"
                    className="flex-1 items-center text-sm justify-start px-0 py-1 h-fit text-white whitespace-normal text-left"
                    type="submit"
                    name={"text_input"}
                    value={item?.query}
                    disabled={isGenerating}
                  >
                    {item?.query}
                  </Button>
                </div>
              ))
          : null}
      </form>
    </div>
  ) : error ? null : (
    <Skeleton className="w-full h-6" />
  );
};
