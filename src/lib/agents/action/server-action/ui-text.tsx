import { AI } from "@/app/action";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { AIState, StreamGeneration } from "@/lib/types/ai";
import { generateId } from "ai";
import { createStreamableValue, getMutableAIState } from "ai/rsc";

type ValueOrUpdater<T> = T | ((current: T) => T);

type UITextPayload = {
  aiState: {
    get: () => AIState;
    update: (newState: ValueOrUpdater<AIState>) => void;
    done: (() => void) | ((newState: AIState) => void);
  };
  content: string;
  done: boolean;
  streamControl: {
    text: ReturnType<typeof createStreamableValue<string>>;
    generation: ReturnType<typeof createStreamableValue<StreamGeneration>>;
  };
};

export const uiText = (payload: UITextPayload) => {
  const { aiState, content, done, streamControl } = payload;

  if (done) {
    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: generateId(),
          role: "assistant",
          content,
        },
      ],
    });

    streamControl.generation.done({
      process: "done",
      loading: false,
    });

    streamControl.text.done();
  } else {
    streamControl.generation.update({
      process: "generating",
      loading: true,
    });

    streamControl.text.update(content);
  }
};
