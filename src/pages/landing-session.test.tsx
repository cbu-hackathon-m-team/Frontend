import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppearanceProvider } from "@/components/providers/AppearanceProvider";
import { endPreviewSession, PREVIEW_SESSION_KEY, startPreviewSession } from "@/lib/preview-session";
import App from "@/App";

beforeEach(() => {
  endPreviewSession();
  localStorage.clear();
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => {
  cleanup();
  endPreviewSession();
  localStorage.clear();
  vi.unstubAllGlobals();
});

const header = () => within(screen.getByRole("banner"));
const app = () => <MemoryRouter><AppearanceProvider><App /></AppearanceProvider></MemoryRouter>;

it("reuses the workspace account menu after login and reload, and restores guest actions after logout", async () => {
  const user = userEvent.setup();
  const view = render(app());
  expect(header().getByRole("link", { name: "시작하기" })).toHaveAttribute("href", "#start");
  await user.click(header().getByRole("link", { name: "로그인" }));
  await user.type(screen.getByLabelText("아이디", { exact: true }), "demo");
  await user.type(screen.getByLabelText("비밀번호", { exact: true }), "demo");
  await user.click(screen.getByRole("button", { name: "로그인" }));
  expect(localStorage.getItem(PREVIEW_SESSION_KEY)).toBe("active");
  await user.click(screen.getByRole("button", { name: "계정 메뉴" }));
  expect(screen.getByRole("link", { name: "워크스페이스 설정" })).toHaveAttribute("href", "/dashboard/settings");
  expect(screen.queryByRole("link", { name: "대시보드" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: "사이트 보기" }));
  expect(header().getByRole("button", { name: "계정 메뉴" })).toHaveAttribute("data-size", "icon");
  expect(header().queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
  expect(header().queryByRole("link", { name: "시작하기" })).not.toBeInTheDocument();
  view.unmount();
  render(app());
  await user.click(header().getByRole("button", { name: "계정 메뉴" }));
  const account = within(screen.getByRole("dialog", { name: "계정 설정" }));
  expect(account.getByRole("link", { name: "대시보드" })).toHaveAttribute("href", "/dashboard");
  expect(account.queryByRole("link", { name: "워크스페이스 설정" })).not.toBeInTheDocument();
  expect(account.queryByRole("link", { name: "사이트 보기" })).not.toBeInTheDocument();
  expect(account.getByRole("link", { name: "디자인 시스템" })).toHaveAttribute("href", "/design-system");
  expect(account.getByRole("radio", { name: "Light theme" })).toBeInTheDocument();
  expect(account.queryByRole("button", { name: "Blue accent" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: "로그아웃" }));
  expect(localStorage.getItem(PREVIEW_SESSION_KEY)).toBeNull();
  await user.click(screen.getByRole("link", { name: "홈으로" }));
  expect(header().getByRole("link", { name: "로그인" })).toBeInTheDocument();
  expect(header().getByRole("link", { name: "시작하기" })).toBeInTheDocument();
  expect(header().queryByRole("button", { name: "계정 메뉴" })).not.toBeInTheDocument();
}, 15000);

it("dismisses an open account menu when sign-in ends and restores keyboard focus on Escape", async () => {
  const user = userEvent.setup();
  startPreviewSession();
  render(app());
  await user.click(header().getByRole("button", { name: "계정 메뉴" }));
  expect(screen.getByRole("dialog", { name: "계정 설정" })).toBeInTheDocument();
  act(endPreviewSession);
  expect(screen.queryByRole("dialog", { name: "계정 설정" })).not.toBeInTheDocument();
  expect(header().getByRole("link", { name: "로그인" })).toBeInTheDocument();
  act(startPreviewSession);
  expect(screen.queryByRole("dialog", { name: "계정 설정" })).not.toBeInTheDocument();
  const trigger = header().getByRole("button", { name: "계정 메뉴" });
  await user.click(trigger);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog", { name: "계정 설정" })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
