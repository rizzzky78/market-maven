"use client";

import React, { useEffect, useId, useState } from "react";
import { Grid2X2 } from "lucide-react";
import {
  StreamableValue,
  useActions,
  useStreamableValue,
  useUIState,
} from "ai/rsc";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { generateId } from "ai";
import { UserMessage } from "./user-message";
import { PartialRelated } from "@/lib/agents/schema/related";
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";

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

  const componentId = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsGenerating(true);

    const f = new FormData(e.currentTarget as HTMLFormElement);

    // Get the submitter of the form
    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLInputElement;
    let query = "";
    if (submitter) {
      f.append(submitter.name, submitter.value);
      query = submitter.value;
    }

    setUIState((prevUI) => [
      ...prevUI,
      {
        id: generateId(),
        display: <UserMessage key={componentId} textInput={query} />,
      },
    ]);

    const { id, display } = await sendMessage(f);

    setUIState((prevUI) => [...prevUI, { id, display }]);

    setIsGenerating(false);
  };

  return related ? (
    <form
      className={cn(
        "flex flex-wrap p-6 rounded-xl my-5",
        pending ? "animate-pulse" : ""
      )}
      onSubmit={handleSubmit}
    >
      {Array.isArray(related.items)
        ? related.items
            ?.filter((item) => item?.query !== "")
            .map((item, index) => (
              <div className="flex items-start w-full" key={index}>
                <Grid2X2 className="h-4 w-4 text-purple-200 mr-2 mt-1 flex-shrink-0 text-accent-foreground/50" />
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
  ) : error ? null : (
    <Skeleton className="w-full h-6" />
  );
};
