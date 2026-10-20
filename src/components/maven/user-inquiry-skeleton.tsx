import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MessageCircle, SkipForward, ArrowRight } from "lucide-react";
import { FC } from "react";

export const InquirySkeleton: FC = () => {
  return (
    <div className="py-10">
      <div className="absolute ml-6 -mt-3">
        <div className="bg-secondary text-secondary-foreground w-fit rounded-xl p-1 px-3 flex items-center">
          <MessageCircle className="w-4 h-4 mr-1" />
          <p className="text-xs font-semibold">Inquiry</p>
        </div>
      </div>
      <Card className="w-full mx-auto bg-transparent rounded-xl shadow-none">
        <CardContent className="pt-6 *:animate-pulse">
          <div className="h-6 bg-muted-foreground/40 rounded-xl w-3/4 mb-3"></div>
          <Separator className="my-3 bg-muted-foreground/40" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-muted-foreground/40"></div>
                <div className="h-4 bg-muted-foreground/40 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="h-4 bg-muted-foreground/40 rounded w-1/3 mb-1"></div>
            <div className="h-8 mt-2 bg-muted-foreground/40 rounded-xl w-full"></div>
          </div>
          <div className="flex justify-end mt-3 space-x-2">
            <Button
              variant="outline"
              className="rounded-xl font-normal"
              disabled
            >
              <span className="mr-1">Skip</span>
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-xl font-normal"
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
