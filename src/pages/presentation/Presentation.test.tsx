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
  act(() => captures[0].update());
  expect(screen.getByRole("status")).toHaveTextContent("15 / 15");
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
  act(() => captures[0].update());
  expect(screen.getByRole("status")).toHaveTextContent("02 / 15");
  fireEvent.keyDown(window, { key: "ArrowRight" });
  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(captures).toHaveLength(1);
  expect(captures[0].skip).not.toHaveBeenCalled();
  await act(async () => captures[0].finish());
  expect(captures).toHaveLength(2);
  act(() => captures[1].update());
  expect(screen.getByRole("status")).toHaveTextContent("04 / 15");
  await act(async () => captures[1].finish());
  expect(document.documentElement.dataset.pptDirection).toBeUndefined();
});

it("cancels an uncommitted step reversed back to the current page", async () => {
  const captures = controlledTransitions();
  render(<Deck />);
  fireEvent.keyDown(window, { key: "ArrowRight" });
  fireEvent.keyDown(window, { key: "ArrowLeft" });
  act(() => captures[0].update());
  expect(screen.getByRole("status")).toHaveTextContent("01 / 15");
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
  expect(screen.getByRole("status")).toHaveTextContent("02 / 15");
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  fireEvent.keyDown(window, { key: "ArrowLeft" });
  expect(capture).toHaveBeenCalledOnce();
  expect(screen.getByRole("status")).toHaveTextContent("01 / 15");
  expect(document.documentElement.dataset.pptDirection).toBeUndefined();
});

it("renders fifteen slides with one visible slide and supports keyboard boundaries", () => {
  const { container } = render(<Deck />);
  expect(container.querySelectorAll("[data-slide]")).toHaveLength(15);
  expect(container.querySelectorAll("[data-slide]:not([hidden])")).toHaveLength(1);
  expect(screen.getByRole("button", { name: "이전 슬라이드" })).toBeDisabled();
  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(screen.getByRole("status")).toHaveTextContent("02 / 15");
  fireEvent.keyDown(window, { key: "End" });
  expect(screen.getByRole("status")).toHaveTextContent("15 / 15");
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "다음 슬라이드" })).toBeDisabled();
  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(screen.getByRole("status")).toHaveTextContent("15 / 15");
  fireEvent.keyDown(window, { key: "Home" });
  fireEvent.keyDown(window, { key: "ArrowLeft" });
  expect(screen.getByRole("status")).toHaveTextContent("01 / 15");
});

