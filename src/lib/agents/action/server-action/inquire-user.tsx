import {
  AIState,
  MutableAIState,
  RenderTool,
  StreamGeneration,
} from "@/lib/types/ai";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { LoadingText } from "@/components/maven/shining-glass";
import logger from "@/lib/utility/logger";
import { generateId } from "ai";
import { mutateTool } from "../mutator/mutate-tool";
import { inquireUserSchema } from "../../schema/tool-parameters";
import { UserInquiry } from "@/components/maven/user-inquiry";

type ToolProps = {
  state: MutableAIState<AIState>;
  generation: ReturnType<typeof createStreamableValue<StreamGeneration>>;
  ui: ReturnType<typeof createStreamableUI>;
};

export const toolInquireUser = ({ state, ui, generation }: ToolProps) => {
  const tool: RenderTool<typeof inquireUserSchema> = {
    description: `Compare two products based on user requested data`,
    parameters: inquireUserSchema,
    generate: async function* (inquiry) {
      logger.info("Using inquireUser tool");

      generation.update({
        process: "generating",
        loading: true,
      });

      const callId = generateId();
      ui.update(<LoadingText key={callId} text="Creating an Inquiry" />);

      yield ui.value;

      await new Promise((resolve) => setTimeout(resolve, 3000));

      ui.update(<UserInquiry inquiry={inquiry} />);

      const { mutate } = mutateTool({
        name: "inquireUser",
        args: { inquiry },
        result: { data: "no-result" },
        overrideAssistant: {
          content: `Inquiry have been provided, please fill them in accordingly.`,
        },
      });

      state.done({
        ...state.get(),
        messages: [...state.get().messages, ...mutate],
      });

      ui.done();

      logger.info("Done using inquireUser tool");

      generation.done({
        process: "done",
        loading: false,
      });

      return ui.value;
    },
  };

  return tool;
};
