import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BackendProvider } from "./backend-context";
import { BackendWorkspace } from "./backend-workspace";
import { ServerConsole } from "./server-console";
import { ServerTests } from "./server-tests";
import { GuardApi } from "./api";
import {
  apiProject,
  apiRun,
  apiEvidence,
  apiSuite,
  projectId,
  runId,
  jsonResponse,
} from "./api-fixture.test-support";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("connects using a session-only bearer token and never stores it in local storage", async () => {
  const fetcher = vi.fn(async (_url, init) => {
    expect(init.headers.Authorization).toBe("Bearer test-token");
    return jsonResponse([]);
  });
  vi.stubGlobal("fetch", fetcher);
  render(
    <MemoryRouter>
      <BackendProvider>
        <BackendWorkspace />
      </BackendProvider>
    </MemoryRouter>,
  );
  expect(screen.getByRole("button", { name: "새 프로젝트" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("팀 토큰"), {
    target: { value: "test-token" },
  });
  fireEvent.click(screen.getByRole("button", { name: "서버 연결" }));
  expect(await screen.findByText("서버 연결됨")).toBeInTheDocument();
  expect(localStorage.getItem("ossguard.api-session")).toBeNull();
  expect(sessionStorage.getItem("ossguard.api-session")).toBe("test-token");
  fireEvent.click(screen.getByRole("button", { name: "연결 해제" }));
  expect(sessionStorage.getItem("ossguard.api-session")).toBeNull();
});

it("renders a newly registered server project with no executions", async () => {
  sessionStorage.setItem("ossguard.api-session", "test-token");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.startsWith("/api/projects?")) return jsonResponse([apiProject]);
      if (url === `/api/projects/${projectId}`)
        return jsonResponse({
          ...apiProject,
          commit_sha: null,
          execution_profile: {},
          test_suites: [],
        });
      if (url.startsWith("/api/validations?")) return jsonResponse([]);
      throw new Error(`Unexpected request: ${url}`);
    }),
  );
  render(
    <MemoryRouter
      initialEntries={[`/dashboard?project=${projectId}&tab=setup`]}
    >
      <BackendProvider>
        <ServerConsole id={projectId} />
      </BackendProvider>
    </MemoryRouter>,
  );
  expect(
    await screen.findByRole("button", { name: "소스 확인" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByText("프로젝트를 찾을 수 없습니다."),
  ).not.toBeInTheDocument();
});

it("submits the backend contract and keeps the same idempotency key after an uncertain response", async () => {
  sessionStorage.setItem("ossguard.api-session", "test-token");
  sessionStorage.setItem(
    `ossguard.selection.${projectId}`,
    JSON.stringify({ packageName: "pydantic", target: "2.12.5" }),
  );
  const submissions: Record<string, unknown>[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      if (url.startsWith("/api/projects?")) return jsonResponse([apiProject]);
      if (url === `/api/projects/${projectId}`) return jsonResponse(apiProject);
      if (url.startsWith("/api/validations?")) return jsonResponse([]);
      if (url === "/api/validations") {
        submissions.push(JSON.parse(String(init.body)));
        if (submissions.length === 1) throw new Error("response lost");
        return jsonResponse({ id: runId, execution_status: "QUEUED" }, 202);
      }
      if (url.endsWith("/evidence")) return jsonResponse(apiEvidence);
      if (url === `/api/validations/${runId}`) return jsonResponse(apiRun);
      throw new Error(`Unexpected request: ${url}`);
    }),
  );
  render(
    <MemoryRouter initialEntries={[`/dashboard?project=${projectId}`]}>
      <BackendProvider>
        <ServerConsole id={projectId} />
      </BackendProvider>
    </MemoryRouter>,
  );
  const start = await screen.findByRole("button", { name: "검증 시작" });
  fireEvent.click(start);
  expect(await screen.findByText(/저장·접수 여부/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "검증 시작" }));
  expect(
    await screen.findByRole("heading", {
      name: "기준은 통과했지만 후보에서 업무 기준을 위반했습니다",
    }),
  ).toBeInTheDocument();
  expect(submissions[0]).toEqual({
    project_id: projectId,
    package: "pydantic",
    target_version: "2.12.5",
    suite_id: apiSuite.id,
    idempotency_key: expect.any(String),
  });
  expect(submissions[1]).toEqual(submissions[0]);
  expect(screen.getByText("0회")).toBeInTheDocument();
});

it("blocks approval of malformed JSON instead of submitting the last valid value", async () => {
  const api = new GuardApi("test-token");
  const request = vi.spyOn(api, "request");
  render(
    <ServerTests
      api={api}
      projectId={projectId}
      suite={apiSuite}
      rule=""
      dirty
      onChange={() => {}}
      onRule={() => {}}
      onSaved={() => {}}
    />,
  );
  fireEvent.change(screen.getByLabelText("동일 요청 본문 · JSON"), {
    target: { value: "{invalid" },
  });
  fireEvent.click(screen.getByRole("button", { name: "테스트 저장·승인" }));
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(
      "아직 승인하지 않았습니다",
    ),
  );
  expect(request).not.toHaveBeenCalled();
});
