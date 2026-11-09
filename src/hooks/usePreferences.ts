import { useEffect } from "react";
import { useStoredState } from "./useStoredState";

export const fontSizes = ["Normal", "Groß", "Sehr groß"] as const;
function parseFontSize(value: unknown): number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < fontSizes.length
    ? value
    : 0;
}
export function usePreferences() {
  const [fontSize, setFontSize] = useStoredState(
    "six-font-size",
    0,
    parseFontSize,
  );
  const [dark, setDark] = useStoredState(
    "six-theme",
    false,
    (value) => value === true,
  );
  useEffect(() => {
    document.documentElement.dataset.fontSize = String(fontSize);
  }, [fontSize]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  return {
    fontSize,
    dark,
    decreaseFontSize: () => setFontSize((size) => Math.max(0, size - 1)),
    increaseFontSize: () =>
      setFontSize((size) => Math.min(fontSizes.length - 1, size + 1)),
    toggleTheme: () => setDark((value) => !value),
  };
}
