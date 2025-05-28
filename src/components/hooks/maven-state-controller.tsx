"use client";

import { create } from "zustand";
import {
  AttachCompare,
  AttachProduct,
  ProductCompare,
  ProductComparison,
  RefferenceDataSource,
} from "@/lib/types/ai";
import { ChangeEvent, KeyboardEvent } from "react";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

/**
 * Maximum character limit for text input validation
 * @constant {number}
 */
const MAX_INPUT_LENGTH = 4000;

/**
 * Configuration options for input field validation
 * @type ValidationOptions
 */
type ValidationOptions = {
  /** Maximum allowed character count */
  maxLength?: number;
  /** Minimum required character count */
  minLength?: number;
  /** Regular expression pattern for format validation */
  pattern?: RegExp;
};

/**
 * Event handler callbacks for textarea interactions
 * @type TextareaEventHandlers
 */
type TextareaEventHandlers = {
  /** Keyboard event handler for key presses */
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Clipboard paste event handler */
  onPaste?: (e: ClipboardEvent) => void;
  /** Focus event handler when textarea gains focus */
  onFocus?: () => void;
  /** Blur event handler when textarea loses focus */
  onBlur?: () => void;
};

/**
 * Comprehensive state management interface for Maven application's smart textarea component.
 * Handles input validation, product attachments, comparison operations, and history management.
 *
 * @interface MavenStateController
 * @extends TextareaEventHandlers
 */
interface MavenStateController extends TextareaEventHandlers {
  // ===== CORE INPUT STATE =====

  /** Current text content of the input field */
  input: string;

  /** Validation status indicating if current input meets requirements */
  isValid: boolean;

  /** Error message displayed when validation fails, null if valid */
  errorMessage: string | null;

  /** Current character count of the input text */
  charCount: number;

  /** Array storing input history for undo/redo functionality */
  history: string[];

  /** Current position in the history array for navigation */
  historyIndex: number;

  // ===== PRODUCT ATTACHMENT STATE =====

  /** Currently attached product metadata object, undefined if none attached */
  attachment: AttachProduct | undefined;

  // ===== COMPARISON FEATURE STATE =====

  /** Complete comparison data structure containing multiple product comparisons */
  comparison: ProductComparison | undefined;

  /** Currently active comparison being built or modified */
  activeComparison: ProductCompare | undefined;

  // ===== REQUEST CONFIGURATION STATE =====

  /** Flag indicating if search functionality should be enabled in requests */
  search: boolean;

  /** Flag indicating if related content should be included in responses */
  related: boolean;

  /** Data source reference for AI processing */
  reffSource: RefferenceDataSource;

  // ===== REQUEST CONFIGURATION ACTIONS =====

  /**
   * Updates the search flag state
   * @param v - Boolean value to enable/disable search
   */
  setSearch: (v: boolean) => void;

  /**
   * Updates the related content flag state
   * @param v - Boolean value to enable/disable related content
   */
  setRelated: (v: boolean) => void;

  /**
   * Sets the reference data source for AI processing
   * @param s - Data source identifier
   */
  setReffSource: (s: RefferenceDataSource) => void;

  // ===== CORE INPUT ACTIONS =====

  /**
   * Sets input text with optional validation rules
   * Automatically updates character count, validation status, and history
   * @param text - The new input text
   * @param options - Optional validation constraints
   */
  setInput: (text: string, options?: ValidationOptions) => void;

  /**
   * Handles textarea change events with length validation
   * Automatically prevents input exceeding MAX_INPUT_LENGTH
   * @param e - React change event from textarea element
   */
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;

  // ===== PRODUCT ATTACHMENT ACTIONS =====

  /**
   * Attaches a product object to the current state
   * Used for context when making AI requests about specific products
   * @param object - Product metadata to attach, or undefined to clear
   */
  attach: (object: AttachProduct | undefined) => void;

  /**
   * Removes the currently attached product from state
   * Equivalent to calling attach(undefined)
   */
  detach: () => void;

  // ===== STATE MANAGEMENT ACTIONS =====

  /**
   * Resets all state values to their initial defaults
   * Clears input, attachments, comparisons, and history
   */
  flush: () => void;

  /**
   * Reverts input to previous state in history
   * Does nothing if already at the beginning of history
   */
  undo: () => void;

  /**
   * Advances input to next state in history
   * Does nothing if already at the end of history
   */
  redo: () => void;

  // ===== EVENT HANDLER MANAGEMENT =====

