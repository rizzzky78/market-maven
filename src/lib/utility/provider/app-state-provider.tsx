"use client";

import { createContext, useState, ReactNode, useContext, JSX } from "react";

/**
 * Interface defining the shape of our application state
 */
interface AppState {
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

/**
 * Context for managing global application state
 * @default undefined
 */
const AppStateContext = createContext<AppState | undefined>(undefined);

/**
 * Props for the AppStateProvider component
 */
interface AppStateProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application and manages global state
 * @param props - Component props containing children elements
 * @returns Provider component with state management capabilities
 */
export const AppStateProvider = ({
  children,
}: AppStateProviderProps): JSX.Element => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const value: AppState = {
    isGenerating,
    setIsGenerating,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

/**
 * Custom hook for accessing the application state
 * @throws Error if used outside of AppStateProvider
 * @returns AppState context object containing state and setter
 */
export const useAppState = (): AppState => {
  const context = useContext(AppStateContext);

  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }

  return context;
};
