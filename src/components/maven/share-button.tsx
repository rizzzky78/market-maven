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
import { Share2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";

interface ShareButtonProps {
  title: string;
  type: string;
  link: string;
}

export const ShareButton: FC<ShareButtonProps> = ({ title, type, link }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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
              <Button variant="outline" className="rounded-full mr-2 size-8">
                <Share2 className="mr-0.5 h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent className="rounded-3xl">
            <p className="max-w-sm font-semibold">
              Share this product details, anyone with link can view
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-md rounded-3xl bg-black/80">
        <DialogHeader>
          <DialogTitle>Share link for {title}</DialogTitle>
          <DialogDescription>
            Anyone with the link will be able to view this search result.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={link}
              readOnly
              className="rounded-3xl"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="px-3 rounded-3xl min-w-16"
            onClick={handleCopy}
          >
            {isCopied ? "Copied" : "Copy"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
