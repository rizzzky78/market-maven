"use client";

import { useMavenStateController } from "@/components/hooks/maven-state-controller";
import { useModelSettings } from "@/components/hooks/use-model-settings";
import { toUnifiedUserMessage } from "@/lib/agents/action/mutator/mutate-messages";
import {
  AIState,
  ChatRequestBody,
  MavenUIMessage,
  MessageProperty,
  PayloadData,
} from "@/lib/types/ai";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

type MavenChatContextValue = {
  /** Messages saved before this page load, rendered by `mapUIState`. */
  history: AIState;
  /** Messages sent and streamed since this page load. */
  messages: MavenUIMessage[];
  /** Current `process` of the reply being generated. */
  stage: string;
  /** Sends a message with the current Search / Related / Source options. */
  submit: (payload: PayloadData) => Promise<void>;
  /** Stops the reply being generated; the server aborts its work too. */
  stop: () => Promise<void>;
  /** History plus the live user messages, for the rate limit checks. */
  aiState: AIState;
};

const MavenChatContext = createContext<MavenChatContextValue | null>(null);

type MavenChatProviderProps = {
  chatId: string;
  username: string;
  initialMessages: MessageProperty[];
  children: ReactNode;
};

/**
 * Holds one chat: its saved history and the `useChat` session streaming
 * replies from `POST /api/chat`. Only the new message is sent; the server
 * reads the history from the database.
 */
export const MavenChatProvider: FC<MavenChatProviderProps> = ({
  chatId,
  username,
  initialMessages,
  children,
}) => {
  const { setIsGenerating } = useAppState();
  const { search, related, reffSource } = useMavenStateController();
  const modelConfig = useModelSettings((s) => s.config);
  const [stage, setStage] = useState("");

  const { messages, sendMessage, status, stop } = useChat<MavenUIMessage>({
    id: chatId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, body }) => ({
        body: { ...body, chatId: id },
      }),
    }),
    onData: (part) => {
      if (part.type === "data-generation") setStage(part.data.process);
    },
    onError: (error) => {
      console.error("An Error occured when submitting the query!", error);
      toast.error("Error When Submitting the Query!", {
        // e.g. "Invalid AI provider settings" from the chat route
        description: error.message,
        position: "top-center",
        richColors: true,
        className:
          "text-xs flex justify-center rounded-3xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
      });
    },
  });

  useEffect(() => {
    setIsGenerating(status === "submitted" || status === "streaming");
  }, [setIsGenerating, status]);

  // Leaving the chat (new chat, another chat) stops its running reply.
  useEffect(() => () => void stop(), [stop]);

  const submit = useCallback(
    async (payload: PayloadData) => {
      const body: Omit<ChatRequestBody, "chatId"> = {
        payload,
        requestOption: { onRequest: { search, related, reffSource } },
        model: modelConfig ?? undefined,
      };

      await sendMessage(
        {
          parts: [{ type: "data-user", data: toUnifiedUserMessage(payload) }],
        },
        { body }
      );
    },
    [modelConfig, reffSource, related, search, sendMessage]
  );

  const history = useMemo(
    () => ({ chatId, username, messages: initialMessages }),
    [chatId, initialMessages, username]
  );

  // Only the roles are counted, so it changes per message, not per chunk.
  const messageRoles = messages.map((m) => m.role).join();
  const aiState = useMemo(
    () => ({
      ...history,
      messages: [
        ...history.messages,
        ...messageRoles
          .split(",")
          .filter(Boolean)
          .map((role, i) => ({
            id: `live-${i}`,
            role: role as MessageProperty["role"],
            content: "",
          })),
      ],
    }),
    [history, messageRoles]
  );

  const value = useMemo(
    () => ({ history, messages, stage, submit, stop, aiState }),
    [aiState, history, messages, stage, stop, submit]
  );

  return (
    <MavenChatContext.Provider value={value}>
      {children}
    </MavenChatContext.Provider>
  );
};

/**
 * Access to the current chat. Throws outside `MavenChatProvider`.
 */
export const useMavenChat = (): MavenChatContextValue => {
  const context = useContext(MavenChatContext);
  if (!context) {
    throw new Error("useMavenChat must be used within a MavenChatProvider");
  }
  return context;
};