  /**
   * Registers custom event handlers for textarea interactions
   * Allows external components to hook into textarea events
   * @param handlers - Object containing event handler functions
   */
  registerEventHandlers: (handlers: TextareaEventHandlers) => void;

  /**
   * Validates current input against provided rules
   * Updates validation state and returns validation result
   * @param options - Validation constraints to check against
   * @returns Boolean indicating if input is valid
   */
  validate: (options?: ValidationOptions) => boolean;

  // ===== COMPARISON FEATURE ACTIONS =====

  /**
   * Attaches a complete comparison structure to state
   * Used for loading existing comparisons or results
   * @param comparison - Complete comparison data or undefined to clear
   */
  attachComparison: (comparison: ProductComparison | undefined) => void;

  /**
   * Removes the currently attached comparison from state
   * Equivalent to calling attachComparison(undefined)
   */
  detachComparison: () => void;

  /**
   * Sets the currently active comparison being built
   * @param compare - Comparison structure or undefined to clear
   */
  setActiveComparison: (compare: ProductCompare | undefined) => void;

  /**
   * Adds a product to the active comparison
   * Creates new comparison if none exists or current is full (max 2 products)
   * @param product - Product data to add to comparison
   */
  addToComparison: (product: AttachCompare) => void;

  /**
   * Removes a specific product from the active comparison by its call ID
   * @param callId - Unique identifier of the product to remove
   */
  removeFromComparison: (callId: string) => void;

  /**
   * Clears all comparison data from state
   * Resets both comparison and activeComparison to undefined
   */
  clearComparisons: () => void;
}

/**
 * Validates text input against specified constraints
 *
 * @param text - Input text to validate
 * @param options - Optional validation rules
 * @returns Object containing validation result and error message
 *
 * @example
 * ```typescript
 * const result = validateInput("Hello", { maxLength: 10, minLength: 3 });
 * if (!result.isValid) {
 *   console.log(result.error); // Display error message
 * }
 * ```
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
 * Primary Zustand store for Maven application state management.
 *
 * Features:
 * - Persistent storage using sessionStorage
 * - Redux DevTools integration for debugging
 * - Input validation with history tracking
 * - Product attachment and comparison capabilities
 * - Configurable AI request parameters
 *
 * The store uses middleware stack:
 * 1. `persist` - Saves selected state to sessionStorage
 * 2. `devtools` - Enables Redux DevTools for state inspection
 *
 * @returns {MavenStateController} Complete state controller with all actions
 *
 * @example
 * ```typescript
 * const { input, setInput, attach, addToComparison } = useMavenStateController();
 *
 * // Set input with validation
 * setInput("Product search query", { maxLength: 100 });
 *
 * // Attach product context
 * attach({ id: "123", name: "Product Name", metadata: {...} });
 *
 * // Add to comparison
 * addToComparison({ for: { callId: "abc", productData: {...} } });
 * ```
 */
export const useMavenStateController = create<MavenStateController>()(
  devtools(
    persist(
      (set, get) => ({
        // ===== INITIAL STATE VALUES =====
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

        reffSource: "insight",

        // ===== ACTION IMPLEMENTATIONS =====
        setSearch: (v) => set({ search: v }),
        setRelated: (v) => set({ related: v }),

        setReffSource: (s) => set({ reffSource: s }),

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

        // ===== COMPARISON FEATURE IMPLEMENTATIONS =====
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
        // Only persist essential state, excluding event handlers and computed values
        partialize: (state) => ({
          input: state.input,
          attachment: state.attachment,
          comparison: state.comparison,
          activeComparison: state.activeComparison,
          reffSource: state.reffSource,
        }),
      }
    ),
    { name: "MavenStateController" }
  )
);

/**
 * Custom hook providing keyboard shortcut functionality for the Maven state controller.
 * Handles common text editing shortcuts like undo/redo with proper event prevention.
 *
 * @param textareaState - The Maven state controller instance
 * @returns Object containing the keyboard event handler
 *
 * @example
 * ```typescript
 * const mavenState = useMavenStateController();
 * const { handleKeyDown } = useMavenStateControllerShortcuts(mavenState);
 *
 * // In your textarea component:
 * <textarea onKeyDown={handleKeyDown} />
 * ```
 */
export const useMavenStateControllerShortcuts = (
  textareaState: MavenStateController
) => {
  /**
   * Processes keyboard events and executes appropriate shortcuts
   *
   * Supported shortcuts:
   * - Ctrl/Cmd + Z: Undo last change
   * - Ctrl/Cmd + Shift + Z: Redo last undone change
   *
   * @param e - Keyboard event from textarea
   */
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
