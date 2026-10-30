import {
  cleanup,
  act,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppearanceProvider } from "@/components/providers/AppearanceProvider";
import Dashboard from "@/pages/Dashboard";
import DashboardActivity from "@/pages/DashboardActivity";
import DashboardSettings from "@/pages/DashboardSettings";
import { SettingsAppearance, SettingsInvoices, SettingsMembers, SettingsPlans } from "@/pages/DashboardSettingsSections";
import { DashboardLayout } from "./dashboard-layout";
import { WORKSPACE_STORAGE_KEY, readWorkspace } from "./workspace";
import { PROJECTS_STORAGE_KEY } from "./projects";

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
  vi.useRealTimers();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("opens the collapsed rail across the edge-to-panel gap and closes after leaving", async () => {
  const user = userEvent.setup();
  const { container } = render(<WorkspaceApp />);
  await user.click(screen.getByRole("button", { name: "사이드바 토글" }));
  const edge = screen.getByRole("button", { name: "빠른 메뉴 열기" });
  const rail = container.querySelector<HTMLElement>('[data-slot="sidebar-hover-panel"]')!;
  const offcanvas = container.querySelector('[data-slot="sidebar-container"]')!;
  expect(offcanvas).toHaveAttribute("inert");
  expect(offcanvas).toHaveAttribute("aria-hidden", "true");
  expect(rail).toHaveAttribute("inert");
  expect(rail).toHaveClass("transition-transform", "duration-250", "ease-[cubic-bezier(0.25,0.1,0.25,1)]", "data-[state=closed]:-translate-x-[150%]");
  expect(rail.className).not.toMatch(/transition-\[transform,opacity\]|opacity-0/);
  vi.useFakeTimers();
  fireEvent.pointerEnter(edge, { pointerType: "mouse" });
  expect(rail).toHaveAttribute("data-state", "open");
  fireEvent.pointerLeave(edge);
  act(() => vi.advanceTimersByTime(80));
  fireEvent.pointerEnter(rail, { pointerType: "mouse" });
  act(() => vi.advanceTimersByTime(150));
  expect(rail).toHaveAttribute("data-state", "open");
  fireEvent.pointerLeave(rail);
  act(() => vi.advanceTimersByTime(299));
  expect(rail).toHaveAttribute("data-state", "open");
  act(() => vi.advanceTimersByTime(1));
  expect(rail).toHaveAttribute("inert");
  expect(edge).toHaveAttribute("aria-expanded", "false");
});

it("uses the source edge handoff delay and clears tooltips before the rail exits", async () => {
  const user = userEvent.setup();
  const { container } = render(<WorkspaceApp />);
  await user.click(screen.getByRole("button", { name: "사이드바 토글" }));
  const edge = screen.getByRole("button", { name: "빠른 메뉴 열기" });
  const rail = container.querySelector<HTMLElement>('[data-slot="sidebar-hover-panel"]')!;
  vi.useFakeTimers();
  fireEvent.pointerEnter(edge, { pointerType: "mouse" });
  fireEvent.pointerLeave(edge);
  act(() => vi.advanceTimersByTime(329));
  expect(rail).toHaveAttribute("data-state", "open");
  act(() => vi.advanceTimersByTime(1));
  expect(rail).toHaveAttribute("data-state", "closed");
  vi.useRealTimers();
  fireEvent.pointerEnter(edge, { pointerType: "mouse" });
  fireEvent.pointerEnter(rail, { pointerType: "mouse" });
  await user.hover(within(rail).getByRole("link", { name: "프로젝트" }));
  expect(await screen.findByRole("tooltip")).toHaveTextContent("프로젝트");
  fireEvent.pointerLeave(rail);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  expect(rail).toHaveAttribute("data-state", "open");
});

it("supports keyboard rail navigation, Escape, and route changes", async () => {
  const user = userEvent.setup();
  render(<WorkspaceApp />);
  await user.click(screen.getByRole("button", { name: "사이드바 토글" }));
  const edge = screen.getByRole("button", { name: "빠른 메뉴 열기" });
  edge.focus();
  await user.keyboard("{ArrowRight}");
  expect(
    within(screen.getByRole("navigation", { name: "빠른 탐색" })).getByRole(
      "link",
      { name: "프로젝트" },
    ),
  ).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(edge).toHaveFocus();
  expect(edge).toHaveAttribute("aria-expanded", "false");
  await user.keyboard("{Enter}");
  await user.click(screen.getByRole("link", { name: "최근 변경" }));
  expect(
    screen.getByRole("heading", { name: "최근 변경" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "빠른 메뉴 열기" }),
  ).toHaveAttribute("aria-expanded", "false");
});

