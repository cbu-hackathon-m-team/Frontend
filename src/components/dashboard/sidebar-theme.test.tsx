import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useTheme } from "next-themes";
import { AppearanceProvider } from "@/components/providers/AppearanceProvider";
import { DashboardThemeToggle } from "./sidebar";

const originalTransition = document.startViewTransition;
beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn() })));
});
afterEach(() => {
  cleanup();
  document.startViewTransition = originalTransition;
  localStorage.clear();
  vi.unstubAllGlobals();
});

function Controls() {
  const { theme, setTheme } = useTheme();
  return <DashboardThemeToggle theme={theme} setTheme={setTheme} />;
}

it("applies the latest mode through consecutive browser transitions", async () => {
  const capturePage = vi.fn((update: () => void) => {
    const committed = Promise.resolve().then(update);
    return {
      ready: committed, finished: committed, updateCallbackDone: committed,
      skipTransition: vi.fn(), types: new Set<string>(),
    };
  }) as unknown as Document["startViewTransition"];
  document.startViewTransition = capturePage;
  render(<AppearanceProvider><Controls /></AppearanceProvider>);
  for (const label of ["Light theme", "Dark theme", "Light theme", "Dark theme"]) {
    fireEvent.click(screen.getByRole("radio", { name: label }));
    await waitFor(() => expect(screen.getByRole("radio", { name: label })).toBeChecked());
  }
  await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  expect(localStorage.getItem("theme")).toBe("dark");
  expect(capturePage).toHaveBeenCalledTimes(4);
});