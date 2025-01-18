import { mapUIState } from "@/components/custom/ui-mapper";
import { AIState, UIState, UseAction } from "@/lib/types/ai";
import { generateId } from "ai";
import { createAI, getAIState } from "ai/rsc";
import { getServerSession } from "next-auth";

/**
 * AI Provider for: **StreamUI**
 *
 * @method StreamUI
 */
export const AI = createAI<AIState, UIState>({
  initialUIState: [],
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  actions: {},
  onSetAIState: async ({ state, done }) => {
    "use server";

    if (done) {
      const session = await getServerSession();
    }
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
