import { mapUIState } from "@/components/custom/ui-mapper";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { orchestrator } from "@/lib/agents/action/server-action/orchestrator";
import { AIState, UIState, UseAction } from "@/lib/types/ai";
import { createAI, getAIState } from "ai/rsc";

/**
 * AI Provider for: **StreamUI**
 *
 * @method StreamUI
 */
export const AI = createAI<AIState, UIState, UseAction>({
  initialUIState: [],
  actions: {
    orchestrator,
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
