"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ModelConfig } from "@/lib/agents/providers";

type ModelSettings = {
  /** The user's own provider settings; `null` uses Maven's default models */
  config: ModelConfig | null;
  setConfig: (config: ModelConfig | null) => void;
};

/**
 * The user's own LLM provider, API key and models. Kept in this browser's
 * localStorage only and sent with each chat request; the server never stores
 * it.
 */
export const useModelSettings = create<ModelSettings>()(
  persist(
    (set) => ({
      config: null,
      setConfig: (config) => set({ config }),
    }),
    {
      name: "maven-model-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
