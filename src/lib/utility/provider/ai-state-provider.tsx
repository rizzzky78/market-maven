"use client";

import { ErrorMessage } from "@/components/maven/error-message";
import {
  getServerState,
  updateServerState,
} from "@/lib/agents/action/mutator/ai-state-service";
import {
  AIState,
  UIState,
  ValueOrUpdater,
  StateContextValue,
  StateProviderProps,
} from "@/lib/types/ai";
import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  FC,
} from "react";

/**
 * React context for managing AI and UI state.
 */
const StateContext = createContext<StateContextValue | null>(null);

/**
 * Provides AI and UI state management for the application.
 *
 * This component initializes and maintains AI-related state, ensuring
 * synchronization with the server while handling UI state updates.
 */
export const AIProvider: FC<StateProviderProps> = ({
  username,
  children,
  initialState,
  initialUIState = [],
  serverPreloaded = false,
}) => {
  /** Stores the AI state for the user. */
  const [aiStateValue, setAIStateValue] = useState<AIState>(initialState);

  /** Tracks loading state while fetching AI data from the server. */
  const [isLoading, setIsLoading] = useState(!serverPreloaded);

  /** Stores any error encountered during AI state operations. */
  const [error, setError] = useState<Error | null>(null);

  /** Manages the UI state for the frontend. */
  const [uiState, setUiState] = useState<UIState>(initialUIState);

  /**
   * Loads the AI state from the server unless it is already preloaded.
   */
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

  /**
   * Retrieves the current AI state.
   *
   * @returns The AI state.
   */
  const aiStateGet = useCallback(() => aiStateValue, [aiStateValue]);

  /**
   * Updates the AI state and synchronizes it with the server.
   *
   * @param newState - The new AI state or a function that updates the current state.
   * @throws Will throw an error if the update fails.
   */
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

  /**
   * Marks the AI state as finalized, optionally updating it before completion.
   *
   * @param finalState - (Optional) The final AI state to set before marking as done.
   */
  const aiStateDone = useCallback(
    async (finalState?: AIState) => {
      if (finalState) {
        await aiStateUpdate(finalState);
      }
    },
    [aiStateUpdate]
  );

  /**
   * Updates the UI state dynamically.
   *
   * @param newState - The new UI state or a function that modifies the current UI state.
   */
  const updateUIState = useCallback((newState: ValueOrUpdater<UIState>) => {
    setUiState((current) => {
      const updatedState =
        typeof newState === "function" ? newState(current) : newState;

      return updatedState;
    });
  }, []);

  /** Memoized context value for optimized re-renders. */
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
};

/**
 * Hook to access AI and UI state within the provider.
 *
 * @throws Will throw an error if used outside of `AIProvider`.
 * @returns The AI and UI state context.
 */
export function useStateContext() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a AIProvider");
  }
  return context;
}

/**
 * Hook to interact with the AI state.
 *
 * @returns AI state with methods for retrieval, update, and completion.
 */
export function useAIState() {
  const { aiState } = useStateContext();
  return aiState;
}

/**
 * Hook to interact with the UI state.
 *
 * @returns A tuple containing the UI state and a function to update it.
 */
export function useUIState(): [
  UIState,
  (newState: ValueOrUpdater<UIState>) => void
] {
  const { uiState, setUiState } = useStateContext();
  return [uiState, setUiState];
}
