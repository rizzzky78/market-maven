import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MessageCircle, SkipForward, ArrowRight } from "lucide-react";
import { FC } from "react";

export const InquirySkeleton: FC = () => {
  return (
    <div className="py-10">
      <div className="absolute ml-6 -mt-3">
        <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-black w-fit rounded-3xl p-1 px-3 flex items-center">
          <MessageCircle className="w-4 h-4  mr-1" />
          <p className="text-xs font-semibold">Inquiry</p>
        </div>
      </div>
      <Card className="w-full mx-auto bg-transparent rounded-3xl border-[#1A1A1D]">
        <CardContent className="pt-6 *:animate-pulse">
          <div className="h-6 bg-[#1A1A1D]/50 rounded-3xl w-3/4 mb-3"></div>
          <Separator className="my-3 bg-[#1A1A1D]/50" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#1A1A1D]/50"></div>
                <div className="h-4 bg-[#1A1A1D]/50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="h-4 bg-[#1A1A1D]/50 rounded w-1/3 mb-1"></div>
            <div className="h-8 mt-2 bg-[#1A1A1D]/50 rounded-3xl w-full"></div>
          </div>
          <div className="flex justify-end mt-3 space-x-2">
            <Button
              variant="outline"
              className="rounded-3xl font-normal"
              disabled
            >
              <span className="mr-1">Skip</span>
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-3xl font-normal"
              disabled
            >
              <span className="mr-1">Submit</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
