import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppearanceProvider } from "@/components/providers/AppearanceProvider";
import Landing from "./Landing";
import { CanvasPreview, CmsPreview, FeaturePreview } from "./landing-previews";

beforeEach(() => {
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
  vi.unstubAllGlobals();
});

it("connects product copy to supported workflows without template product claims", () => {
  render(
    <MemoryRouter>
      <AppearanceProvider>
        <Landing />
      </AppearanceProvider>
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "업데이트 전후,업무 결과까지 확인하세요.",
  );
  expect(screen.getByRole("link", { name: "검증 시작하기" })).toHaveAttribute(
    "href",
    "/dashboard",
  );
  expect(screen.getByRole("link", { name: "결과 예시 보기" })).toHaveAttribute(
    "href",
    "/dashboard?project=python-uv-demo&tab=results",
  );
  expect(document.querySelectorAll("#platform .fr-feature")).toHaveLength(4);
  expect(document.querySelector("#stories")).toBeNull();
  expect(document.querySelector("#result-verdicts")).toBeNull();
  expect(screen.queryByText("DEPENDENCY UPDATE. VERIFIED.")).not.toBeInTheDocument();
  expect(document.querySelectorAll("#showcase img")).toHaveLength(6);
  const footer = within(
    document.querySelector("footer.fr-footer") as HTMLElement,
  );
  expect(footer.getByRole("link", { name: "지원 범위" })).toHaveAttribute(
    "href",
    "#support",
  );
  for (const link of screen.getAllByRole("link")) {
    expect(link.getAttribute("href")).toMatch(/^(#|\/)/);
  }
  expect(
    screen.queryByText(/99.99%|무료로 시작하기|앱 다운로드|Framer 고객 사례/),
  ).not.toBeInTheDocument();
  for (const link of document.querySelectorAll('a[href^="#"]')) {
    expect(
      document.getElementById(link.getAttribute("href")!.slice(1)),
    ).not.toBeNull();
  }
});

it("explains a missing delivery call even when both HTTP responses succeed", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <AppearanceProvider>
        <Landing />
      </AppearanceProvider>
    </MemoryRouter>,
  );
  const comparison = within(
    screen.getByLabelText("업데이트 전후 실행 비교 예시"),
  );
  const before = within(
    comparison.getByRole("article", { name: "정상 주문 업데이트 전" }),
  );
  const after = within(
    comparison.getByRole("article", { name: "정상 주문 업데이트 후" }),
  );
  expect(before.getByText("200")).toBeInTheDocument();
  expect(after.getByText("200")).toBeInTheDocument();
  expect(
    before.getByText("기대한 배송 요청을 확인했습니다"),
  ).toBeInTheDocument();
  expect(after.getByText("기대한 배송 요청이 없습니다")).toBeInTheDocument();
  expect(comparison.getByRole("status")).toHaveTextContent("업무 기준 위반");
  await user.click(comparison.getByRole("tab", { name: "결제 실패" }));
  expect(comparison.getByRole("status")).toHaveTextContent("기준 충족");
  expect(
    comparison.getAllByText("배송하지 않아야 하는 주문입니다"),
  ).toHaveLength(2);
  await user.click(comparison.getByRole("tab", { name: "정상 주문" }));
  expect(comparison.getByRole("status")).toHaveTextContent("업무 기준 위반");
});

it("separates AI explanations from evidence and describes the supported project scope", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <AppearanceProvider>
        <Landing />
      </AppearanceProvider>
    </MemoryRouter>,
  );
  await user.click(
    screen.getByRole("button", { name: "AI가 테스트 결과를 결정하나요?" }),
  );
  expect(
    screen.getByText(/사용자가 승인한 기대값과 실제 실행 기록으로 결과를 판정/),
  ).toBeVisible();
  await user.click(
    screen.getByRole("button", { name: "어떤 프로젝트를 검증할 수 있나요?" }),
  );
  expect(
    screen.getByText(
      /한 번에 프로젝트가 직접 사용하는 패키지 하나의 목표 버전을 선택/,
    ),
  ).toBeVisible();
});

it("supports Korean page search without changing canvas route identifiers", async () => {
  const user = userEvent.setup();
  render(<CanvasPreview />);
  await user.type(
    screen.getByRole("searchbox", { name: "캔버스 페이지 검색" }),
    "소식",
  );
  const page = screen.getByRole("radio", { name: "/news" });
  await user.click(page);
  expect(page).toHaveAttribute("data-state", "on");
  expect(screen.getByText("소식 — Haus Studio")).toBeInTheDocument();
});

it("keeps CMS filtering and selection actions working with Korean article titles", async () => {
  const user = userEvent.setup();
  render(<CmsPreview />);
  await user.type(
    screen.getByRole("searchbox", { name: "CMS 아티클 검색" }),
    "편안한",
  );
  const row = screen.getByRole("row", {
    name: /자연에서 영감을 얻은 편안한 인터페이스/,
  });
  await user.click(within(row).getByRole("checkbox"));
  const publish = screen.getByRole("button", { name: "1개 게시" });
  expect(publish).toBeEnabled();
  await user.click(publish);
  expect(within(row).getByRole("checkbox")).not.toBeChecked();
});

it("retains feature dispatch identifiers independently of translated display labels", () => {
  render(<FeaturePreview title="Performance" />);
  expect(screen.getByText("Core Web Vitals")).toBeInTheDocument();
  expect(screen.getByText("LCP")).toBeInTheDocument();
  expect(screen.getByText("양호")).toBeInTheDocument();
});
