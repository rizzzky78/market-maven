import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";
import { FC } from "react";
import { Separator } from "../ui/separator";

interface ErrorCardProps {
  errorName: string;
  reason: string;
  raw?: any;
}

export const ErrorMessage: FC<ErrorCardProps> = ({
  errorName,
  reason,
  raw,
}) => {
  return (
    <Card className="w-full max-w-2xl border-none dark:border-inherit dark:border rounded-3xl bg-red-400 dark:bg-transparent">
      <CardHeader className="space-y-1">
        <CardTitle className="text-sm text-white font-semibold flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{errorName}</span>
        </CardTitle>
        <CardDescription className="text-sm text-white">{reason}</CardDescription>
      </CardHeader>
      {raw && (
        <CardContent>
          <Separator className="mb-4" />
          <div className="text-xs text-white font-medium mb-2">
            <p>Object Reason:</p>
          </div>
          <ScrollArea className="h-[160px] pr-3 bg-[#1A1A1D] w-full border-none dark:border-inherit rounded-2xl dark:border">
            <pre className="p-4 text-xs">{JSON.stringify(raw, null, 2)}</pre>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
};
