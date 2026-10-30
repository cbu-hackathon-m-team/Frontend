import type { ApiProject, ApiRun, HttpCase, RunEvidence, Suite } from "./api";
export const projectId = "11111111-1111-4111-8111-111111111111";
export const runId = "22222222-2222-4222-8222-222222222222";
export const httpCase: HttpCase = {
  id: "T01",
  method: "POST",
  path: "/orders",
  body: { paid: true, stock: 10, quantity: 2 },
  expected_status: 200,
  assertions: [{ path: "stock_after", op: "eq", value: 8 }],
  external: [
    {
      method: "POST",
      path: "/shipping",
      count: 1,
      body_contains: {},
      response_status: 200,
    },
  ],
  ignore_paths: [],
};
export const apiSuite: Suite = {
  id: "suite-1",
  revision: 1,
  cases: [httpCase],
  stubs: [{ method: "POST", path: "/shipping", status: 200, body: {} }],
  approved: true,
};
export const apiProject: ApiProject = {
  id: projectId,
  name: "검증 서비스",
  repository_url: "https://github.com/team/service",
  ref: "main",
  commit_sha: "a".repeat(40),
  revision: 1,
  created_at: "2026-10-31T00:00:00Z",
  execution_profile: {
    schema_version: 1,
    ecosystem: "python-uv",
    dockerfile: "Dockerfile.ossguard",
    python: "3.12",
    app_port: 8000,
    health_path: "/health",
    test_cases: "ossguard/tests.json",
    mock_stubs: "ossguard/stubs",
    env_schema: {},
  },
  environment_profile: {},
  rules: {},
  notification: {},
  inspection: {
    dependencies: [
      {
        name: "pydantic",
        declaration: "pydantic==1.10.24",
        locked_version: "1.10.24",
      },
    ],
  },
  test_suites: [apiSuite],
};
export const apiRun: ApiRun = {
  id: runId,
  project_id: projectId,
  package: "pydantic",
  target_version: "2.12.5",
  execution_status: "COMPLETED",
  phase: "finished",
  verdict: "REGRESSION_SUSPECTED",
  error_code: null,
  error_message: null,
  created_at: "2026-10-31T00:00:00Z",
  started_at: "2026-10-31T00:00:01Z",
  finished_at: "2026-10-31T00:00:10Z",
  cleanup_status: "SUCCEEDED",
  analysis_status: "SKIPPED",
  analysis: {},
  notification_statuses: [],
  snapshot: {
    repository_url: apiProject.repository_url,
    commit_sha: apiProject.commit_sha!,
    baseline_version: "1.10.24",
    suite: apiSuite,
    execution_profile:
      apiProject.execution_profile as ApiRun["snapshot"]["execution_profile"],
    rules: {},
  },
  evidence: {
    last_execution_phase: "compare",
    phase_times: Object.fromEntries(
      [
        "source",
        "baseline_build",
        "baseline_test",
        "update",
        "candidate_build",
        "candidate_test",
        "compare",
      ].map((p) => [p, "2026-10-31T00:00:01Z"]),
    ),
    baseline: { installed_packages: { pydantic: "1.10.24" } },
    candidate: { installed_packages: { pydantic: "2.12.5" } },
    update: {
      file_diffs: {
        "uv.lock": { text: "-1.10.24\n+2.12.5", truncated: false },
      },
    },
  },
};
export const apiEvidence: RunEvidence = {
  evidence: apiRun.evidence,
  test_results: [
    {
      case_id: "T01",
      environment: "baseline",
      status_code: 200,
      body: { stock_after: 8 },
      normalized_body: { stock_after: 8 },
      events: [
        {
          request: { method: "POST", url: "/shipping" },
          wasMatched: true,
          response_status: 200,
        },
      ],
      checks: [
        { rule: "http_status", expected: 200, actual: 200, passed: true },
        { rule: "json.stock_after.eq", expected: 8, actual: 8, passed: true },
        {
          rule: "external.POST./shipping",
          expected: 1,
          actual: 1,
          passed: true,
        },
      ],
      passed: true,
      request_error: null,
    },
    {
      case_id: "T01",
      environment: "candidate",
      status_code: 200,
      body: { stock_after: 8 },
      normalized_body: { stock_after: 8 },
      events: [],
      checks: [
        { rule: "http_status", expected: 200, actual: 200, passed: true },
        { rule: "json.stock_after.eq", expected: 8, actual: 8, passed: true },
        {
          rule: "external.POST./shipping",
          expected: 1,
          actual: 0,
          passed: false,
        },
      ],
      passed: false,
      request_error: null,
    },
  ],
};
export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
