import { LanguageModelUsage } from "ai";
import { FC } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ArrowDown01 } from "lucide-react";

type HoverCardUsageProps = {
  usage: LanguageModelUsage;
};

export const HoverCardUsage: FC<HoverCardUsageProps> = ({ usage }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="hover:cursor-help border rounded-full py-1.5 px-3 flex items-center space-x-1.5 text-black dark:text-white text-xs">
          <ArrowDown01 className="size-4 shrink-0" />
          <p className="">Usage</p>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 rounded-3xl">
        <div className="text-xs flex flex-col space-y-3">
          <p className="text-black/80 dark:text-white/80">
            Usage on this action
          </p>
          <div className="border rounded-2xl p-2">
            <pre>{JSON.stringify(usage, null, 2)}</pre>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
