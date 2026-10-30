import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useTheme } from "next-themes";
import { AppearanceProvider } from "./AppearanceProvider";
import { BlueAccentToggle } from "@/components/ui/blue-accent-toggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  delete document.documentElement.dataset.accent;
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function Controls() {
  const { setTheme } = useTheme();
  return (
    <>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <BlueAccentToggle />
    </>
  );
}

it("keeps the blue preference independent of mode and restores it after remount", async () => {
  const view = render(
    <AppearanceProvider>
      <Controls />
    </AppearanceProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Blue accent" }));
  fireEvent.click(screen.getByRole("button", { name: "Light" }));
  await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  expect(document.documentElement).toHaveAttribute("data-accent", "blue");
  fireEvent.click(screen.getByRole("button", { name: "Dark" }));
  await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  expect(document.documentElement).toHaveAttribute("data-accent", "blue");
  expect(localStorage.getItem("blue-accent")).toBe("true");
  view.unmount();
  render(
    <AppearanceProvider>
      <Controls />
    </AppearanceProvider>,
  );
  expect(screen.getByRole("button", { name: "Blue accent" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "Blue accent" }));
  expect(document.documentElement).not.toHaveAttribute("data-accent");
  expect(document.documentElement).toHaveClass("dark");
});

it("migrates the former blue theme to dark plus blue", async () => {
  localStorage.setItem("theme", "hapalin");
  document.documentElement.className = "hapalin";
  render(
    <AppearanceProvider>
      <Controls />
    </AppearanceProvider>,
  );
  await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  expect(document.documentElement).not.toHaveClass("hapalin");
  expect(document.documentElement).toHaveAttribute("data-accent", "blue");
  expect(localStorage.getItem("theme")).toBe("dark");
  expect(screen.getByRole("button", { name: "Blue accent" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

it("syncs the Blue accent from other tabs without changing the brightness mode", async () => {
  render(
    <AppearanceProvider>
      <Controls />
    </AppearanceProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Dark" }));
  await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  const storageWrites = vi.spyOn(Storage.prototype, "setItem");
  fireEvent(
    window,
    new StorageEvent("storage", { key: "blue-accent", newValue: "true" }),
  );
  expect(screen.getByRole("button", { name: "Blue accent" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(document.documentElement).toHaveAttribute("data-accent", "blue");
  fireEvent(
    window,
    new StorageEvent("storage", { key: "blue-accent", newValue: "false" }),
  );
  expect(screen.getByRole("button", { name: "Blue accent" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(document.documentElement).not.toHaveAttribute("data-accent");
  expect(document.documentElement).toHaveClass("dark");
  expect(storageWrites).not.toHaveBeenCalledWith("blue-accent", expect.anything());
});
