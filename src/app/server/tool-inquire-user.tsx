import { ErrorMessage } from "@/components/maven/error-message";
import { LoadingText } from "@/components/maven/shining-glass";
import { UserInquiry } from "@/components/maven/user-inquiry";
import { InquirySkeleton } from "@/components/maven/user-inquiry-skeleton";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import {
  inputInquirySchema,
  inquireUserSchema,
} from "@/lib/agents/schema/tool-parameters";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { generateId, streamObject } from "ai";

const toolInquireUser = ({ generation, errorState, state }: ToolsetProps) => {
  const inquireUser: RenderTool<typeof inputInquirySchema> = {
    description: TEMPLATE.inquire_user_description,
    parameters: inputInquirySchema,
    generate: async function* (inquiryProp) {
      logger.info("Using inquireUser tool");

      generation.update({
        process: "tool:initial",
        loading: true,
      });

      const parse = inputInquirySchema.safeParse(inquiryProp);

      if (!parse.success || parse.error) {
        generation.done({
          process: "tool:error",
          loading: false,
        });

        return (
          <ErrorMessage
            errorName="Invalid Payload on Inquire Property"
            reason="An error occured when try to parse inquiry payload from LLM"
            raw={{ parse }}
          />
        );
      }

      const callId = generateId();

      yield <LoadingText key={callId} text="Creating an Inquiry" />;

      yield <InquirySkeleton />;

      const { partialObjectStream: inquiryStream, object: inquiryObject } =
        streamObject({
          model: google("gemini-2.0-flash-lite"),
          system: await SYSTEM_INSTRUCTION.INQUIRY_CRAFTER,
          prompt: JSON.stringify(parse.data),
          schema: inquireUserSchema,
          onFinish: ({ usage }) => {
            logger.info("Usage - Inquire User - Step 1", { usage });
          },
          onError: ({ error }) => {
            errorState = {
              isError: true,
              error,
            };
          },
        });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _chunkInquiry of inquiryStream) {
        // will be append value update on streamable value
      }

      if (errorState.isError) {
        generation.done({
          process: "tool:fatal-error",
          loading: false,
          error: "LLM Generation Error",
        });

        return (
          <ErrorMessage
            errorName="LLM Error"
            reason="There was an error on LLMs Agent generation, that's all we know :("
            raw={{
              payload: { inquiry: parse.data },
              error: errorState,
            }}
          />
        );
      } else {
        generation.done({
          process: "tool:done",
          loading: true,
        });
      }

      const inquiryProperty = (await inquiryObject).inquiry;

      mutateTool(state, {
        name: "inquireUser",
        args: { inquiry: inquiryProperty },
        result: { data: "no-result" },
        overrideAssistant: {
          content: `Inquiry have been provided, please fill them in accordingly.`,
        },
      });

      logger.info("Done using inquireUser tool");

      return <UserInquiry inquiry={inquiryProperty} />;
    },
  };

  return inquireUser;
};

export { toolInquireUser };
