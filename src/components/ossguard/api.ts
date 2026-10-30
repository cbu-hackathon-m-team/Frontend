export interface HttpCase {
  id: string;
  method: string;
  path: string;
  body: unknown;
  expected_status: number;
  assertions: { path: string; op: "eq" | "gte"; value: unknown }[];
  external: {
    method: string;
    path: string;
    body_contains: Record<string, unknown>;
    count: number;
    response_status: number;
  }[];
  ignore_paths: string[];
}
export interface Suite {
  id?: string;
  revision?: number;
  cases: HttpCase[];
  stubs: {
    method: string;
    path: string;
    status: number;
    body: Record<string, unknown>;
  }[];
  approved: boolean;
}
export interface ExecutionProfile {
  schema_version: 1;
  ecosystem: "python-uv";
  dockerfile: string;
  python: string;
  app_port: number;
  health_path: string;
  test_cases: string;
  mock_stubs: string;
  env_schema: Record<
    string,
    { required: boolean; secret: boolean; source: "user" | "runner_mock" }
  >;
}
export interface Dependency {
  name: string;
  declaration: string;
  locked_version: string;
}
export interface ApiProject {
  id: string;
  name: string;
  repository_url: string;
  ref: string;
  commit_sha: string | null;
  revision: number;
  created_at: string;
  execution_profile: Partial<ExecutionProfile>;
  environment_profile: {
    values?: Record<string, string>;
    secret_refs?: Record<string, string>;
  };
  rules: { description?: string; input_schema?: Record<string, unknown> };
  notification: { enabled?: boolean; email?: string };
  inspection: { dependencies?: Dependency[] };
  test_suites?: Suite[];
}
export type ExecutionStatus =
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "INTERRUPTED";
export interface ApiRun {
  id: string;
  project_id: string;
  package: string;
  target_version: string;
  execution_status: ExecutionStatus;
  phase: string;
  verdict:
    | "PASS"
    | "REGRESSION_SUSPECTED"
    | "BASELINE_INVALID"
    | "NOT_EVALUATED";
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  cleanup_status: string;
  analysis_status: string;
  analysis: {
    summary?: string;
    candidates?: string[];
    evidence_refs?: string[];
    error?: string;
  };
  snapshot: {
    repository_url: string;
    commit_sha: string;
    baseline_version: string;
    suite: Suite;
    execution_profile: ExecutionProfile;
    rules: { description?: string };
  };
  evidence: Record<string, unknown>;
  notification_statuses?: string[];
}
export interface Check {
  rule: string;
  expected?: unknown;
  actual?: unknown;
  passed: boolean;
}
export interface CaseResult {
  case_id: string;
  environment: "baseline" | "candidate";
  status_code?: number;
  passed?: boolean;
  request_error?: string | null;
  truncated?: boolean;
  checks?: Check[];
  body?: unknown;
  normalized_body?: unknown;
  events?: {
    request: {
      method: string;
      url: string;
      body?: string;
      loggedDate?: number;
    };
    wasMatched: boolean;
    response_status: number;
  }[];
}
export interface RunEvidence {
  evidence: Record<string, unknown>;
  test_results: CaseResult[];
}

const messages: Record<string, string> = {
  UNAUTHORIZED: "팀 토큰을 확인해 다시 연결하세요.",
  AUTH_NOT_CONFIGURED: "서버의 팀 인증이 설정되지 않았습니다.",
  REPOSITORY_DENIED: "서버의 허용 목록에 등록된 저장소를 사용하세요.",
  REPO_NOT_ALLOWED: "서버의 허용 목록에 등록된 저장소를 사용하세요.",
  REPOSITORY_NOT_ALLOWED: "서버의 허용 목록에 등록된 저장소를 사용하세요.",
  INSPECTION_REQUIRED: "먼저 소스를 확인하고 의존성을 선택하세요.",
  TESTS_NOT_APPROVED: "업무 테스트를 저장·승인한 뒤 실행하세요.",
  AI_NOT_CONFIGURED:
    "AI 연결이 설정되지 않았습니다. 테스트를 직접 작성할 수 있습니다.",
};
export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 0) {
    super(messages[code] ?? message);
    this.code = code;
    this.status = status;
  }
}
export class GuardApi {
  private token: string;
  private base: string;
  constructor(token: string, base = import.meta.env.VITE_API_BASE_URL ?? "") {
    this.token = token;
    this.base = base;
  }
  async request<T>(
    path: string,
    method = "GET",
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (signal?.aborted) controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const timeout = window.setTimeout(abort, 60000);
    try {
      const response = await fetch(this.base.replace(/\/$/, "") + path, {
        method,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.token}`,
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!response.headers.get("content-type")?.includes("application/json"))
        throw new ApiError(
          "INVALID_RESPONSE",
          "API 주소와 연결 상태를 확인하세요.",
          response.status,
        );
      const data = await response.json();
      if (!response.ok) {
        const error = data?.error;
        const details = error?.details
          ?.map(
            (d: { location?: string[]; message?: string }) =>
              `${d.location?.slice(1).join(".")}: ${d.message}`,
          )
          .join(" · ");
        throw new ApiError(
          error?.code ?? "API_ERROR",
          error?.message || details || "요청을 처리하지 못했습니다.",
          response.status,
        );
      }
      return data as T;
    } catch (error) {
      if (error instanceof ApiError || signal?.aborted) throw error;
      throw new ApiError(
        "CONNECTION_ERROR",
        method === "GET"
          ? "서버에 연결하지 못했습니다. 다시 조회해 주세요."
          : "서버 응답을 확인하지 못했습니다. 저장·접수 여부를 조회한 뒤 다시 시도하세요.",
      );
    } finally {
      window.clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    }
  }
  projects(signal?: AbortSignal) {
    return this.request<ApiProject[]>(
      "/api/projects?limit=100",
      "GET",
      undefined,
      signal,
    );
  }
  project(id: string, signal?: AbortSignal) {
    return this.request<ApiProject>(
      `/api/projects/${encodeURIComponent(id)}`,
      "GET",
      undefined,
      signal,
    );
  }
  runs(id: string, signal?: AbortSignal) {
    return this.request<ApiRun[]>(
      `/api/validations?project_id=${encodeURIComponent(id)}&limit=30`,
      "GET",
      undefined,
      signal,
    );
  }
  run(id: string, signal?: AbortSignal) {
    return this.request<ApiRun>(
      `/api/validations/${encodeURIComponent(id)}`,
      "GET",
      undefined,
      signal,
    );
  }
  evidence(id: string, signal?: AbortSignal) {
    return this.request<RunEvidence>(
      `/api/validations/${encodeURIComponent(id)}/evidence`,
      "GET",
      undefined,
      signal,
    );
  }
}
export const statusLabel: Record<ExecutionStatus, string> = {
  QUEUED: "대기 중",
  RUNNING: "실행 중",
  COMPLETED: "완료",
  FAILED: "실행 실패",
  INTERRUPTED: "중단됨",
};
export const activeRun = (run: ApiRun) =>
  run.execution_status === "QUEUED" || run.execution_status === "RUNNING";
export const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
