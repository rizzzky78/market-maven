"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  ReactNode,
  FC,
} from "react";
import { AIState, MutableAIState, ValueOrUpdater } from "@/lib/types/ai";

interface AIStateContextValue extends MutableAIState<AIState> {
  isLoading: boolean;
  error: Error | null;
}

const AIStateContext = createContext<AIStateContextValue | null>(null);

interface AIStateProviderProps {
  username: string;
  children: ReactNode;
  initialState?: Partial<AIState>;
}

export const AIStateProvider: FC<AIStateProviderProps> = ({
  username,
  children,
  initialState = {},
}) => {
  const [state, setState] = useState<AIState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadState = useCallback(async () => {
    try {
      setIsLoading(true);
      const initializedState = await initializeServerState(
        username,
        initialState
      );
      setState(initializedState);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load state"));
    } finally {
      setIsLoading(false);
    }
  }, [username, initialState]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const get = useCallback(() => {
    if (!state) throw new Error("State not initialized");
    return state;
  }, [state]);

  const update = useCallback(
    async (newState: ValueOrUpdater<AIState>) => {
      try {
        const currentState = get();
        const updatedState =
          typeof newState === "function" ? newState(currentState) : newState;

        await updateServerState(username, updatedState);
        setState(updatedState);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update state")
        );
      }
    },
    [username, get]
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <AIStateContext.Provider value={contextValue}>
      {children}
    </AIStateContext.Provider>
  );
};

export const useAIState = () => {
  const context = useContext(AIStateContext);
  if (!context) {
    throw new Error("useAIState must be used within an AIStateProvider");
  }
  return context;
};
