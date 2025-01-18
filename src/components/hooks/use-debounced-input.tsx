"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Configuration options for the useAdvancedTextArea hook
 */
interface UseDebounceInputConfig {
  /** Initial value for the textarea */
  initialValue?: string;
  /** Delay in milliseconds before triggering the debounced value update */
  debounceDelay?: number;
  /** Callback fired when user temporarily stops typing (after debounce delay) */
  onTypingStop?: (value: string) => void;
  /** Callback fired when user completely finishes typing (on blur) */
  onTypingFinish?: (value: string) => void;
}

/**
 * Return type for the useAdvancedTextArea hook
 */
interface DebouncedValue {
  /** Current raw value of the textarea */
  value: string;
  /** Debounced value that updates after typing stops */
  debouncedValue: string;
  /** Indicates whether the user is currently typing */
  isTyping: boolean;
  /** Handler for textarea change events */
  handleChange: (input: string) => void;
  /** Handler for textarea blur events */
  handleBlur: () => void;
  handleReset: () => void;
}

/**
 * A custom hook that provides advanced textarea functionality including:
 * - Debounced value updates
 * - Typing state management
 * - Callbacks for typing events
 *
 * @example
 * ```tsx
 * const {
 *   value,
 *   debouncedValue,
 *   isTyping,
 *   handleChange,
 *   handleBlur
 * } = useDebounceInput({
 *   initialValue: "Initial text",
 *   debounceDelay: 500,
 *   onTypingStop: (value) => console.log('User paused typing:', value),
 *   onTypingFinish: (value) => console.log('User finished typing:', value)
 * });
 * ```
 */
export const useDebounceInput = ({
  initialValue = "",
  debounceDelay = 300,
  onTypingStop = () => {},
  onTypingFinish = () => {},
}: UseDebounceInputConfig = {}): DebouncedValue => {
  // State management
  const [value, setValue] = useState<string>(initialValue);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [debouncedValue, setDebouncedValue] = useState<string>(initialValue);

  // Handle debounced value updates and typing state
  useEffect(() => {
    // Update typing state based on value
    setIsTyping(value !== "");

    // Set up debounced update
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
      onTypingStop(value);
      setIsTyping(false);
    }, debounceDelay);

    // Cleanup timeout on value change or unmount
    return () => clearTimeout(timeoutId);
  }, [value, debounceDelay, onTypingStop]);

  // Handle blur event
  const handleBlur = useCallback(() => {
    onTypingFinish(value);
    setIsTyping(false);
  }, [value, onTypingFinish]);

  // Handle input change
  const handleChange = useCallback((input: string) => {
    setValue(input);
  }, []);

  const handleReset = useCallback(() => {
    setValue("");
  }, []);

  return {
    value,
    debouncedValue,
    isTyping,
    handleChange,
    handleBlur,
    handleReset,
  };
};
