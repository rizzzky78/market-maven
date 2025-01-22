/* eslint-disable @next/next/no-img-element */
"use client";

import { StreamableValue, useStreamableValue } from "ai/rsc";
import { FC, useEffect, useState } from "react";
import { ExtendedToolResult } from "@/lib/types/ai";
import { Info, NotepadText } from "lucide-react";
import { Separator } from "../ui/separator";
import { Lens } from "./lens";
import { ProductInsight as DynamicInsight } from "./dynamic-insight";

interface ProductDetailsProps {
  content: ExtendedToolResult<
    { link: string; query: string },
    { insight: Record<string, any>; screenshot: string; callId: string }
  >;
}

export const ProductInsight: FC<ProductDetailsProps> = ({ content }) => {
  const { success, data } = content;

  const [hovering, setHovering] = useState(false);

  if (!success) {
    return (
      <div>
        <div className="bg-red-500 p-5 rounded-3xl space-y-1">
          <h2 className="bg-black py-1 p-5 rounded-3xl w-fit text-sm">
            An Error occured :(
          </h2>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(
              { name: content.name, args: content.args },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    );
  }

  const { callId, insight, screenshot } = data;
  return (
    <div className="w-full">
      <div className="absolute ml-4 -mt-4">
        <div className="bg-[#1A1A1D] dark:bg-white rounded-3xl py-1 pl-2 pr-3 flex items-center">
          <NotepadText className="size-4 text-white dark:text-black mr-1" />
          <p className="text-xs text-white dark:text-black font-semibold">
            Product Details
          </p>
        </div>
      </div>
      <div className="w-full border rounded-[2rem] px-4 py-1">
        <div>
          {screenshot && (
            <div className="mt-3">
              <Lens
                hovering={hovering}
                setHovering={setHovering}
                zoomFactor={2}
                lensSize={270}
              >
                <img
                  src={screenshot}
                  alt="Searched Product"
                  className="object-cover"
                />
              </Lens>
              <div className="w-fit p-1 mt-2 rounded-full">
                <div className="flex items-center space-x-2">
                  <Info className="size-4" />
                  <p className="text-xs">
                    This app is not affiliated with the relevant online
                    marketplace.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <Separator className="mt-2 mb-4" />
        <DynamicInsight data={[insight]} isGenerating={false} callId={callId} />
      </div>
    </div>
  );
};

interface StreamProps {
  content: StreamableValue<Record<string, any>>;
  callId?: string;
  screenshot?: string;
}

export const StreamProductInsight: FC<StreamProps> = ({
  content,
  callId,
  screenshot,
}) => {
  const [raw, error, pending] = useStreamableValue(content);
  const [data, setData] = useState<Record<string, any>>({});
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (raw) setData(raw);
  }, [raw]);

  if (error) {
    return (
      <div>
        <div>
          <h1>An Error Occured when parsing the RAW data!</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border rounded-[2rem] px-4 py-1">
      <div>
        {screenshot && (
          <div className="mt-3">
            <Lens
              hovering={hovering}
              setHovering={setHovering}
              zoomFactor={2}
              lensSize={270}
            >
              <img
                src={screenshot}
                alt="Searched Product"
                className="object-cover"
              />
            </Lens>
            <div className="w-fit p-1 mt-2 rounded-full">
              <div className="flex items-center space-x-2">
                <Info className="size-4" />
                <p className="text-xs">
                  This app is not affiliated with the relevant online
                  marketplace.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Separator className="mt-2 mb-4" />
      <DynamicInsight data={[data]} isGenerating={false} callId={callId} />
    </div>
  );
};
