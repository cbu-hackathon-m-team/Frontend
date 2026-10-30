import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Presentation, { slideIndex } from "./Presentation";
import { slides } from "./slides";

const originalTransition = document.startViewTransition;

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => {
  cleanup();
  document.startViewTransition = originalTransition;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function Deck({ hash = "" }: { hash?: string }) {
  return <MemoryRouter initialEntries={[`/ppt${hash}`]}><Routes><Route path="/ppt" element={<Presentation />} /></Routes></MemoryRouter>;
}

function controlledTransitions() {
  const captures: Array<{ update: () => void; finish: () => void; skip: ReturnType<typeof vi.fn> }> = [];
  document.startViewTransition = vi.fn((update: () => void) => {
    let finish!: () => void;
    const finished = new Promise<void>(resolve => { finish = resolve; });
    const skip = vi.fn();
    captures.push({ update, finish, skip });
    return { ready: Promise.resolve(), finished, skipTransition: skip } as unknown as ViewTransition;
  }) as typeof document.startViewTransition;
  return captures;
}

it("coalesces inputs before capture without restarting it and cleans up on exit", async () => {
  const captures = controlledTransitions();
  const { unmount } = render(<Deck />);
  fireEvent.keyDown(window, { key: "ArrowRight" });
  fireEvent.keyDown(window, { key: "End" });
  expect(captures).toHaveLength(1);
  expect(captures[0].skip).not.toHaveBeenCalled();
  act(() => { void captures[0].update(); });
  expect(screen.getByRole("status")).toHaveTextContent("12 / 12");
  expect(document.documentElement.dataset.pptDirection).toBe("jump");
  unmount();
  expect(captures[0].skip).toHaveBeenCalledOnce();
  await act(async () => captures[0].finish());
  expect(document.documentElement.dataset.pptDirection).toBeUndefined();
  expect(captures).toHaveLength(1);
});

it("finishes the current pose before animating the latest queued destination", async () => {
  const captures = controlledTransitions();
  render(<Deck />);
  fireEvent.keyDown(window, { key: "ArrowRight" });
  act(() => { void captures[0].update(); });
  expect(screen.getByRole("status")).toHaveTextContent("02 / 12");
  fireEvent.keyDown(window, { key: "ArrowRight" });
  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(captures).toHaveLength(1);
  expect(captures[0].skip).not.toHaveBeenCalled();
  await act(async () => captures[0].finish());
  expect(captures).toHaveLength(2);
  act(() => { void captures[1].update(); });
  expect(screen.getByRole("status")).toHaveTextContent("04 / 12");
  await act(async () => captures[1].finish());
  expect(document.documentElement.dataset.pptDirection).toBeUndefined();
});

it("cancels an uncommitted step reversed back to the current page", async () => {
  const captures = controlledTransitions();
  render(<Deck />);
  fireEvent.keyDown(window, { key: "ArrowRight" });
  fireEvent.keyDown(window, { key: "ArrowLeft" });
  act(() => { void captures[0].update(); });
  expect(screen.getByRole("status")).toHaveTextContent("01 / 12");
  expect(captures[0].skip).toHaveBeenCalledOnce();
  await act(async () => captures[0].finish());
  expect(captures).toHaveLength(1);
  expect(document.documentElement.dataset.pptDirection).toBeUndefined();
});

it("navigates without capture when reduced motion is requested or capture fails", () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  const capture = vi.fn(() => { throw new Error("Capture unavailable"); });
  document.startViewTransition = capture;
  render(<Deck />);
  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(capture).not.toHaveBeenCalled();
  expect(screen.getByRole("status")).toHaveTextContent("02 / 12");
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  fireEvent.keyDown(window, { key: "ArrowLeft" });
  expect(capture).toHaveBeenCalledOnce();
  expect(screen.getByRole("status")).toHaveTextContent("01 / 12");
  expect(document.documentElement.dataset.pptDirection).toBeUndefined();
});

it("releases an active capture immediately when reduced motion is requested", async () => {
  const captures = controlledTransitions();
  render(<Deck />);
  fireEvent.keyDown(window, { key: "ArrowRight" });
  act(() => { void captures[0].update(); });
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(screen.getByRole("status")).toHaveTextContent("03 / 12");
  expect(captures[0].skip).toHaveBeenCalledOnce();
  await act(async () => captures[0].finish());
  expect(captures).toHaveLength(1);
  expect(document.documentElement.dataset.pptDirection).toBeUndefined();
});

