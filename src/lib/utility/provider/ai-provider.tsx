import { generateId } from "ai";
import { createAI, getAIState } from "ai/rsc";
import { AIState, UIState, UseAction } from "@/lib/types/ai";
import { getServerSession } from "next-auth";
import { mapUIState } from "@/components/custom/ui-mapper";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { sendMessage } from "@/lib/agents/action/server-action/send-message";

/**
 * AI Provider for: **StreamUI**
 *
 * @method StreamUI
 */
export const AIProvider = createAI<AIState, UIState, UseAction>({
  initialUIState: [],
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  actions: {
    sendMessage,
  },
  onSetAIState: async ({ state, done }) => {
    "use server";

    if (done) {
      const session = await getServerSession();
      await saveAIState(state, session);
    }
  },
  onGetUIState: async () => {
    "use server";

    const aiState = getAIState<typeof AIProvider>();

    if (aiState) {
      const uiState = mapUIState(aiState);
      return uiState;
    } else {
      return;
    }
  },
});
