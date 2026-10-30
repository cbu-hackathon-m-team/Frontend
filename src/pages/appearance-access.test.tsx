import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppearanceProvider } from "@/components/providers/AppearanceProvider";
import { DashboardHeader } from "@/components/dashboard/header";
import Landing from "./Landing";
import Login from "./Login";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

it.each([
  { name: "landing", Page: Landing },
  { name: "login", Page: Login },
])(
  "inherits appearance on $name while Blue can only be changed in the design system",
  async ({ Page, name }) => {
    localStorage.setItem("blue-accent", "false");
    const user = userEvent.setup();
    const view = render(
      <MemoryRouter>
        <AppearanceProvider>
          <DashboardHeader title="Design System" />
        </AppearanceProvider>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("radio", { name: "Light theme" }));
    await user.click(screen.getByRole("button", { name: "Blue accent" }));
    await waitFor(() => expect(document.documentElement).toHaveClass("light"));
    expect(document.documentElement).toHaveAttribute("data-accent", "blue");
    view.rerender(
      <MemoryRouter>
        <AppearanceProvider>
          <Page />
        </AppearanceProvider>
      </MemoryRouter>,
    );
    expect(
      screen.queryByRole("button", { name: "Blue accent" }),
    ).not.toBeInTheDocument();
    if (name === "login") {
      await user.click(screen.getByRole("button", { name: "화면 설정" }));
      expect(
        screen.queryByRole("menuitemcheckbox", { name: "블루 테마" }),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole("menuitemradio", { name: "다크" }));
    } else {
      expect(screen.queryByRole("group", { name: "화면 모드" })).not.toBeInTheDocument();
      expect(document.documentElement).toHaveClass("light");
      expect(document.documentElement).toHaveAttribute("data-accent", "blue");
      return;
    }
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(document.documentElement).toHaveAttribute("data-accent", "blue");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(localStorage.getItem("blue-accent")).toBe("true");
  },
);
