import userEvent from "@testing-library/user-event";
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { pythonDemo } from "./python-demo";
import { RequestComparison } from "./request-comparison";
import { ValidationDetail } from "./validation-detail";
import { repositoryReady } from "./repository-setup";
import { compareRecordedSample } from "./comparison";

afterEach(cleanup);
it("shows only HTTP and external calls and connects candidate directly to the response", () => {
  const { container } = render(
    <RequestComparison
      project={pythonDemo}
      comparison={pythonDemo.samples[0].cases[0]}
    />,
  );
  expect(screen.getByText("첫 차이 · 배송 API")).toBeInTheDocument();
  expect(
    container.querySelector('[data-trace-edge="0:request:shipping"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-trace-edge="1:request:shipping"]'),
  ).toBeNull();
  expect(
    container.querySelector('[data-trace-edge="1:request:response"]'),
  ).not.toBeNull();
  expect(screen.getAllByText("HTTP 200").length).toBeGreaterThanOrEqual(2);
  expect(screen.queryByText("결제 확인")).not.toBeInTheDocument();
});
it("does not convert observation failure into a missing call", () => {
  render(
    <RequestComparison
      project={pythonDemo}
      comparison={pythonDemo.samples[3].cases[0]}
    />,
  );
  expect(screen.queryByText("첫 차이 · 배송 API")).not.toBeInTheDocument();
  expect(
    screen.getByText("수집된 기록이 없습니다. 0건으로 판정하지 않습니다."),
  ).toBeInTheDocument();
});
it("opens build failure in execution details and keeps missing installed version distinct", async () => {
  const user = userEvent.setup();
  render(
    <ValidationDetail
      project={pythonDemo}
      result={pythonDemo.samples[2]}
      run={1}
    />,
  );
  expect(screen.getByRole("tab", { name: "실행·로그" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByText("BUILD_ERROR · 예시")).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "변경 증거" }));
  expect(screen.getByText("수집되지 않음")).toBeInTheDocument();
  expect(screen.getByText("pyproject.toml")).toBeInTheDocument();
});
it("validates the repository-based setup and never reuses observations for a modified JSON request", () => {
  expect(repositoryReady(pythonDemo)).toBe(false);
  const configured = {
    ...pythonDemo,
    repository: { url: "https://github.com/team/app", ref: "main" },
  };
  expect(repositoryReady(configured)).toBe(true);
  expect(
    repositoryReady({
      ...configured,
      connection: { ...configured.connection!, entry: "invalid" },
    }),
  ).toBe(false);
  expect(
    repositoryReady({
      ...configured,
      executionProfile: { ...configured.executionProfile!, dockerfile: "" },
    }),
  ).toBe(false);
  expect(
    repositoryReady({
      ...configured,
      executionProfile: { ...configured.executionProfile!, port: 0 },
    }),
  ).toBe(false);
  const changed = structuredClone(pythonDemo.cases);
  changed[0].request!.body = '{"quantity":100}';
  expect(
    compareRecordedSample(pythonDemo, pythonDemo.samples[0], changed).cases[0]
      .outcome,
  ).toBe("unverified");
});
