import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type { SetStateAction } from "react";
import {
  readStoredRaw,
  subscribeStoredKey,
  writeStoredRaw,
} from "../utils/browserStorage";
function decode<T>(
  raw: string | null,
  fallback: T,
  parse: (value: unknown) => T,
): T {
  try {
    const saved: unknown = JSON.parse(raw ?? "null");
    return saved === null ? fallback : parse(saved);
  } catch {
    return fallback;
  }
}
export function useStoredState<T>(
  key: string,
  fallback: T,
  parse: (value: unknown) => T,
) {
  const options = useRef({ fallback, parse });
  options.current = { fallback, parse };
  const subscribe = useCallback(
    (listener: () => void) => subscribeStoredKey(key, listener),
    [key],
  );
  const snapshot = useCallback(() => readStoredRaw(key), [key]);
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const value = useMemo(
    () => decode(raw, fallback, parse),
    [raw, fallback, parse],
  );
  const setValue = useCallback(
    (action: SetStateAction<T>) => {
      const current = decode(
        readStoredRaw(key),
        options.current.fallback,
        options.current.parse,
      );
      const next =
        typeof action === "function"
          ? (action as (previous: T) => T)(current)
          : action;
      writeStoredRaw(key, JSON.stringify(next));
    },
    [key],
  );
  useEffect(() => {
    if (readStoredRaw(key) === raw) writeStoredRaw(key, JSON.stringify(value));
  }, [key, raw, value]);
  return [value, setValue] as const;
}