it("holds the rail open for its shared account popover and dismisses both with Escape", async () => {
  const user = userEvent.setup();
  const { container } = render(<WorkspaceApp />);
  await user.click(screen.getByRole("button", { name: "사이드바 토글" }));
  const edge = screen.getByRole("button", { name: "빠른 메뉴 열기" });
  fireEvent.pointerEnter(edge, { pointerType: "mouse" });
  const rail = screen.getByRole("navigation", { name: "빠른 탐색" });
  expect(
    within(rail).queryByRole("link", { name: "워크스페이스 설정" }),
  ).not.toBeInTheDocument();
  const accountTrigger = within(rail).getByRole("button", { name: "계정 메뉴" });
  await user.click(accountTrigger);
  const account = screen.getByRole("dialog", { name: "계정 설정" });
  expect(accountTrigger).toHaveFocus();
  expect(account.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
  expect(
    within(account).getByRole("radio", { name: "Dark theme" }),
  ).toBeInTheDocument();
  expect(
    within(account).queryByRole("button", { name: "Blue accent" }),
  ).not.toBeInTheDocument();
  expect(
    within(account).getByRole("link", { name: "디자인 시스템" }),
  ).toHaveAttribute("href", "/design-system");
  expect(
    within(account).getByRole("link", { name: "사이트 보기" }),
  ).toHaveAttribute("href", "/");
  vi.useFakeTimers();
  fireEvent.pointerLeave(rail);
  act(() => vi.advanceTimersByTime(200));
  expect(rail).toHaveAttribute("data-state", "open");
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  vi.useRealTimers();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(edge).toHaveFocus();
  expect(
    container.querySelector('[data-slot="sidebar-hover-panel"]'),
  ).toHaveAttribute("inert");
});

it("uses the normal Sheet on mobile without a hover rail", async () => {
  vi.stubGlobal("innerWidth", 390);
  const user = userEvent.setup();
  render(<WorkspaceApp />);
  expect(
    screen.queryByRole("button", { name: "빠른 메뉴 열기" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "사이드바 토글" }));
  const sheet = screen.getByRole("dialog");
  await user.click(within(sheet).getByRole("link", { name: "최근 변경" }));
  expect(
    screen.getByRole("heading", { name: "최근 변경" }),
  ).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(
    screen.queryByRole("button", { name: "빠른 메뉴 열기" }),
  ).not.toBeInTheDocument();
});

it("does not steal focus from a field clicked outside the floating account menu", async () => {
  const user = userEvent.setup();
  render(<WorkspaceApp />);
  await user.click(screen.getByRole("button", { name: "사이드바 토글" }));
  await user.click(screen.getByRole("button", { name: "빠른 메뉴 열기" }));
  await user.click(screen.getByRole("button", { name: "계정 메뉴" }));
  await user.click(screen.getByRole("textbox", { name: "프로젝트 검색" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(screen.getByRole("textbox", { name: "프로젝트 검색" })).toHaveFocus();
});

function WorkspaceApp({ path = "/dashboard" }: { path?: string }) {
  return (
    <AppearanceProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="activity" element={<DashboardActivity />} />
            <Route path="settings" element={<DashboardSettings />} />
            <Route path="settings/members" element={<SettingsMembers />} />
            <Route path="settings/plans" element={<SettingsPlans />} />
            <Route path="settings/invoices" element={<SettingsInvoices />} />
            <Route path="settings/appearance" element={<SettingsAppearance />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppearanceProvider>
  );
}

it("shares workspace identity and mode controls while keeping Blue out of app pages", async () => {
  const user = userEvent.setup();
  const view = render(<WorkspaceApp />);
  expect(
    screen.queryByRole("link", { name: "디자인 시스템" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "사이트 보기" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "워크스페이스 설정" }),
  ).not.toBeInTheDocument();
  expect(document.querySelector('header [data-slot="separator"]')).toBeNull();
  await user.click(screen.getByRole("button", { name: "계정 메뉴" }));
  await user.click(
    screen
      .getByRole("dialog", { name: "계정 설정" })
      .querySelector('a[href="/dashboard/settings"]')!,
  );
  expect(
    screen.queryByRole("dialog", { name: "계정 설정" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "워크스페이스 설정" }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("워크스페이스 이름"), {
    target: { value: "제품 디자인" },
  });
  await user.click(screen.getByRole("button", { name: "변경사항 저장" }));
  expect(screen.getByRole("link", { name: "제품 디자인" })).toBeInTheDocument();
  expect(readWorkspace().name).toBe("제품 디자인");
  await user.click(screen.getByRole("link", { name: "돌아가기" }));
  const scrollRegion = screen
    .getByRole("main")
    .querySelector("main > div") as HTMLElement;
  scrollRegion.scrollTop = 120;
  await user.click(screen.getByRole("link", { name: "최근 변경" }));
  expect(scrollRegion.scrollTop).toBe(0);
  expect(
    await screen.findByRole("heading", { name: "최근 변경" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "워크스페이스 선택" }),
  ).toHaveTextContent("제품 디자인");
  await user.click(screen.getByRole("button", { name: "계정 메뉴" }));
  const account = within(screen.getByRole("dialog", { name: "계정 설정" }));
  expect(account.getByRole("link", { name: "디자인 시스템" })).toHaveAttribute(
    "href",
    "/design-system",
  );
  expect(account.getByRole("link", { name: "사이트 보기" })).toHaveAttribute(
    "href",
    "/",
  );
  await user.click(account.getByRole("radio", { name: "Light theme" }));
  await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  expect(
    account.queryByRole("button", { name: "Blue accent" }),
  ).not.toBeInTheDocument();
  await user.keyboard("{Escape}");
  view.unmount();
  render(<WorkspaceApp path="/dashboard/settings" />);
  expect(screen.getByLabelText("워크스페이스 이름")).toHaveValue("제품 디자인");
  await user.click(screen.getByRole("link", { name: "화면 설정" }));
  expect(screen.getByRole("region", { name: "화면 모드" })).toBeInTheDocument();
  expect(screen.getByRole("radio", { name: "Light theme" })).toBeChecked();
  expect(
    screen.queryByRole("button", { name: "Blue accent" }),
  ).not.toBeInTheDocument();
});

it("preserves unreadable workspace data and blocks overwriting it", () => {
  localStorage.setItem(WORKSPACE_STORAGE_KEY, "broken");
  render(<WorkspaceApp path="/dashboard/settings" />);
  expect(screen.getByRole("alert")).toHaveTextContent("읽지 못했습니다");
  expect(screen.getByRole("button", { name: "변경사항 저장" })).toBeDisabled();
  expect(localStorage.getItem(WORKSPACE_STORAGE_KEY)).toBe("broken");
});

it("keeps the previous workspace name when storage rejects a change", async () => {
  const user = userEvent.setup();
  render(<WorkspaceApp path="/dashboard/settings" />);
  fireEvent.change(screen.getByLabelText("워크스페이스 이름"), {
    target: { value: "새 이름" },
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Full", "QuotaExceededError");
  });
  await user.click(screen.getByRole("button", { name: "변경사항 저장" }));
  expect(screen.getByRole("alert")).toHaveTextContent("저장하지 못했습니다");
  expect(screen.getByRole("link", { name: "Hapalin Studio" })).toBeInTheDocument();
  expect(readWorkspace().name).toBe("Hapalin Studio");
});

it("shows the latest stored change per project in timestamp order", () => {
  localStorage.setItem(
    PROJECTS_STORAGE_KEY,
    JSON.stringify([
      {
        id: "a",
        name: "처음 만든 사이트",
        description: "",
        createdAt: "2026-10-29T01:00:00.000Z",
        updatedAt: "2026-10-29T01:00:00.000Z",
      },
      {
        id: "b",
        name: "수정한 사이트",
        description: "",
        createdAt: "2026-10-28T01:00:00.000Z",
        updatedAt: "2026-10-30T01:00:00.000Z",
      },
    ]),
  );
  render(<WorkspaceApp path="/dashboard/activity" />);
  const updates = within(
    screen.getByRole("region", { name: "최근 변경 목록" }),
  ).getAllByRole("listitem");
  expect(updates).toHaveLength(2);
  expect(updates[0]).toHaveTextContent("수정한 사이트");
  expect(updates[0]).toHaveTextContent("수정했습니다");
  expect(updates[1]).toHaveTextContent("만들었습니다");
});


it("replaces workspace navigation with settings sections and restores it on return", async () => {
  const user = userEvent.setup();
  render(<WorkspaceApp path="/dashboard/settings" />);
  expect(screen.queryByRole("link", { name: "최근 변경" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "워크스페이스 선택" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "일반" })).toHaveAttribute("aria-current", "page");
  const settingsNav = within(screen.getByRole("navigation", { name: "설정 탐색" }));
  for (const title of ["멤버", "요금제", "청구서", "화면 설정"]) {
    await user.click(settingsNav.getByRole("link", { name: title }));
    expect(screen.getByRole("heading", { name: title, level: 1 })).toBeInTheDocument();
    expect(settingsNav.getByRole("link", { name: title })).toHaveAttribute("aria-current", "page");
    expect(document.title).toBe(`${title} | Hapalin`);
  }
  expect(screen.queryByRole("button", { name: "Blue accent" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: "돌아가기" }));
  expect(screen.getByRole("heading", { name: "프로젝트", level: 1 })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "최근 변경" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "일반" })).not.toBeInTheDocument();
});

it("uses the same settings destinations in the collapsed hover rail", async () => {
  const user = userEvent.setup();
  render(<WorkspaceApp path="/dashboard/settings/members" />);
  expect(screen.getByRole("button", { name: "멤버 초대" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "사이드바 토글" }));
  await user.click(screen.getByRole("button", { name: "빠른 메뉴 열기" }));
  expect(screen.queryByRole("link", { name: "최근 변경" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: "요금제" }));
  expect(screen.getByRole("heading", { name: "요금제", level: 1 })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "요금제 선택" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "결제 정보 관리" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "빠른 메뉴 열기" }));
  await user.click(screen.getByRole("link", { name: "돌아가기" }));
  expect(screen.getByRole("heading", { name: "프로젝트", level: 1 })).toBeInTheDocument();
});
