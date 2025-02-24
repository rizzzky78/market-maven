"use client";

import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CopyCheck, Link2, Loader, Share2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";
import useSWRMutation from "swr/mutation";

interface ShareButtonProps {
  title: string;
  callId: string;
  disabled?: boolean;
  type:
    | "product-search"
    | "product-details"
    | "products-comparison"
    | "public-chat";
}

async function postRequest(
  url: string,
  { arg }: { arg: { callId: string; type: string } }
) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      componentId: arg.callId,
      componentType: arg.type,
    }),
  }).then((res) => res.json());
}

export const ShareButton: FC<ShareButtonProps> = ({
  title,
  callId,
  type,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [done, setDone] = useState(false);
  const [link, setLink] = useState("");
  const { trigger, isMutating } = useSWRMutation("/api/share", postRequest);

  const handleActionShare = async () => {
    try {
      const result = await trigger({ callId, type });

      if (result) {
        setDone(true);
        setLink(result.shareUrl);
      }
      console.log("POST Success:", result);
    } catch (err) {
      console.error("POST Error:", err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={disabled}
                className="rounded-full mr-2 size-8"
              >
                <Share2 className="mr-0.5 h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent className="rounded-3xl">
            <p className="max-w-sm font-semibold">
              Share this {title}, anyone with link can view
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="max-w-sm lg:max-w-md rounded-3xl md:rounded-3xl lg:rounded-3xl bg-white/80 dark:bg-black/80">
        <DialogHeader>
          <DialogTitle>Share link for {title}</DialogTitle>
          <DialogDescription>
            Anyone with the link will be able to view the content.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          {done ? (
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={link}
                readOnly
                className="rounded-3xl text-xs"
              />
            </div>
          ) : (
            <div className="bg-white/80 h-8 dark:bg-black/80 w-full rounded-3xl flex items-center justify-center">
              <Link2 className="size-6 mr-2" />
              <span className="text-xs">This will make the link publicly</span>
            </div>
          )}
          {done ? (
            <Button
              size="icon"
              className="px-3 rounded-3xl min-w-4"
              onClick={handleCopy}
            >
              {isCopied ? (
                <CopyCheck className="size-7" />
              ) : (
                <Copy className="size-7" />
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              className="px-3 rounded-3xl min-w-20"
              onClick={handleActionShare}
            >
              {isMutating ? (
                <Loader className="size-6 animate-spin" />
              ) : (
                "Share"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
