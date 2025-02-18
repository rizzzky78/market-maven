import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FC } from "react";
import { InquiryResponse } from "@/lib/types/ai";
import { NotepadText, Link, ArrowDownLeft } from "lucide-react";

interface InquiryProps {
  inquiryResponse: InquiryResponse;
}

export const UserInquiryResponse: FC<InquiryProps> = ({ inquiryResponse }) => {
  const { question, selected, input, skipped } = inquiryResponse;

  return (
    <div className="max-w-[90%] my-1">
      <div className="flex justify-end">
        <div className="absolute -mt-3 mr-6">
          <div className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center">
            <ArrowDownLeft className="size-4 mr-1 text-purple-400" />
            <p className="text-xs font-semibold">Inquiry Response</p>
          </div>
        </div>
      </div>
      <Card className="max-w-2xl w-full rounded-[2rem] bg-gray-400/50 dark:bg-[#1A1A1D]/20">
        <CardContent className="pt-7">
          {skipped ? (
            <div className="w-36 flex justify-center">
              <p className="text-sm italic text-black dark:text-white">
                Skipped inquiry.
              </p>
            </div>
          ) : (
            <>
              {question && (
                <div className="mb-2">
                  <h3 className="text-black/70 dark:text-white/70 text-xs font-semibold mb-1">
                    Question:
                  </h3>
                  <p className="text-sm text-black/90 dark:text-white/90">
                    {question}
                  </p>
                </div>
              )}
              {selected && selected.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-semibold mb-1 text-black/70 dark:text-white/70">
                    Selected Options:
                  </h3>
                  <div className="flex flex-wrap gap-1 text-black/90 dark:text-white/90">
                    {selected.map((option, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs font-normal rounded-3xl bg-purple-400/30"
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {input && (
                <div>
                  <h3 className="text-black/70 dark:text-white/70 text-xs font-semibold mb-1">
                    Text Input:
                  </h3>
                  <p className="text-sm text-black/90 dark:text-white/90">
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
