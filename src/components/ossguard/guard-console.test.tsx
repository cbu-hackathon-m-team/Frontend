import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GuardConsole } from "./guard-console";
import { demoProject, selectedProject } from "./demo-project";
import { PROJECTS_STORAGE_KEY } from "@/components/dashboard/projects";
import { readDraft } from "./draft";
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});
it("starts an arbitrary project without sample tests or tool-specific steps", () => {
  localStorage.setItem(
    PROJECTS_STORAGE_KEY,
    JSON.stringify([
      {
        id: "custom",
        name: "문서 검색",
        description: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]),
  );
  const project = selectedProject("?project=custom")!;
  expect(project.cases).toEqual([]);
  expect(project.steps).toEqual([]);
  expect(project.samples).toEqual([]);
  render(
    <MemoryRouter initialEntries={["/?tab=tests"]}>
      <GuardConsole project={project} />
    </MemoryRouter>,
  );
  expect(screen.getByText("검증할 동작을 추가하세요")).toBeInTheDocument();
  expect(screen.queryByText(/배송|재고|Node-RED/)).not.toBeInTheDocument();
});
it("persists arbitrary expected values and requires reconfirmation", () => {
  const view = render(
    <MemoryRouter initialEntries={["/?tab=tests"]}>
      <GuardConsole project={demoProject} />
    </MemoryRouter>,
  );
  fireEvent.change(
    screen.getByLabelText("T01 · 정상 주문 / 기대 배송 요청 횟수"),
    { target: { value: "3" } },
  );
  expect(readDraft(demoProject).confirmed).toBe(false);
  fireEvent.click(
    screen.getByRole("button", { name: "테스트 확정하고 실행 준비" }),
  );
  expect(screen.getByRole("button", { name: "샘플 기록 비교" })).toBeEnabled();
  view.unmount();
  render(
    <MemoryRouter initialEntries={["/?tab=tests"]}>
      <GuardConsole project={demoProject} />
    </MemoryRouter>,
  );
  expect(
    screen.getByLabelText("T01 · 정상 주문 / 기대 배송 요청 횟수"),
  ).toHaveValue("3");
});
it("adds and removes tests and criteria without a fixed limit", () => {
  render(
    <MemoryRouter initialEntries={["/?tab=tests"]}>
      <GuardConsole project={demoProject} />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "테스트 추가" }));
  expect(readDraft(demoProject).definition.cases).toHaveLength(5);
  const added = readDraft(demoProject).definition.cases[4];
  expect(
    screen.getByRole("button", { name: "테스트 확정하고 실행 준비" }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", { name: `${added.id} 테스트 삭제` }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "T01 HTTP 응답 조건 삭제" }),
  );
  expect(readDraft(demoProject).definition.cases[0].assertions).toHaveLength(2);
  expect(
    screen.getByRole("button", { name: "테스트 확정하고 실행 준비" }),
  ).toBeEnabled();
});
it("keeps historical result criteria separate from current edits", () => {
  render(
    <MemoryRouter initialEntries={["/?tab=tests"]}>
      <GuardConsole project={demoProject} />
    </MemoryRouter>,
  );
  fireEvent.change(
    screen.getByLabelText("T01 · 정상 주문 / 기대 배송 요청 횟수"),
    { target: { value: "5" } },
  );
  const draft = readDraft(demoProject);
  expect(draft.definition.cases[0].assertions[2].expected).toBe(5);
  expect(draft.latest?.definition.cases[0].assertions[2].expected).toBe(1);
});
it("opens result evidence from the preparation view", () => {
  render(
    <MemoryRouter>
      <GuardConsole project={demoProject} />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { name: "주문 처리 서비스" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /DEMO-001/ }));
  expect(
    screen.getByRole("heading", { name: "검증 결과" }),
  ).toBeInTheDocument();
  expect(screen.getByText("첫 차이 · 배송 요청")).toBeInTheDocument();
});

const customProject = {
  ...demoProject,
  id: "search-ui-check",
  target: { id: "configured", name: "Search service", adapter: "", source: "" },
  rule: "색인한 문서가 검색된다",
  cases: [
    {
      id: "query",
      name: "검색",
      input: "POST /search",
      intent: "색인한 문서가 검색된다",
      assertions: [],
    },
  ],
  samples: [],
  steps: [],
  defaultSample: "",
  recordedInputs: {},
  recordingContext: undefined,
};
it("keeps a preview out of execution history", () => {
  render(
    <MemoryRouter>
      <GuardConsole project={customProject} />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "비교 화면 미리보기" }));
  expect(screen.getByText("실행 전 비교 미리보기")).toBeInTheDocument();
  expect(readDraft(customProject).latest).toBeUndefined();
});
it("keeps local drafts out of the backend execution endpoint", () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  render(<MemoryRouter><GuardConsole project={customProject} /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "서버에 등록" }));
  expect(fetcher).not.toHaveBeenCalled();
  expect(readDraft(customProject).latest).toBeUndefined();
});
