"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a value. This is useful for delaying an action
 * (like an API call) until the user has stopped typing for a specified time.
 *
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds (e.g., 500).
 * @returns The debounced value, which updates only after the delay has passed.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay has passed.
    // This is the core of the debounce logic.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-run the effect only if value or delay changes

  return debouncedValue;
}
