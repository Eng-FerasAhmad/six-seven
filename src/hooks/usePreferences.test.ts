import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePreferences } from "./usePreferences";
afterEach(() => vi.unstubAllGlobals());
function deviceTheme(dark: boolean) {
  const media = {
    matches: dark,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => media),
  );
  return {
    change(value: boolean) {
      act(() => {
        media.matches = value;
        media.addEventListener.mock.calls[0][1]();
      });
    },
  };
}
describe("device theme", () => {
  it("defaults to the device theme and follows changes without saving an override", () => {
    const device = deviceTheme(true);
    const { result } = renderHook(usePreferences);
    expect(result.current.dark).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("six-theme")).toBe("null");
    device.change(false);
    expect(result.current.dark).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("light");
  });
  it("keeps a manual choice when the device changes and after remounting", () => {
    const device = deviceTheme(false);
    const initial = renderHook(usePreferences);
    act(() => initial.result.current.toggleTheme());
    expect(localStorage.getItem("six-theme")).toBe("true");
    device.change(true);
    device.change(false);
    expect(initial.result.current.dark).toBe(true);
    initial.unmount();
    const restored = renderHook(usePreferences);
    expect(restored.result.current.dark).toBe(true);
  });
  it("uses the device theme when a saved preference is invalid", () => {
    deviceTheme(true);
    localStorage.setItem("six-theme", '"invalid"');
    const { result } = renderHook(usePreferences);
    expect(result.current.dark).toBe(true);
  });
});