it("preserves old and new headline rectangles and releases the temporary copy geometry", async () => {
  const captures = controlledTransitions();
  const { container } = render(<Deck />);
  const oldTitle = container.querySelector('[data-slide="1"] h1')!;
  const nextTitle = container.querySelector('[data-slide="2"] h2')!;
  vi.spyOn(oldTitle, "getBoundingClientRect").mockReturnValue(new DOMRect(60, 200, 400, 120));
  vi.spyOn(nextTitle, "getBoundingClientRect").mockReturnValue(new DOMRect(40, 80, 500, 140));
  fireEvent.keyDown(window, { key: "ArrowRight" });
  const geometry = document.documentElement.style;
  expect(geometry.getPropertyValue("--ppt-old-title-x")).toBe("60px");
  act(() => { void captures[0].update(); });
  expect(geometry.getPropertyValue("--ppt-new-title-x")).toBe("40px");
  expect(geometry.getPropertyValue("--ppt-new-title-w")).toBe("500px");
  expect(geometry.getPropertyValue("--ppt-old-title-w")).toBe("400px");
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("에러 없이도");
  await act(async () => captures[0].finish());
  expect(geometry.getPropertyValue("--ppt-old-title-x")).toBe("");
  expect(geometry.getPropertyValue("--ppt-new-title-w")).toBe("");
});

it("renders twelve slides with one visible slide and supports keyboard boundaries", () => {
  const { container } = render(<Deck />);
  expect(container.querySelectorAll("[data-slide]")).toHaveLength(12);
  expect(container.querySelectorAll("[data-slide]:not([hidden])")).toHaveLength(1);
  expect(screen.getByRole("button", { name: "이전 슬라이드" })).toBeDisabled();
  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(screen.getByRole("status")).toHaveTextContent("02 / 12");
  fireEvent.keyDown(window, { key: "End" });
  expect(screen.getByRole("status")).toHaveTextContent("12 / 12");
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "다음 슬라이드" })).toBeDisabled();
  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(screen.getByRole("status")).toHaveTextContent("12 / 12");
  fireEvent.keyDown(window, { key: "Home" });
  fireEvent.keyDown(window, { key: "ArrowLeft" });
  expect(screen.getByRole("status")).toHaveTextContent("01 / 12");
});

it("restores deep links and lets the outline choose a slide without advancing behind the dialog", () => {
  render(<Deck hash="#10" />);
  expect(screen.getByRole("status")).toHaveTextContent("10 / 12");
  fireEvent.click(screen.getByRole("button", { name: "슬라이드 목차" }));
  const dialog = screen.getByRole("dialog", { name: "발표 목차" });
  expect(within(dialog).getAllByRole("button")).toHaveLength(13);
  fireEvent.keyDown(window, { key: "End" });
  expect(screen.getByRole("status")).toHaveTextContent("10 / 12");
  fireEvent.click(within(dialog).getByRole("button", { name: /04.*Pydantic/ }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("04 / 12");
  fireEvent.keyDown(window, { key: "End" });
  expect(screen.getByRole("status")).toHaveTextContent("12 / 12");
  for (const link of screen.getAllByRole("link")) {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
});

it("keeps business expectations and user approval together", () => {
  render(<Deck hash="#6" />);
  expect(screen.queryByRole("button", { name: /인쇄|PDF/ })).not.toBeInTheDocument();
  const slide = screen.getByRole("region", { name: /6\./ });
  for (const text of ["테스트 입력", "기대 결과", "사용자가 확인해 승인", "AI 초안"]) {
    expect(slide).toHaveTextContent(text);
  }
});

it("coalesces pointer artwork updates and clears their frame on exit", () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  let update: FrameRequestCallback | undefined;
  const request = vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => { update = callback; return 11; });
  const cancel = vi.spyOn(window, "cancelAnimationFrame");
  const { unmount } = render(<Deck />);
  const stage = screen.getByRole("main");
  request.mockClear();
  vi.spyOn(stage, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 1000, height: 500 } as DOMRect);
  fireEvent.pointerMove(stage, { clientX: 700, clientY: 300 });
  fireEvent.pointerMove(stage, { clientX: 800, clientY: 350 });
  expect(request).toHaveBeenCalledOnce();
  act(() => update?.(0));
  expect(Number(stage.style.getPropertyValue("--ppt-pointer-x"))).toBeCloseTo(.3);
  fireEvent.pointerMove(stage, { clientX: 500, clientY: 250 });
  unmount();
  expect(cancel).toHaveBeenCalledWith(11);
  expect(stage.style.getPropertyValue("--ppt-pointer-x")).toBe("0");
});

it("does not intercept typing, modified shortcuts, or space on a button", () => {
  render(<Deck />);
  fireEvent.keyDown(window, { key: "End", ctrlKey: true });
  fireEvent.keyDown(screen.getByRole("button", { name: "다음 슬라이드" }), { key: " ", code: "Space" });
  expect(screen.getByRole("status")).toHaveTextContent("01 / 12");
  fireEvent.keyDown(window, { key: " ", code: "Space" });
  expect(screen.getByRole("status")).toHaveTextContent("02 / 12");
  fireEvent.keyDown(window, { key: " ", code: "Space", shiftKey: true });
  expect(screen.getByRole("status")).toHaveTextContent("01 / 12");
});

