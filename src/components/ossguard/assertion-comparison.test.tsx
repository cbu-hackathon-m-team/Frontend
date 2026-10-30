import { afterEach, expect, it } from "vitest";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssertionComparison } from "./assertion-comparison";
import { pythonDemo } from "./python-demo";
import { GuardResults } from "./guard-results";
import { isWorkspaceNavigationActive } from "@/components/dashboard/workspace-navigation";

const scrollIntoView = HTMLElement.prototype.scrollIntoView;
afterEach(() => {
  cleanup();
  HTMLElement.prototype.scrollIntoView = scrollIntoView;
});

it("puts changed business evidence ahead of matching HTTP results", () => {
  render(
    <AssertionComparison
      project={pythonDemo}
      test={pythonDemo.cases[0]}
      comparison={pythonDemo.samples[0].cases[0]}
    />,
  );
  const comparison = within(
    screen.getByRole("region", { name: "기대값과 A/B 관측값 비교" }),
  );
  expect(comparison.getAllByRole("heading")[0]).toHaveTextContent("배송 요청");
  expect(comparison.getByText("1회")).toBeInTheDocument();
  expect(comparison.getByText("0회")).toBeInTheDocument();
  expect(comparison.getAllByText("200")).toHaveLength(2);
  expect(comparison.getAllByLabelText("기대값 위반")).toHaveLength(1);
});

it("keeps unavailable journal counts unverified instead of showing zero", () => {
  render(
    <AssertionComparison
      project={pythonDemo}
      test={pythonDemo.cases[0]}
      comparison={pythonDemo.samples[3].cases[0]}
    />,
  );
  expect(screen.getByText("미검증")).toBeInTheDocument();
  expect(screen.getAllByRole("heading")[0]).toHaveTextContent("배송 요청");
  expect(screen.getByText("미수집 · 기대 1회")).toBeInTheDocument();
  expect(screen.queryByText("0회")).not.toBeInTheDocument();
  expect(screen.queryByText("결과 변경")).not.toBeInTheDocument();
});

it("keeps run navigation active when drilling into a result", () => {
  const href = "/dashboard?project=python-uv-demo&tab=runs";
  expect(
    isWorkspaceNavigationActive(
      href,
      "/dashboard",
      "?project=python-uv-demo&tab=results",
    ),
  ).toBe(true);
  expect(
    isWorkspaceNavigationActive(
      href,
      "/dashboard",
      "?project=python-uv-demo&tab=setup",
    ),
  ).toBe(false);
});

it("separates unverified results from regressions and recovers from an empty filter", async () => {
  // jsdom has no layout scrolling; Radix focuses the selected option with it.
  HTMLElement.prototype.scrollIntoView = () => {};
  const user = userEvent.setup();
  render(
    <GuardResults
      project={pythonDemo}
      result={pythonDemo.samples[3]}
      run={1}
      embedded
    />,
  );
  act(() => screen.getByRole("combobox", { name: "결과 필터" }).focus());
  await user.keyboard("{ArrowDown}");
  const attention = await screen.findByRole("option", {
    name: "확인 필요",
  });
  act(() => attention.focus());
  await user.keyboard("{Enter}");
  expect(screen.getByText("해당하는 테스트가 없습니다")).toBeInTheDocument();
  expect(
    screen.getByRole("combobox", { name: "비교할 테스트" }),
  ).toBeDisabled();
  act(() => screen.getByRole("combobox", { name: "결과 필터" }).focus());
  await user.keyboard("{ArrowDown}");
  const unverified = await screen.findByRole("option", {
    name: "미검증",
  });
  act(() => unverified.focus());
  await user.keyboard("{Enter}");
  expect(
    within(screen.getByRole("list", { name: "테스트 결과" })).getAllByRole(
      "button",
    ),
  ).toHaveLength(4);
  expect(screen.getByRole("combobox", { name: "비교할 테스트" })).toBeEnabled();
});
