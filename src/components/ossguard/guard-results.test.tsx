import { afterEach, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { GuardResults } from "./guard-results";
import { demoProject } from "./demo-project";
import type { ValidationProject } from "./model";
afterEach(cleanup);

it("renders another domain from normalized metadata, including unknown observations", () => {
  // A contract fixture, not a claim that this tool has a working adapter.
  const project: ValidationProject = {
    id: "document-index",
    name: "문서 색인",
    description: "문서 색인 비교",
    target: {
      id: "fake",
      name: "Contract fixture",
      source: "https://example.com",
      adapter: "fake",
    },
    baseline: { label: "A", artifact: "a" },
    candidate: { label: "B", artifact: "b" },
    rule: "문서 색인 수 유지",
    steps: [
      { key: "parse", label: "문서 해석" },
      { key: "index", label: "색인 저장" },
    ],
    cases: [
      {
        id: "DOC-1",
        name: "문서 추가",
        input: "문서 3개",
        assertions: [
          { key: "indexed", label: "색인된 문서", expected: 3, unit: "개" },
        ],
      },
    ],
    defaultSample: "unknown",
    samples: [
      {
        id: "unknown",
        label: "수집 없음",
        title: "수집 범위 확인",
        summary: "색인 단계 미관측",
        outcome: "unverified",
        change: "색인 설정",
        diff: "index config",
        cases: [
          {
            caseId: "DOC-1",
            outcome: "unverified",
            baseline: {
              status: "passed",
              values: { indexed: 3 },
              steps: { parse: "completed", index: "completed" },
              evidence: "baseline record",
            },
            candidate: {
              status: "unverified",
              values: {},
              steps: { parse: "completed" },
              evidence: "candidate record",
            },
            analysis: {
              fact: "관측 없음",
              hypothesis: "확인 필요",
              next: "기록 수집",
            },
          },
        ],
      },
    ],
  };
  render(
    <GuardResults project={project} result={project.samples[0]} run={1} />,
  );
  expect(screen.getAllByText("문서 해석")[0]).toBeInTheDocument();
  expect(screen.getAllByText("색인 저장")[0]).toBeInTheDocument();
  expect(screen.getAllByText("미확인")[0]).toBeInTheDocument();
  expect(screen.getByRole("table")).toHaveTextContent("—");
  expect(screen.queryByText(/Node-RED|배송|재고/)).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "실행 기록 · 시연 데이터" }),
  );
  expect(screen.getByText("candidate record")).toBeInTheDocument();
});

it("changes both the step and value evidence with the selected case", () => {
  render(
    <GuardResults
      project={demoProject}
      result={demoProject.samples[0]}
      run={1}
    />,
  );
  expect(screen.getByText("첫 차이 · 배송 요청")).toBeInTheDocument();
  const cases = within(screen.getByRole("list", { name: "테스트 결과" }));
  fireEvent.click(cases.getByRole("button", { name: /T03/ }));
  expect(screen.queryByText("첫 차이 · 배송 요청")).not.toBeInTheDocument();
  expect(screen.getAllByText("실행 안 함").length).toBeGreaterThanOrEqual(4);
  expect(
    screen.getByText("후보 배송 요청 0회 / 기대값 0회"),
  ).toBeInTheDocument();
});

it("draws collected transitions and bypasses an absent call in the candidate", () => {
  const { container } = render(
    <GuardResults
      project={demoProject}
      result={demoProject.samples[0]}
      run={1}
    />,
  );
  const baseline = screen.getByRole("img", { name: "기준 A 수집 순서" });
  const candidate = screen.getByRole("img", { name: "후보 B 수집 순서" });
  expect(
    baseline.querySelector('[data-trace-edge="stock:shipping"]'),
  ).not.toBeNull();
  expect(
    candidate.querySelector('[data-trace-edge="stock:shipping"]'),
  ).toBeNull();
  expect(
    candidate.querySelector('[data-trace-edge="stock:response"]'),
  ).not.toBeNull();
  expect(container.querySelectorAll("[data-trace-edge]")).toHaveLength(7);
});
