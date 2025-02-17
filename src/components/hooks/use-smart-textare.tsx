"use client";

import { create } from "zustand";
import {
  AttachCompare,
  AttachProduct,
  ProductCompare,
  ProductComparison,
} from "@/lib/types/ai";
import { ChangeEvent, KeyboardEvent } from "react";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

/**
 * Maximum input length constant
 */
const MAX_INPUT_LENGTH = 4000;

/**
 * Interface for textarea validation options
 */
interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
}

/**
 * Interface for textarea event handlers
 */
interface TextareaEventHandlers {
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste?: (e: ClipboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Enhanced state interface for smart textarea
 */
interface SmartTextareaState extends TextareaEventHandlers {
  /**
   * The text area regular input
   */
  input: string;
  /**
   * Input validation status
   */
  isValid: boolean;
  /**
   * Validation error message if any
   */
  errorMessage: string | null;
  /**
   * Character count
   */
  charCount: number;
  /**
   * Input history for undo/redo
   */
  history: string[];

  historyIndex: number;
  /**
   * Attached Value of Product metadata with ID
   */
  attachment: AttachProduct | undefined;

  // New comparison-related state
  comparison: ProductComparison | undefined;

  activeComparison: ProductCompare | undefined;

  /** Request properties of invocation on request */
  search: boolean;
  related: boolean;

  setSearch: (v: boolean) => void;
  setRelated: (v: boolean) => void;
  /**
   * Set input with validation
   */
  setInput: (text: string, options?: ValidationOptions) => void;
  /**
   * Change Event from TextArea Element
   */
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  /**
   * Attach an serializable object
   */
  attach: (object: AttachProduct | undefined) => void;
  /**
   * Detach or remove value of `attachment`
   */
  detach: () => void;
  /**
   * Flush or Reset all state values
   */
  flush: () => void;
  /**
   * Undo last change
   */
  undo: () => void;
  /**
   * Redo last undone change
   */
  redo: () => void;

  /**
   * Register event handlers
   */
  registerEventHandlers: (handlers: TextareaEventHandlers) => void;

  /**
   * Validate input against options
   */
  validate: (options?: ValidationOptions) => boolean;

  // New comparison-related methods
  attachComparison: (comparison: ProductComparison | undefined) => void;

  detachComparison: () => void;

  setActiveComparison: (compare: ProductCompare | undefined) => void;

  addToComparison: (product: AttachCompare) => void;

  removeFromComparison: (callId: string) => void;

  clearComparisons: () => void;
}

/**
 * Validate text input against provided options
 */
const validateInput = (
  text: string,
  options?: ValidationOptions
): { isValid: boolean; error: string | null } => {
  if (!options) return { isValid: true, error: null };

  if (options.maxLength && text.length > options.maxLength) {
    return {
      isValid: false,
      error: `Input exceeds maximum length of ${options.maxLength} characters`,
    };
  }

  if (options.minLength && text.length < options.minLength) {
    return {
      isValid: false,
      error: `Input must be at least ${options.minLength} characters`,
    };
  }

  if (options.pattern && !options.pattern.test(text)) {
    return { isValid: false, error: "Input format is invalid" };
  }

  return { isValid: true, error: null };
};

/**
 * Enhanced Smart TextArea Hook with persistence and dev tools
 */
export const useSmartTextarea = create<SmartTextareaState>()(
  devtools(
    persist(
      (set, get) => ({
        // Existing state
        input: "",
        isValid: true,
        errorMessage: null,
        charCount: 0,
        history: [""],
        historyIndex: 0,
        attachment: undefined,
        onKeyDown: undefined,
        onPaste: undefined,
        onFocus: undefined,
        onBlur: undefined,

        // New comparison state
        comparison: undefined,
        activeComparison: undefined,

        search: false,
        related: false,

        setSearch: (v) => set({ search: v }),
        setRelated: (v) => set({ related: v }),

        // Existing methods remain unchanged
        setInput: (text, options) => {
          const { isValid, error } = validateInput(text, options);
          set({
            input: text,
            isValid,
            errorMessage: error,
            charCount: text.length,
            history: [...get().history.slice(0, get().historyIndex + 1), text],
            historyIndex: get().historyIndex + 1,
          });
        },

        onChange: (e) => {
          const text = e.target.value;
          if (text.length <= MAX_INPUT_LENGTH) {
            get().setInput(text);
          }
        },

        attach: (value) => set({ attachment: value }),

        detach: () => set({ attachment: undefined }),

        flush: () =>
          set({
            input: "",
            isValid: true,
            errorMessage: null,
            charCount: 0,
            attachment: undefined,
            comparison: undefined,
            activeComparison: undefined,
            history: [""],
            historyIndex: 0,
          }),

        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex > 0) {
            set({
              input: history[historyIndex - 1],
              historyIndex: historyIndex - 1,
              charCount: history[historyIndex - 1].length,
            });
          }
        },

        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex < history.length - 1) {
            set({
              input: history[historyIndex + 1],
              historyIndex: historyIndex + 1,
              charCount: history[historyIndex + 1].length,
            });
          }
        },

        registerEventHandlers: (handlers) => set({ ...handlers }),

        validate: (options) => {
          const { isValid, error } = validateInput(get().input, options);
          set({ isValid, errorMessage: error });
          return isValid;
        },

        // New comparison-related methods
        attachComparison: (comparison) => set({ comparison }),

        detachComparison: () => set({ comparison: undefined }),

        setActiveComparison: (compare) => set({ activeComparison: compare }),

        addToComparison: (product) => {
          const currentActive = get().activeComparison;
          if (!currentActive || currentActive.for.length >= 2) {
            // Initialize new comparison if none exists or current is full
            set({
              activeComparison: {
                for: [product.for],
              },
            });
          } else {
            // Add to existing comparison if space available
            set({
              activeComparison: {
                for: [...currentActive.for, product.for],
              },
            });
          }
        },

        removeFromComparison: (callId) => {
          const currentActive = get().activeComparison;
          if (currentActive) {
            set({
              activeComparison: {
                for: currentActive.for.filter((item) => item.callId !== callId),
              },
            });
          }
        },

        clearComparisons: () =>
          set({
            comparison: undefined,
            activeComparison: undefined,
          }),
      }),
      {
        name: "smart-textarea-storage",
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          input: state.input,
          attachment: state.attachment,
          comparison: state.comparison,
          activeComparison: state.activeComparison,
        }),
      }
    ),
    { name: "SmartTextarea" }
  )
);

// Optional: Export a hook for handling keyboard shortcuts
export const useTextareaShortcuts = (textareaState: SmartTextareaState) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Ctrl/Cmd + Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      textareaState.undo();
    }

    // Handle Ctrl/Cmd + Shift + Z for redo
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
      e.preventDefault();
      textareaState.redo();
    }

    // Call custom onKeyDown handler if provided
    textareaState.onKeyDown?.(e);
  };

  return { handleKeyDown };
};
