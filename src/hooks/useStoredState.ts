import { useEffect, useState } from "react";

export function useStoredState<T>(
  key: string,
  fallback: T,
  parse: (value: unknown) => T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      return saved === null ? fallback : parse(saved);
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Continue with in-memory state if storage is unavailable. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