it("restores deep links and lets the outline choose a slide without advancing behind the dialog", () => {
  render(<Deck hash="#10" />);
  expect(screen.getByRole("status")).toHaveTextContent("10 / 15");
  fireEvent.click(screen.getByRole("button", { name: "슬라이드 목차" }));
  const dialog = screen.getByRole("dialog", { name: "발표 목차" });
  expect(within(dialog).getAllByRole("button")).toHaveLength(16);
  fireEvent.keyDown(window, { key: "End" });
  expect(screen.getByRole("status")).toHaveTextContent("10 / 15");
  fireEvent.click(within(dialog).getByRole("button", { name: /13.*서비스에서/ }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("13 / 15");
  for (const link of screen.getAllByRole("link")) {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
});

it("offers a site link midway through the deck without an export control", () => {
  render(<Deck hash="#6" />);
  expect(screen.queryByRole("button", { name: /인쇄|PDF/ })).not.toBeInTheDocument();
  const link = screen.getByRole("link", { name: "사이트 가기" });
  expect(link).toHaveAttribute("href", "/");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
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
  expect(screen.getByRole("status")).toHaveTextContent("01 / 15");
  fireEvent.keyDown(window, { key: " ", code: "Space" });
  expect(screen.getByRole("status")).toHaveTextContent("02 / 15");
  fireEvent.keyDown(window, { key: " ", code: "Space", shiftKey: true });
  expect(screen.getByRole("status")).toHaveTextContent("01 / 15");
});

it("explains the fallback when fullscreen is unavailable", async () => {
  render(<Deck />);
  fireEvent.click(screen.getByRole("button", { name: "전체 화면" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("F11");
  expect(screen.getByRole("status")).toHaveTextContent("01 / 15");
});

it("falls back to the cover for invalid page links", () => {
  expect(slides).toHaveLength(15);
  for (const hash of ["", "#0", "#-1", "#16", "#2.5", "#hello"]) expect(slideIndex(hash)).toBe(0);
  expect(slideIndex("#15")).toBe(14);
});

it("explores project uses with native tabs without advancing the slide", async () => {
  const user = userEvent.setup();
  render(<Deck hash="#3" />);
  await user.click(screen.getByRole("tab", { name: "브랜드 사이트" }));
  expect(screen.getByRole("tabpanel")).toHaveTextContent("브랜드가 가진 이야기를 모으는 공간");
  await user.keyboard("{ArrowRight}");
  await waitFor(() => expect(screen.getByRole("tab", { name: "캠페인" })).toHaveAttribute("aria-selected", "true"));
  expect(screen.getByRole("status")).toHaveTextContent("03 / 15");
});

it("introduces the product without decorative corner labels or a design-system pitch", () => {
  const { container } = render(<Deck />);
  expect(container.querySelectorAll('[class*="ppt-slide-masthead"], [class*="ppt-slide-footer"]')).toHaveLength(0);
  expect(container).not.toHaveTextContent(/DESIGN SYSTEM|PRODUCT FOUNDATION|Tokens|shadcn|React|디자인 시스템/);
  expect(slides.some(slide => slide.id === "search")).toBe(true);
  expect(slides.some(slide => slide.id === "activity")).toBe(true);
});

it("keeps decorative vector paints local to each mounted scene", () => {
  const { container } = render(<Deck />);
  const artwork = Array.from(container.querySelectorAll("svg[data-art]"));
  expect(artwork).toHaveLength(5);
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

it("filters the local demo and switches its view without stealing its keyboard input", async () => {
  const user = userEvent.setup();
  render(<Deck hash="#10" />);
  const demo = screen.getByLabelText("직접 조작하는 프로젝트 예시");
  await user.click(within(demo).getByRole("radio", { name: "목록 보기 예시" }));
  expect(demo.querySelector('[data-view="list"]')).toBeInTheDocument();
  const search = within(demo).getByRole("textbox", { name: "프로젝트 검색 예시" });
  await user.type(search, "팀");
  expect(within(demo).queryByText("브랜드 웹사이트")).not.toBeInTheDocument();
  expect(within(demo).getByText("팀 포트폴리오")).toBeInTheDocument();
  await user.keyboard("{End}");
  expect(screen.getByRole("status")).toHaveTextContent("10 / 15");
  await user.clear(search);
  await user.type(search, "없는 프로젝트");
  expect(within(demo).getByText("검색 결과가 없습니다")).toBeInTheDocument();
});

it("creates and previews a presentation-only project without writing storage", async () => {
  const user = userEvent.setup();
  const save = vi.spyOn(Storage.prototype, "setItem");
  render(<Deck hash="#10" />);
  await user.click(screen.getByRole("button", { name: "새 프로젝트" }));
  const dialog = screen.getByRole("dialog", { name: "샘플 프로젝트 만들기" });
  fireEvent.keyDown(window, { key: "End" });
  expect(screen.getByRole("status")).toHaveTextContent("10 / 15");
  expect(within(dialog).getByRole("button", { name: "만들기" })).toBeDisabled();
  fireEvent.change(within(dialog).getByRole("textbox", { name: "프로젝트 이름" }), { target: { value: "해커톤 데모" } });
  await user.click(within(dialog).getByRole("button", { name: "만들기" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await user.click(screen.getByRole("button", { name: "해커톤 데모 미리보기" }));
  const preview = screen.getByRole("dialog", { name: "해커톤 데모" });
  expect(within(preview).getByRole("link", { name: /실제 워크스페이스 열기/ })).toHaveAttribute("target", "_blank");
  await user.keyboard("{Escape}");
  expect(save).not.toHaveBeenCalled();
});
