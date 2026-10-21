/**
 *
 * CODED BY HUMAN BEING :)
 *
 *
 */

import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { TEMPLATE } from "@/lib/agents/constant";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import {
  inputInquirySchema,
  inquireUserSchema,
} from "@/lib/agents/schema/tool-parameters";
import { RenderTool, ToolsetProps } from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { Output, streamText } from "ai";
import { createErrorState } from "./workflow";
import { ui } from "./stream-ui";

const toolInquireUser = ({
  generation,
  state,
  abortSignal,
  models,
}: ToolsetProps) => {
  const inquireUser: RenderTool<typeof inputInquirySchema> = {
    description: TEMPLATE.inquire_user_description,
    inputSchema: inputInquirySchema,
    generate: async function* (inquiryProp) {
      logger.info("Using inquireUser tool");

      const errorState = createErrorState();

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

        return ui("ErrorMessage", {
          errorName: "Invalid Payload on Inquire Property",
          reason: "An error occured when try to parse inquiry payload from LLM",
          raw: { parse },
        });
      }

      yield ui("LoadingText", { text: "Creating an Inquiry" });

      yield ui("InquirySkeleton", {});

      generation.update({
        process: "stream:generating",
        loading: true,
      });

      const { partialOutputStream: inquiryStream, output: inquiryObject } =
        streamText({
          model: models.light,
          abortSignal,
          instructions: await SYSTEM_INSTRUCTION.INQUIRY_CRAFTER,
          prompt: JSON.stringify(parse.data),
          output: Output.object({ schema: inquireUserSchema }),
          onEnd: ({ usage }) => {
            logger.info("Usage - Inquire User - Step 1", { usage });

            generation.update({
              process: "stream:done",
              loading: true,
            });
          },
          onError: ({ error }) => {
            errorState.isError = true;
            errorState.error = error;
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

        return ui("ErrorMessage", {
          errorName: "LLM Error",
          reason:
            "There was an error on LLMs Agent generation, that's all we know :(",
          raw: {
            payload: { inquiry: parse.data },
            error: errorState,
          },
        });
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

      return ui("UserInquiry", { inquiry: inquiryProperty });
    },
  };

  return inquireUser;
};

export { toolInquireUser };
