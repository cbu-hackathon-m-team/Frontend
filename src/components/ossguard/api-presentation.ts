import {
  type ApiProject,
  type ApiRun,
  type CaseResult,
  type HttpCase,
  type RunEvidence,
  type Suite,
  statusLabel,
  activeRun,
} from "./api";
import {
  type ValidationProject,
  type ValidationCase,
  type SampleRun,
  type Observation,
  type Value,
} from "./model";

export const phases = [
  ["source", "소스 준비"],
  ["baseline_build", "기준 A 빌드"],
  ["baseline_test", "기준 A 테스트"],
  ["update", "의존성 변경"],
  ["candidate_build", "후보 B 빌드"],
  ["candidate_test", "후보 B 테스트"],
  ["compare", "업무 비교"],
  ["cleanup", "자원 정리"],
] as const;
export const phaseLabel = (phase: string) =>
  phases.find(([id]) => id === phase)?.[1] ??
  (phase === "finished" ? "완료" : "대기 중");
export const verdictLabel = {
  PASS: "전체 통과",
  REGRESSION_SUSPECTED: "회귀 의심",
  BASELINE_INVALID: "기준 확인 필요",
  NOT_EVALUATED: "미검증",
};
const outcome = {
  PASS: "passed",
  REGRESSION_SUSPECTED: "regression",
  BASELINE_INVALID: "baseline-failed",
  NOT_EVALUATED: "unverified",
} as const;
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const value = (v: unknown): Value =>
  v === null ||
  typeof v === "number" ||
  typeof v === "boolean" ||
  typeof v === "string"
    ? v
    : (JSON.stringify(v) ?? "—");
const externalKey = (method: string, path: string) =>
  `external:${method}:${path}`;
export function suiteCase(c: HttpCase): ValidationCase {
  return {
    id: c.id,
    name: `${c.method} ${c.path}`,
    input: JSON.stringify(c.body ?? null),
    request: {
      method: c.method,
      path: c.path,
      body: JSON.stringify(c.body ?? null, null, 2),
    },
    assertions: [
      { key: "check-0", label: "HTTP 상태", expected: c.expected_status },
      ...c.assertions.map((a, i) => ({
        key: `check-${i + 1}`,
        label: a.path || "JSON 응답",
        expected: value(a.value),
        operator: a.op,
      })),
      ...c.external.map((e, i) => ({
        key: `check-${1 + c.assertions.length + i}`,
        label: `${e.method} ${e.path}`,
        expected: e.count,
        unit: "회",
        stepKey: externalKey(e.method, e.path),
      })),
    ],
  };
}
export function projectPresentation(
  p: ApiProject,
  suite?: Suite,
  packageName = "",
  target = "",
): ValidationProject {
  const dep = p.inspection.dependencies?.find((d) => d.name === packageName);
  const cases = suite?.cases ?? [];
  const external = [
    ...new Map(
      cases.flatMap((c) =>
        c.external.map(
          (e) =>
            [
              externalKey(e.method, e.path),
              {
                key: externalKey(e.method, e.path),
                label: `${e.method} ${e.path}`,
              },
            ] as const,
        ),
      ),
    ).values(),
  ];
  return {
    id: p.id,
    name: p.name,
    description: "",
    target: {
      id: "python-uv",
      name: "Python / uv",
      adapter: "python-uv",
      source: p.repository_url,
    },
    repository: {
      url: p.repository_url,
      ref: p.ref,
      sha: p.commit_sha ?? undefined,
      inspection: p.commit_sha ? "verified" : "unchecked",
    },
    baseline: { label: dep?.locked_version ?? "확인 전", artifact: "uv.lock" },
    candidate: { label: target || "목표 미선택", artifact: "uv.lock" },
    update: {
      ecosystem: "python-uv",
      packageName,
      declared: dep?.declaration ?? "",
      locked: dep?.locked_version ?? "",
      targetVersion: target,
    },
    rule: p.rules.description ?? "",
    steps: [
      { key: "request", label: "업무 요청" },
      ...external,
      { key: "response", label: "HTTP 응답" },
    ],
    cases: cases.map(suiteCase),
    samples: [],
    defaultSample: "",
    executionProfile: {
      dockerfile: p.execution_profile.dockerfile ?? "Dockerfile.ossguard",
      port: p.execution_profile.app_port ?? 8000,
      healthPath: p.execution_profile.health_path ?? "/health",
      variables: [],
    },
  };
}

