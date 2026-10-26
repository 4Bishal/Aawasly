// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/providers/theme-provider";
import { PricingProvider } from "@/providers/pricing-provider";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Price, TaxToggle } from "@/components/listings/price";

let systemDark = false;
const listeners = new Set<(event: MediaQueryListEvent) => void>();
beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("class");
  systemDark = false;
  listeners.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return systemDark;
      },
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: (listener: (event: MediaQueryListEvent) => void) =>
        listeners.add(listener),
      removeListener: (listener: (event: MediaQueryListEvent) => void) =>
        listeners.delete(listener),
      addEventListener: (
        _name: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => listeners.add(listener),
      removeEventListener: (
        _name: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => listeners.delete(listener),
      dispatchEvent: () => true,
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function ThemeControls() {
  return (
    <ThemeProvider>
      <ThemeSwitcher />
    </ThemeProvider>
  );
}

describe("theme preferences", () => {
  it("defaults to the system preference and follows operating-system changes", async () => {
    render(<ThemeControls />);
    await waitFor(() =>
      expect(document.documentElement.classList.contains("light")).toBe(true),
    );
    act(() => {
      systemDark = true;
      listeners.forEach((listener) =>
        listener({ matches: true } as MediaQueryListEvent),
      );
    });
    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
  });

  it("persists a selected theme and restores it on the next mount", async () => {
    const user = userEvent.setup();
    render(<ThemeControls />);
    await user.click(
      screen.getByRole("button", { name: "Choose color theme" }),
    );
    const dark = screen.getByRole("menuitemradio", { name: "Dark" });
    expect(
      screen
        .getByRole("menuitemradio", { name: "System" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    await user.click(dark);
    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
    expect(localStorage.getItem("aawasly:theme")).toBe("dark");
    cleanup();
    render(<ThemeControls />);
    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
  });

  it("keeps an explicit light preference when the operating system switches to dark", async () => {
    localStorage.setItem("aawasly:theme", "light");
    render(<ThemeControls />);
    act(() => {
      systemDark = true;
      listeners.forEach((listener) =>
        listener({ matches: true } as MediaQueryListEvent),
      );
    });
    await waitFor(() =>
      expect(document.documentElement.classList.contains("light")).toBe(true),
    );
  });
});

describe("shared tax display state", () => {
  it("updates all prices together and restores the preference independently of theme", async () => {
    localStorage.setItem("aawasly:theme", "dark");
    const user = userEvent.setup();
    const view = (
      <PricingProvider>
        <Price price={1000} />
        <Price price={2000} />
        <TaxToggle />
      </PricingProvider>
    );
    render(view);
    expect(screen.getByText("रू 1,000")).toBeTruthy();
    await user.click(
      screen.getByRole("switch", { name: "Display prices including 13% VAT" }),
    );
    expect(screen.getByText("रू 1,130")).toBeTruthy();
    expect(screen.getByText("रू 2,260")).toBeTruthy();
    expect(localStorage.getItem("aawasly:include-tax")).toBe("true");
    expect(localStorage.getItem("aawasly:theme")).toBe("dark");
    cleanup();
    render(view);
    await waitFor(() =>
      expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
        "true",
      ),
    );
    expect(screen.getByText("रू 1,130")).toBeTruthy();
  });
});
