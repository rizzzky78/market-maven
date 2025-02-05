"use client";

import { ErrorMessage } from "@/components/maven/error-message";
import {
  getServerState,
  updateServerState,
} from "@/lib/agents/action/mutator/ai-state-service";
import {
  MutableAIState,
  AIState,
  UIState,
  ValueOrUpdater,
} from "@/lib/types/ai";
import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Extend the context to include UI state
interface StateContextValue {
  aiState: MutableAIState<AIState>;
  uiState: UIState;
  setUiState: (newState: ValueOrUpdater<UIState>) => void;
  isLoading: boolean;
  error: Error | null;
}

const StateContext = createContext<StateContextValue | null>(null);

interface StateProviderProps {
  username: string;
  children: ReactNode;
  initialState: AIState;
  initialUIState?: UIState;
  serverPreloaded?: boolean;
}

export function StateProvider({
  username,
  children,
  initialState,
  initialUIState = [],
  serverPreloaded = false,
}: StateProviderProps) {
  // AI State Management
  const [aiStateValue, setAIStateValue] = useState<AIState>(initialState);
  const [isLoading, setIsLoading] = useState(!serverPreloaded);
  const [error, setError] = useState<Error | null>(null);

  // UI State Management
  const [uiState, setUiState] = useState<UIState>(initialUIState);

  // Load server state if not preloaded
  const loadState = useCallback(async () => {
    if (serverPreloaded) return;

    try {
      setIsLoading(true);
      const serverState = await getServerState(username);
      if (serverState) {
        setAIStateValue(serverState);
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

  // AI State Methods
  const aiStateGet = useCallback(() => aiStateValue, [aiStateValue]);

  const aiStateUpdate = useCallback(
    async (newState: ValueOrUpdater<AIState>) => {
      try {
        const updatedState =
          typeof newState === "function" ? newState(aiStateValue) : newState;

        await updateServerState(updatedState);
        setAIStateValue(updatedState);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update state")
        );
        throw err;
      }
    },
    [aiStateValue]
  );

  const aiStateDone = useCallback(
    async (finalState?: AIState) => {
      if (finalState) {
        await aiStateUpdate(finalState);
      }
    },
    [aiStateUpdate]
  );

  // UI State Update Method
  const updateUIState = useCallback((newState: ValueOrUpdater<UIState>) => {
    setUiState((current) => {
      const updatedState =
        typeof newState === "function" ? newState(current) : newState;

      return updatedState;
    });
  }, []);

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      aiState: {
        get: aiStateGet,
        update: aiStateUpdate,
        done: aiStateDone,
      },
      uiState,
      setUiState: updateUIState,
      isLoading,
      error,
    }),
    [
      aiStateGet,
      aiStateUpdate,
      aiStateDone,
      uiState,
      updateUIState,
      isLoading,
      error,
    ]
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
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
}

// Custom hook for accessing state
export function useStateContext() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
}

// Convenience hooks for individual state access
export function useAIState() {
  const { aiState } = useStateContext();
  return aiState;
}

export function useUIState(): [
  UIState,
  (newState: ValueOrUpdater<UIState>) => void
] {
  const { uiState, setUiState } = useStateContext();
  return [uiState, setUiState];
}
