import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FC } from "react";
import { InquiryResponse } from "@/lib/types/ai";
import { ArrowDownLeft } from "lucide-react";

interface InquiryProps {
  inquiryResponse: InquiryResponse;
}

export const UserInquiryResponse: FC<InquiryProps> = ({ inquiryResponse }) => {
  const { question, selected, input, skipped } = inquiryResponse;

  return (
    <div className="max-w-[90%] my-1">
      <div className="flex justify-end">
        <div className="absolute -mt-3 mr-6">
          <div className="rounded-full border bg-background text-muted-foreground py-1 pl-2 pr-3 flex items-center">
            <ArrowDownLeft className="size-4 mr-1 text-muted-foreground" />
            <p className="text-xs font-semibold">Inquiry Response</p>
          </div>
        </div>
      </div>
      <Card className="max-w-2xl w-full rounded-2xl bg-secondary shadow-none border-0">
        <CardContent className="pt-7">
          {skipped ? (
            <div className="w-36 flex justify-center">
              <p className="text-sm italic text-foreground">
                Skipped inquiry.
              </p>
            </div>
          ) : (
            <>
              {question && (
                <div className="mb-2">
                  <h3 className="text-muted-foreground text-xs font-semibold mb-1">
                    Question:
                  </h3>
                  <p className="text-sm text-foreground">
                    {question}
                  </p>
                </div>
              )}
              {selected && selected.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-semibold mb-1 text-muted-foreground">
                    Selected Options:
                  </h3>
                  <div className="flex flex-wrap gap-1 text-foreground">
                    {selected.map((option, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs capitalize font-normal rounded-full bg-background"
                      >
                        {option.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {input && (
                <div>
                  <h3 className="text-muted-foreground text-xs font-semibold mb-1">
                    Text Input:
                  </h3>
                  <p className="text-sm text-foreground">
                    {input}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
