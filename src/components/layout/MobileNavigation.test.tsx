import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../App";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function mobileBrowser() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    writable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    writable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event("close"));
    },
  });
}
describe("mobile navigation", () => {
  it("replaces the sidebar, opens subjects and closes the sheet after selection", async () => {
    mobileBrowser();
    const user = userEvent.setup();
    render(<App />);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "six seeeven Startseite" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Fächer" }));
    const sheet = screen.getByRole("dialog", { name: "Deine Fächer" });
    expect(document.body.style.overflow).toBe("hidden");
    await user.click(within(sheet).getByRole("button", { name: "Mathematik" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).not.toBe("hidden");
    expect(
      screen.getByRole("heading", { name: "Mathematik" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reber erlog" }));
    expect(
      screen.getByRole("heading", { name: /Schau, was du schon kannst/ }),
    ).toBeInTheDocument();
  });
  it("closes subjects with Escape and keeps test navigation hidden", async () => {
    mobileBrowser();
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Fächer" }));
    const sheet = screen.getByRole("dialog");
    fireEvent(sheet, new Event("cancel", { bubbles: true, cancelable: true }));
    // Browsers close a dialog after an uncancelled Escape event.
    (sheet as HTMLDialogElement).close();
    expect(screen.getByRole("button", { name: "Fächer" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await user.click(screen.getByRole("button", { name: "Fächer" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Mathematik",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Tests" }));
    await user.click(
      screen.getByRole("button", { name: /Mein erster Wissenscheck/ }),
    );
    await user.click(screen.getByRole("button", { name: "Test starten" }));
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Test abbrechen" }),
    ).toBeInTheDocument();
  });
});
