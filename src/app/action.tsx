import { mapUIState } from "@/components/custom/ui-mapper";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ShinyText } from "@/components/maven/shining-glass";
import {
  toCoreMessage,
  toUnifiedUserMessage,
} from "@/lib/agents/action/mutator/mutate-messages";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { SYSTEM_INSTRUCT_CORE } from "@/lib/agents/system-instructions";
import {
  PayloadData,
  AssignController,
  OrchestratorCallback,
  MutableAIState,
  AIState,
  UIState,
  UseAction,
} from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { generateId } from "ai";
import {
  getMutableAIState,
  createStreamableValue,
  streamUI,
  createAI,
  getAIState,
} from "ai/rsc";
import { extractor } from "./actions/extractor";

async function orchestrator(
  payload: PayloadData,
  assignController?: AssignController
): Promise<OrchestratorCallback> {
  "use server";

  logger.info("Process on Server Action", { payload });

  const payloadUserMessage = toUnifiedUserMessage(payload);

  const state: MutableAIState<AIState> = getMutableAIState<typeof AI>();

  state.update({
    ...state.get(),
    messages: [
      ...state.get().messages,
      {
        id: generateId(),
        role: "user",
        content: JSON.stringify(payloadUserMessage),
      },
    ],
  });

  // const generation = createStreamableValue<StreamGeneration>({
  //   process: "initial",
  //   loading: true,
  // });

  // const ui = createStreamableUI(<ShinyText text="Maven is thinking..." />);

  const streamableText = createStreamableValue<string>("");

  const textUi = <StreamAssistantMessage content={streamableText.value} />;

  const { value, stream } = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    system: SYSTEM_INSTRUCT_CORE,
    messages: toCoreMessage(state.get().messages),
    initial: <ShinyText text="Maven is thinking..." />,
    text: async function* ({ content, done }) {
      if (done) {
        state.done({
          ...state.get(),
          messages: [
            ...state.get().messages,
            {
              id: generateId(),
              role: "assistant",
              content,
            },
          ],
        });

        // ui.done();

        streamableText.done();
        // generation.done({
        //   process: "done",
        //   loading: false,
        // });
      } else {
        streamableText.update(content);
        // generation.update({
        //   process: "generating",
        //   loading: true,
        // });
      }

      return textUi;
    },
    tools: {},
  });

  return {
    source: "orchestrator",
    id: generateId(),
    display: value,
    // stream,
    // generation: generation.value,
  };
}

/**
 * AI Provider for: **StreamUI**
 *
 * @method StreamUI
 */
export const AI = createAI<AIState, UIState, UseAction>({
  initialUIState: [],
  initialAIState: {
    chatId: generateId(),
    username: "anonymous@gmail.com",
    messages: [],
  },
  actions: {
    orchestrator,
    extractor
  },
  onSetAIState: async ({ state, done }) => {
    "use server";

    if (done) await saveAIState(state);
  },
  onGetUIState: async () => {
    "use server";

    const aiState = getAIState<typeof AI>();

    if (aiState) {
      const uiState = mapUIState(aiState);
      return uiState;
    } else {
      return;
    }
  },
});

/*

# Agent Tools
- search product { query }
- get product details { query, link }
- products comparison { compare: { title, callId }[] }

# Root Agent `orchestrator()`, contain tools:
- inquire user
- search product

# Sub Level-1 Agent `extractor()`, contain tools:
- get product details

# Sub Leval-2 Agent `comparator()`, contain tools:
- products comparison

code:

      searchProduct: toolSearchProduct({ state: aiState, generation, ui }),
      getProductDetails: toolGetProductDetails({
        state: aiState,
        generation,
        ui,
      }),
      productsComparison: toolProductsComparison({
        state: aiState,
        generation,
        ui,
      }),
      inquireUser: toolInquireUser({
        state: aiState,
        generation,
        ui,
      }),

*/