function observation(c: HttpCase, row?: CaseResult): Observation {
  const known = !!row && !row.truncated && Array.isArray(row.checks);
  const journalKnown = known && Array.isArray(row.events);
  const steps: Observation["steps"] = {
    request: known ? "completed" : "unknown",
    response: known && !!row.status_code ? "completed" : "unknown",
  };
  const values: Observation["values"] = {},
    checks: Record<string, boolean> = {};
  if (known)
    row.checks!.forEach((check, i) => {
      if (Object.hasOwn(check, "actual") && !(i === 0 && !row.status_code))
        values[`check-${i}`] = value(check.actual);
      checks[`check-${i}`] = check.passed;
    });
  for (const e of c.external) {
    const check = row?.checks?.find(
      (x) => x.rule === `external.${e.method}.${e.path}`,
    );
    steps[externalKey(e.method, e.path)] =
      !journalKnown || !check
        ? "unknown"
        : Number(check.actual) > 0
          ? "completed"
          : e.count === 0
            ? "skipped"
            : "missing";
  }
  const events: NonNullable<Observation["events"]> = [];
  if (known)
    events.push({
      stepKey: "request",
      sequence: 1,
      operation: `${c.method} ${c.path}`,
      data: { body: JSON.stringify(c.body ?? null) },
    });
  if (journalKnown) {
    for (const event of [...row.events!].sort(
      (a, b) => (a.request.loggedDate ?? 0) - (b.request.loggedDate ?? 0),
    )) {
      const path = event.request.url.split("?")[0];
      events.push({
        stepKey: externalKey(event.request.method, path),
        sequence: events.length + 1,
        operation: `${event.request.method} ${path}`,
        data: {
          status: event.response_status,
          matched: event.wasMatched,
          body: event.request.body ?? "",
        },
      });
    }
  }
  if (known && row.status_code)
    events.push({
      stepKey: "response",
      sequence: events.length + 1,
      operation: "HTTP response",
      data: {
        status: row.status_code,
        body:
          JSON.stringify(
            Object.hasOwn(row, "normalized_body")
              ? row.normalized_body
              : row.body,
          ) ?? "",
      },
    });
  return {
    status:
      !known || row.request_error
        ? "unverified"
        : row.passed
          ? "passed"
          : "failed",
    values,
    checks,
    steps,
    events: journalKnown ? events : undefined,
    evidence: row
      ? JSON.stringify(row, null, 2)
      : "실행되지 않았거나 수집된 증거가 없습니다.",
  };
}
function storedText(input: unknown): string {
  const block = record(input);
  return typeof input === "string"
    ? input
    : typeof block.text === "string"
      ? block.text +
        (block.truncated
          ? `\n[일부 보관: ${block.retained_bytes}/${block.original_bytes} bytes]`
          : "")
      : "";
}
const followup = (status: string) =>
  ({
    PENDING: "대기",
    RUNNING: "처리 중",
    SUCCEEDED: "완료",
    SKIPPED: "사용 안 함",
    FAILED: "실패",
    ACCEPTED: "접수됨 · 수신 미확인",
    UNKNOWN: "전송 여부 불명",
    SENDING: "전송 중",
  })[status] ?? status;

