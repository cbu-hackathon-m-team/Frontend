import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { AppearanceProvider } from "@/components/providers/AppearanceProvider";
import { endPreviewSession, startPreviewSession } from "@/lib/preview-session";
import { DashboardHeader } from "./header";

beforeEach(() => {
  endPreviewSession();
  localStorage.clear();
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() })));
});
afterEach(() => {
  cleanup();
  endPreviewSession();
  localStorage.clear();
  vi.unstubAllGlobals();
});

function HeaderApp() {
  return (
    <MemoryRouter initialEntries={["/design-system"]}>
      <AppearanceProvider>
        <Routes>
          <Route path="/design-system" element={<DashboardHeader title="Design System" />} />
          <Route path="/dashboard" element={<h1>대시보드</h1>} />
          <Route path="/login" element={<Link to="/design-system">디자인 시스템으로</Link>} />
        </Routes>
      </AppearanceProvider>
    </MemoryRouter>
  );
}

it("replaces Login with the shared account icon and design-system menu when sign-in changes", async () => {
  const user = userEvent.setup();
  render(<HeaderApp />);
  const header = within(screen.getByRole("banner"));
  expect(header.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  expect(header.queryByRole("button", { name: "계정 메뉴" })).not.toBeInTheDocument();
  act(startPreviewSession);
  expect(header.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
  const accountButton = header.getByRole("button", { name: "계정 메뉴" });
  expect(accountButton).toHaveAttribute("data-size", "icon");
  expect(accountButton).toHaveTextContent(/^$/);
  expect(header.getByRole("button", { name: "Blue accent" })).toBeInTheDocument();
  expect(header.getByRole("radio", { name: "Light theme" })).toBeInTheDocument();
  await user.click(accountButton);
  const menu = within(screen.getByRole("dialog", { name: "계정 설정" }));
  expect(menu.getByRole("link", { name: "사이트 보기" })).toHaveAttribute("href", "/");
  expect(menu.queryByRole("link", { name: "디자인 시스템" })).not.toBeInTheDocument();
  expect(menu.queryByRole("link", { name: "워크스페이스 설정" })).not.toBeInTheDocument();
  await user.click(menu.getByRole("link", { name: "대시보드" }));
  expect(screen.getByRole("heading", { name: "대시보드" })).toBeInTheDocument();
  expect(screen.queryByRole("dialog", { name: "계정 설정" })).not.toBeInTheDocument();
});

it("restores the saved sign-in state and shows Login again after account-menu logout", async () => {
  const user = userEvent.setup();
  startPreviewSession();
  render(<HeaderApp />);
  expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "계정 메뉴" }));
  await user.click(screen.getByRole("link", { name: "로그아웃" }));
  await user.click(screen.getByRole("link", { name: "디자인 시스템으로" }));
  expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "계정 메뉴" })).not.toBeInTheDocument();
});
