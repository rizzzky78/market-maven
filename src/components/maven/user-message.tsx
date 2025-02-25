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
    <div className="w-full mb-14 mt-6 py-4">
      {content.attach_product && (
        <div className="flex justify-end">
          <Badge
            variant={"secondary"}
            className="px-5 py-2 flex max-w-[90%] space-x-2 items-center hover:bg-gray-300 bg-gray-300 dark:bg-white dark:text-black rounded-[2rem]"
          >
            <ArrowUpRight className="size-5 text-purple-400" />
            <p className="font-normal text-xs line-clamp-1">
              {content.attach_product.product.title}
            </p>
          </Badge>
        </div>
      )}
      {content.product_compare && (
        <div className="flex justify-end">
          <div className="max-w-[90%] my-1">
            <div className="grid grid-cols-2 gap-1">
              {content.product_compare.for.map((compare, index) => (
                <Badge
                  key={index}
                  variant={"secondary"}
                  className="text-xs flex items-center font-normal py-2 hover:bg-gray-300 bg-gray-300 dark:bg-white dark:text-black rounded-[2rem]"
                >
                  <ArrowUpRight className="size-4 mr-1 shrink-0 text-purple-500" />
                  <p className="line-clamp-1">{compare.title}</p>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
      {content.inquiry_response && (
        <div className="flex justify-end">
          <UserInquiryResponse inquiryResponse={content.inquiry_response} />
        </div>
      )}
      {content.text_input && (
        <div className="flex justify-end">
          <div className="bg-[#343131] w-fit max-w-[90%] py-3 px-5 rounded-[2rem]">
            <div className="group relative">
              <Markdown className="whitespace-pre-wrap text-white">
                {content.text_input}
              </Markdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