export function runPresentation(
  project: ApiProject,
  job: ApiRun,
  retained: RunEvidence,
) {
  const p = projectPresentation(
    {
      ...project,
      repository_url: job.snapshot.repository_url,
      commit_sha: job.snapshot.commit_sha,
      execution_profile: job.snapshot.execution_profile,
      rules: job.snapshot.rules,
      inspection: {
        dependencies: [
          {
            name: job.package,
            declaration: "",
            locked_version: job.snapshot.baseline_version,
          },
        ],
      },
    },
    job.snapshot.suite,
    job.package,
    job.target_version,
  );
  const evidence = record(retained.evidence);
  const times = record(evidence.phase_times);
  const update = record(evidence.update);
  const last = String(evidence.last_execution_phase ?? job.phase);
  const errorPhase = job.verdict === "BASELINE_INVALID"
    ? "baseline_test"
    : job.execution_status === "FAILED" || job.execution_status === "INTERRUPTED"
      ? last
      : "";
  const lastIndex = phases.findIndex(([key]) => key === last);
  const pairs = p.cases.map((c, i) => {
    const source = job.snapshot.suite.cases[i];
    const a = observation(
      source,
      retained.test_results.find(
        (r) => r.case_id === c.id && r.environment === "baseline",
      ),
    );
    const b = observation(
      source,
      retained.test_results.find(
        (r) => r.case_id === c.id && r.environment === "candidate",
      ),
    );
    const verdict =
      a.status === "unverified"
        ? "unverified"
        : a.status === "failed"
          ? "baseline-failed"
          : b.status === "unverified"
            ? "unverified"
            : b.status === "failed"
              ? "regression"
              : "passed";
    return {
      caseId: c.id,
      baseline: a,
      candidate: b,
      outcome: verdict,
      analysis: {
        fact: c.assertions
          .map(
            (check) =>
              `${check.label}: A ${a.values[check.key] ?? "미수집"} / B ${b.values[check.key] ?? "미수집"}`,
          )
          .join(" · "),
        hypothesis:
          job.analysis.candidates?.join("\n") || "AI 설명이 없습니다.",
        next:
          job.analysis.summary ||
          (job.error_message ?? "승인한 기대값과 원본 실행 증거를 확인하세요."),
      },
    } satisfies SampleRun["cases"][number];
  });
  const packageChanges =
    evidence.installed_package_diff ?? update.lock_package_diff;
  const result: SampleRun = {
    id: job.id,
    label: statusLabel[job.execution_status],
    status: job.execution_status,
    createdAt: job.created_at,
    control: job.snapshot.baseline_version === job.target_version,
    source: "runner",
    awaitingResults: activeRun(job),
    outcome: outcome[job.verdict],
    title: activeRun(job)
      ? `${statusLabel[job.execution_status]} · ${phaseLabel(job.phase)}`
      : job.error_code
        ? `${phaseLabel(last)} 실패 · ${job.error_code}`
        : job.verdict === "REGRESSION_SUSPECTED"
          ? "기준은 통과했지만 후보에서 업무 기준을 위반했습니다"
          : verdictLabel[job.verdict],
    summary:
      job.error_message ??
      (evidence.truncated
        ? "증거 크기 제한으로 일부 자료가 보관되지 않았습니다."
        : ""),
    change: `${job.package} ${job.snapshot.baseline_version} → ${job.target_version}`,
    diff: Object.values(record(update.file_diffs)).map(storedText).join("\n"),
    cases: pairs,
    execution: {
      kind: "observed",
      stages: phases.map(([id, label], index) => {
        const env = id.startsWith("baseline")
          ? record(evidence.baseline)
          : id.startsWith("candidate")
            ? record(evidence.candidate)
            : {};
        const state =
          id === "cleanup"
            ? job.cleanup_status === "SUCCEEDED"
              ? "done"
              : job.cleanup_status === "FAILED"
                ? "failed"
                : job.phase === "cleanup"
                  ? "running"
                  : "pending"
            : id === errorPhase
              ? "failed"
              : activeRun(job) && id === job.phase
                ? "running"
                : times[id] && (index < lastIndex || !activeRun(job))
                  ? "done"
                  : activeRun(job) ? "pending" : "skipped";
        return {
          id,
          label,
          state,
          detail: [
            times[id] ? `시작: ${times[id]}` : "단계 시작 기록 없음",
            id === "baseline_test" && job.verdict === "BASELINE_INVALID"
              ? "기준 A가 승인된 테스트 조건을 충족하지 못해 후보 B 실행을 건너뛰었습니다. 업무 테스트의 기대값과 Mock 응답 설정을 확인하세요."
              : id === errorPhase
              ? `${job.error_code}: ${job.error_message}\n${storedText(evidence.failure_log)}`
              : "",
            id.endsWith("_build") ? storedText(env.build_log) : "",
            id.endsWith("_test")
              ? retained.test_results
                  .filter((row) => row.environment === (id === "baseline_test" ? "baseline" : "candidate"))
                  .map((row) => {
                    const source = job.snapshot.suite.cases.find((c) => c.id === row.case_id);
                    return [
                      `${row.case_id} · ${row.passed ? "통과" : "실패"}`,
                      row.request_error ? `요청 오류: ${row.request_error}` : "",
                      ...(row.checks ?? []).map((check) =>
                        `${check.passed ? "통과" : "실패"} ${check.rule} · 기대 ${JSON.stringify(check.expected)} / 관측 ${JSON.stringify(check.actual)}`),
                      ...(source?.external ?? []).map((e) =>
                        `${e.method} ${e.path} · 기대 호출 ${e.count}회 · 기대 Mock 상태 ${e.response_status}`),
                      ...(row.events ?? []).map((e) =>
                        `${e.request.method} ${e.request.url} · 관측 Mock 상태 ${e.response_status} · 매칭 ${e.wasMatched ? "성공" : "실패"}`),
                    ].filter(Boolean).join("\n");
                  }).join("\n\n")
              : "",
            state === "skipped" ? "실행이 종료되어 이 단계는 수행하지 않았습니다." : "",
            id === "update" ? storedText(update.update_log) : "",
            id === "cleanup"
              ? JSON.stringify(
                  evidence.recovery_cleanup
                    ? {
                        initial: evidence.cleanup,
                        recovery: evidence.recovery_cleanup,
                      }
                    : (evidence.cleanup ?? {}),
                  null,
                  2,
                )
              : "",
          ]
            .filter(Boolean)
            .join("\n"),
        };
      }),
      installedA: record(record(evidence.baseline).installed_packages)[
        job.package
      ] as string | undefined,
      installedB: record(record(evidence.candidate).installed_packages)[
        job.package
      ] as string | undefined,
      files: Object.entries(record(update.file_diffs)).map(([path, diff]) => ({
        path,
        diff: storedText(diff),
      })),
      packages: (Array.isArray(packageChanges) ? packageChanges : []).map(
        (v) => {
          const d = record(v);
          return {
            name: String(d.name),
            before: String(d.before ?? "없음"),
            after: String(d.after ?? "없음"),
            direct: d.name === job.package,
          };
        },
      ),
      cleanup: followup(job.cleanup_status),
      ai: followup(job.analysis_status),
      email: job.notification_statuses?.length
        ? job.notification_statuses.map(followup).join(" · ")
        : "사용 안 함",
    },
  };
  return { definition: p, result };
}