it("explains the fallback when fullscreen is unavailable", async () => {
  render(<Deck />);
  fireEvent.click(screen.getByRole("button", { name: "전체 화면" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("F11");
  expect(screen.getByRole("status")).toHaveTextContent("01 / 12");
});

it("falls back to the cover for invalid page links", () => {
  expect(slides).toHaveLength(12);
  for (const hash of ["", "#0", "#-1", "#13", "#2.5", "#hello"]) expect(slideIndex(hash)).toBe(0);
  expect(slideIndex("#12")).toBe(11);
});

it("compares approved order cases without advancing the slide or writing storage", async () => {
  const user = userEvent.setup();
  const save = vi.spyOn(Storage.prototype, "setItem");
  render(<Deck hash="#4" />);
  expect(screen.getByRole("tabpanel")).toHaveTextContent("요청 누락");
  expect(screen.getByRole("tabpanel")).toHaveTextContent("기대 1회");
  await user.click(screen.getByRole("tab", { name: "결제 실패" }));
  const panel = screen.getByRole("tabpanel");
  expect(panel).toHaveTextContent("기준 충족 · 결제 실패 주문은 두 버전 모두 배송하지 않습니다");
  expect(panel).toHaveTextContent("기대 0회");
  expect(within(panel).getAllByRole("cell", { name: "10개" })).toHaveLength(2);
  await user.keyboard("{ArrowLeft}");
  await waitFor(() => expect(screen.getByRole("tab", { name: "결제 완료" })).toHaveAttribute("aria-selected", "true"));
  expect(screen.getByRole("tabpanel")).toHaveTextContent("요청 누락");
  expect(screen.getByRole("status")).toHaveTextContent("04 / 12");
  expect(save).not.toHaveBeenCalled();
});

it("introduces the product without decorative corner labels or a design-system pitch", () => {
  const { container } = render(<Deck />);
  expect(container.querySelectorAll('[class*="ppt-slide-masthead"], [class*="ppt-slide-footer"]')).toHaveLength(0);
  expect(container).not.toHaveTextContent(/DESIGN SYSTEM|PRODUCT FOUNDATION|Tokens|shadcn|React|디자인 시스템/);
  expect(screen.getByRole("main")).toHaveAccessibleName("OSSGuard 서비스 발표");
  expect(document.title).toContain("OSSGuard");
  expect(container).not.toHaveTextContent(/Hapalin Studio|브랜드 웹사이트|포트폴리오|웹사이트 완성/);
});

it("keeps decorative vector paints local to each mounted scene", () => {
  const { container } = render(<Deck />);
  const artwork = Array.from(container.querySelectorAll("svg[data-art]"));
  expect(artwork).toHaveLength(3);
  const ids = artwork.flatMap(svg => Array.from(svg.querySelectorAll("[id]")).map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  for (const svg of artwork) {
    expect(svg).toHaveAttribute("aria-hidden", "true");
    for (const path of svg.querySelectorAll("path")) {
      for (const attribute of ["fill", "stroke"]) {
        const paint = path.getAttribute(attribute);
        if (paint?.startsWith("url(#")) expect(svg.querySelector(`[id="${paint.slice(5, -1)}"]`)).not.toBeNull();
      }
    }
  }
});

it("separates business regressions from execution failures and missing evidence", () => {
  render(<Deck hash="#9" />);
  const slide = screen.getByRole("region", { name: /9\./ });
  for (const outcome of ["회귀 의심", "실행 단계 실패", "기준 확인 필요", "미검증"]) {
    expect(within(slide).getByText(outcome, { exact: true })).toBeInTheDocument();
  }
});

it("preserves the MVP limits and labels the comparison as a demonstration", () => {
  const { container } = render(<Deck hash="#11" />);
  expect(screen.getByRole("heading", { name: "첫 MVP" })).toBeInTheDocument();
  expect(container.querySelector('[data-kind="scope"]')).toHaveTextContent("직접 사용하는 라이브러리 하나");
  expect(container.querySelector('[data-kind="tests"]')).toHaveTextContent("응답의 남은 재고");
  expect(container.querySelector('[data-kind="tests"]')).not.toHaveTextContent("이번 시연은 응답의 재고 값을 검사합니다");
  expect(container.querySelector('[data-kind="case"]')).toHaveTextContent("재현 사례");
  expect(container.querySelector('[data-kind="case"]')).toHaveTextContent('Decision(approved=True)');
  expect(container.querySelector('[data-kind="evidence"]')).toHaveTextContent("사용자가 승인한 기준");
});
