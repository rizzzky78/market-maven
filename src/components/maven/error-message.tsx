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
    <Card className="w-full max-w-2xl rounded-xl border-destructive/30 bg-destructive/5 shadow-none" role="alert">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <AlertCircle className="size-4 shrink-0 text-destructive dark:text-red-400" />
          <span>{errorName}</span>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{reason}</CardDescription>
      </CardHeader>
      {raw && (
        <CardContent>
          <Separator className="mb-4" />
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            <p>Details</p>
          </div>
          <ScrollArea className="h-[160px] w-full rounded-lg border bg-muted pr-3">
            <pre className="p-4 text-xs">{JSON.stringify(raw, null, 2)}</pre>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
};
