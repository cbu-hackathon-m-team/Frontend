import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppearanceProvider } from "@/components/providers/AppearanceProvider";
import Landing from "./Landing";
import { CanvasPreview, CmsPreview, FeaturePreview } from "./landing-previews";

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("preserves source destinations and local component navigation under Korean labels", () => {
  render(<MemoryRouter><AppearanceProvider><Landing /></AppearanceProvider></MemoryRouter>);
  expect(screen.getByRole("img", { name: "호스팅을 표현한 추상 이미지" })).toHaveAttribute("src", "/images/framer/hosting.png");
  const footer = within(document.querySelector("footer.fr-footer") as HTMLElement);
  expect(footer.getByRole("link", { name: "디자인" })).toHaveAttribute("href", "https://www.framer.com/design/");
  expect(footer.getByRole("link", { name: "컴포넌트" })).toHaveAttribute("href", "/design-system");
  expect(footer.getByRole("link", { name: "요금제" })).toHaveAttribute("href", "https://www.framer.com/pricing");
  expect(footer.getByRole("link", { name: "Figma" })).toHaveAttribute("href", "https://www.framer.com/compare/framer-vs-figma");
});

it("supports Korean page search without changing canvas route identifiers", async () => {
  const user = userEvent.setup();
  render(<CanvasPreview />);
  await user.type(screen.getByRole("searchbox", { name: "캔버스 페이지 검색" }), "소식");
  const page = screen.getByRole("radio", { name: "/news" });
  await user.click(page);
  expect(page).toHaveAttribute("data-state", "on");
  expect(screen.getByText("소식 — Haus Studio")).toBeInTheDocument();
});

it("keeps CMS filtering and selection actions working with Korean article titles", async () => {
  const user = userEvent.setup();
  render(<CmsPreview />);
  await user.type(screen.getByRole("searchbox", { name: "CMS 아티클 검색" }), "편안한");
  const row = screen.getByRole("row", { name: /자연에서 영감을 얻은 편안한 인터페이스/ });
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
