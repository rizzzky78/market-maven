"use client";

import { ErrorMessage } from "@/components/maven/error-message";
import {
  getServerState,
  updateServerState,
} from "@/lib/agents/action/mutator/ai-state-service";
import { AIState, MutableAIState, ValueOrUpdater } from "@/lib/types/ai";
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AIStateContextValue extends MutableAIState<AIState> {
  isLoading: boolean;
  error: Error | null;
}

const AIStateContext = createContext<AIStateContextValue | null>(null);

interface AIStateProviderProps {
  username: string;
  children: ReactNode;
  initialState: AIState;
  serverPreloaded?: boolean;
}

export function AIStateProvider({
  username,
  children,
  initialState,
  serverPreloaded = false,
}: AIStateProviderProps) {
  const [state, setState] = useState<AIState>(initialState);
  const [isLoading, setIsLoading] = useState(!serverPreloaded);
  const [error, setError] = useState<Error | null>(null);

  // Only fetch initial state if not preloaded from server
  const loadState = useCallback(async () => {
    if (serverPreloaded) return;

    try {
      setIsLoading(true);
      const serverState = await getServerState(username);
      if (serverState) {
        setState(serverState);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load state"));
    } finally {
      setIsLoading(false);
    }
  }, [username, serverPreloaded]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const get = useCallback(() => state, [state]);

  const update = useCallback(
    async (newState: ValueOrUpdater<AIState>) => {
      try {
        const updatedState =
          typeof newState === "function" ? newState(state) : newState;

        await updateServerState(updatedState);

        setState(updatedState);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update state")
        );
        throw err;
      }
    },
    [state]
  );

  const done = useCallback(
    async (finalState?: AIState) => {
      if (finalState) {
        await update(finalState);
      }
    },
    [update]
  );

  const contextValue = useMemo(
    () => ({
      get,
      update,
      done,
      isLoading,
      error,
    }),
    [get, update, done, isLoading, error]
  );

  if (error) {
    return (
      <ErrorMessage
        errorName="AI State Provider Error"
        reason="There was an error while fetching AI State data from the server."
        raw={{ error }}
      />
    );
  }

  return (
    <AIStateContext.Provider value={contextValue}>
      {children}
    </AIStateContext.Provider>
  );
}

export function useAIState() {
  const context = useContext(AIStateContext);
  if (!context) {
    throw new Error("useAIState must be used within an AIStateProvider");
  }
  return context;
}
