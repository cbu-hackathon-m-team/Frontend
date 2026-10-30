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
import { BackendConnection, BackendWorkspace } from "./backend-workspace";
import { ServerConsole } from "./server-console";
import { ServerTests } from "./server-tests";
import { GuardApi } from "./api";
import { purchaseDemo } from "./execution-defaults";
import userEvent from "@testing-library/user-event";
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

it("requires confirmation before deleting a server project and refreshes the list", async () => {
  sessionStorage.setItem("ossguard.api-session", "test-token");
  let removed = false;
  const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = String(input);
    if (init?.method === "DELETE") {
      expect(path).toBe(`/api/projects/${projectId}`);
      removed = true;
      return jsonResponse({ id: projectId });
    }
    return jsonResponse(removed ? [] : [apiProject]);
  });
  vi.stubGlobal("fetch", fetcher);
  render(<MemoryRouter><BackendProvider><BackendWorkspace /></BackendProvider></MemoryRouter>);
  const user = userEvent.setup();
  const menu = await screen.findByRole("button", { name: `${apiProject.name} 프로젝트 메뉴` });
  await user.click(menu);
  await user.click(screen.getByRole("menuitem", { name: "프로젝트 삭제" }));
  expect(removed).toBe(false);
  await user.click(screen.getByRole("button", { name: "취소" }));
  expect(removed).toBe(false);
  await user.click(menu);
  await user.click(screen.getByRole("menuitem", { name: "프로젝트 삭제" }));
  await user.click(screen.getByRole("button", { name: "프로젝트 삭제" }));
  expect(await screen.findByText("첫 저장소를 등록하세요")).toBeInTheDocument();
  expect(removed).toBe(true);
});

it("keeps the project and dialog when the server refuses deletion", async () => {
  sessionStorage.setItem("ossguard.api-session", "test-token");
  vi.stubGlobal("fetch", vi.fn(async (_: RequestInfo | URL, init?: RequestInit) =>
    init?.method === "DELETE"
      ? jsonResponse({ error: { code: "PROJECT_BUSY", message: "busy" } }, 409)
      : jsonResponse([apiProject])));
  render(<MemoryRouter><BackendProvider><BackendWorkspace /></BackendProvider></MemoryRouter>);
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: `${apiProject.name} 프로젝트 메뉴` }));
  await user.click(screen.getByRole("menuitem", { name: "프로젝트 삭제" }));
  await user.click(screen.getByRole("button", { name: "프로젝트 삭제" }));
  expect(await screen.findByText("검증 실행·자원 정리·결과 처리가 끝난 뒤 삭제할 수 있습니다.")).toBeInTheDocument();
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "취소" }));
  expect(screen.getByRole("link", { name: apiProject.name })).toBeInTheDocument();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("prefills a runnable public repository and keeps the registration form as the next action", async () => {
  sessionStorage.setItem("ossguard.api-session", "test-token");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => jsonResponse([])),
  );
  render(
    <MemoryRouter>
      <BackendProvider>
        <BackendWorkspace />
      </BackendProvider>
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "새 프로젝트" })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "새 프로젝트" }));
  expect(screen.getByLabelText("저장소 URL")).toHaveValue(
    purchaseDemo.repository,
  );
  expect(screen.getByLabelText("프로젝트 이름")).toHaveValue(purchaseDemo.name);
  expect(screen.getByLabelText("브랜치·태그·커밋")).toHaveValue("main");
  expect(screen.queryByText("첫 저장소를 등록하세요")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("저장소 URL"), {
    target: { value: "https://github.com/team/other" },
  });
  expect(screen.getByLabelText("저장소 URL")).toHaveValue(
    "https://github.com/team/other",
  );
});

it.each([
  [purchaseDemo.repository, undefined, "2.12.5"],
  [purchaseDemo.repository, "1.10.24", "1.10.24"],
  ["https://github.com/team/other", undefined, ""],
])(
  "fills only the sample target and retains explicit selections: %s / %s",
  async (repository, target, expected) => {
    sessionStorage.setItem("ossguard.api-session", "test-token");
    if (target)
      sessionStorage.setItem(
        `ossguard.selection.${projectId}`,
        JSON.stringify({ packageName: "pydantic", target }),
      );
    const project = { ...apiProject, repository_url: repository! };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.startsWith("/api/projects?")) return jsonResponse([project]);
        if (url === `/api/projects/${projectId}`) return jsonResponse(project);
        if (url.includes("/dependencies/"))
          return jsonResponse({ versions: ["2.12.5", "1.10.24"] });
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
    expect(await screen.findByLabelText("목표 버전")).toHaveValue(expected);
    expect(screen.getByLabelText("직접 의존성")).toHaveTextContent("pydantic");
  },
);

it("connects using a session-only bearer token and never stores it in local storage", async () => {
  const fetcher = vi.fn(async (_url, init) => {
    expect(init.headers.Authorization).toBe("Bearer test-token");
    return jsonResponse([]);
  });
  vi.stubGlobal("fetch", fetcher);
  render(
    <MemoryRouter>
      <BackendProvider>
        <BackendConnection settings />
      </BackendProvider>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("서버 접근 키"), {
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
