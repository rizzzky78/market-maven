import { FC } from "react";
import { Markdown } from "./markdown";
import { ArrowUpRight } from "lucide-react";
import { UserContentMessage } from "@/lib/types/ai";
import { Badge } from "../ui/badge";
import { UserInquiryResponse } from "./user-inquiry-response";

interface MessageProps {
  content: UserContentMessage;
}

export const UserMessage: FC<MessageProps> = ({ content }) => {
  return (
    <div className="flex w-full flex-col items-end gap-2">
      {content.attach_product && (
        <Badge
          variant={"outline"}
          className="flex max-w-[85%] items-center gap-1.5 rounded-full px-3 py-1.5 font-normal"
        >
          <ArrowUpRight className="size-3.5 shrink-0 text-brand" />
          <span className="line-clamp-1 text-xs">
            {content.attach_product.product.title}
          </span>
        </Badge>
      )}
      {content.product_compare && (
        <div className="grid max-w-[85%] grid-cols-1 gap-1.5 sm:grid-cols-2">
          {content.product_compare.for.map((compare, index) => (
            <Badge
              key={index}
              variant={"outline"}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-normal"
            >
              <ArrowUpRight className="size-3.5 shrink-0 text-brand" />
              <span className="line-clamp-1 text-xs">{compare.title}</span>
            </Badge>
          ))}
        </div>
      )}
      {content.inquiry_response && (
        <UserInquiryResponse inquiryResponse={content.inquiry_response} />
      )}
      {content.text_input && (
        <div className="w-fit max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-4 py-2.5 text-secondary-foreground">
          <Markdown className="whitespace-pre-wrap text-secondary-foreground">
            {content.text_input}
          </Markdown>
        </div>
      )}
    </div>
  );
};
