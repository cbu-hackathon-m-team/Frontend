import { cases } from "./sample";
import { purchaseDemo } from "./execution-defaults";
import {
  executionContext,
  type Observation,
  type SampleRun,
  type ValidationProject,
} from "./model";

const labels = [
  "소스 준비",
  "기준 A 빌드·테스트",
  "의존성 변경",
  "후보 B 빌드·테스트",
  "업무 비교",
  "자원 정리",
];
function observation(
  index: number,
  candidate: boolean,
  kind: string,
): Observation {
  const unobserved =
    candidate && (kind === "build-error" || kind === "observation-error");
  const ships = index < 2;
  const missing = ships && candidate && kind === "regression";
  const events: NonNullable<Observation["events"]> = unobserved
    ? []
    : [
        {
          stepKey: "request",
          sequence: 1,
          operation: "POST /orders",
          data: {
            payment: index === 2 ? "failed" : "paid",
            quantity: 2,
            stock: [10, 2, 10, 1][index],
          },
        },
        ...(ships && !missing
          ? [
              {
                stepKey: "shipping",
                sequence: 2,
                operation: "POST /shipping",
                data: { matched: true, status: 200 },
              },
            ]
          : []),
        {
          stepKey: "response",
          sequence: ships && !missing ? 3 : 2,
          operation: "HTTP response",
          data: { status: 200, remaining_stock: cases[index].stock },
        },
      ];
  if (candidate && kind === "observation-error")
    return {
      status: "unverified",
      values: { response: 200, stock: cases[index].stock },
      steps: {
        request: "completed",
        shipping: "unknown",
        response: "completed",
      },
      events: [
        {
          stepKey: "request",
          sequence: 1,
          operation: "POST /orders",
          data: {
            payment: index === 2 ? "failed" : "paid",
            quantity: 2,
            stock: [10, 2, 10, 1][index],
          },
        },
        {
          stepKey: "response",
          sequence: 2,
          operation: "HTTP response",
          data: { status: 200, remaining_stock: cases[index].stock },
        },
      ],
      evidence: JSON.stringify(
        {
          source: "illustrative-ui-data",
          error: "OBSERVATION_ERROR",
          response: 200,
          journal: "unavailable",
        },
        null,
        2,
      ),
    };
  return {
    status: unobserved ? "unverified" : missing ? "failed" : "passed",
    values: unobserved
      ? {}
      : {
          response: 200,
          stock: cases[index].stock,
          delivery: ships && !missing ? 1 : 0,
        },
    steps: {
      request: unobserved ? "unknown" : "completed",
      shipping: unobserved
        ? "unknown"
        : !ships
          ? "skipped"
          : missing
            ? "missing"
            : "completed",
      response: unobserved ? "unknown" : "completed",
    },
    events,
    evidence: JSON.stringify(
      {
        source: "illustrative-ui-data",
        journal: unobserved ? "unavailable" : "complete",
        events,
      },
      null,
      2,
    ),
  };
}
function run(kind: string): SampleRun {
  const outcome =
    kind === "regression"
      ? "regression"
      : kind === "passed"
        ? "passed"
        : "unverified";
  return {
    id: kind,
    label: {
      regression: "업무 회귀",
      passed: "전체 통과",
      "build-error": "후보 빌드 실패",
      "observation-error": "관측 오류",
    }[kind]!,
    outcome,
    title:
      kind === "regression"
        ? "응답은 성공했지만 배송 호출이 누락됐습니다"
        : kind === "passed"
          ? "확정한 업무 테스트를 모두 통과했습니다"
          : kind === "build-error"
            ? "후보 빌드 실패 · 업무 테스트 미실행"
            : "후보 호출 기록을 수집하지 못했습니다",
    summary:
      "업데이트된 명세의 화면 검토용 예시 데이터입니다. 실제 저장소·실행 결과가 아닙니다.",
    change: "pydantic 1.10.24 → 2.12.5",
    diff: "- pydantic==1.10.24\n+ pydantic==2.12.5",
    execution: {
      kind: "example",
      stages: labels.map((label, i) => ({
        id: String(i),
        label,
        state:
          kind === "build-error" && i === 3
            ? "failed"
            : kind === "build-error" && i === 4
              ? "pending"
              : kind === "observation-error" && i === 4
                ? "failed"
                : "done",
        detail:
          kind === "build-error" && i === 3
            ? "BUILD_ERROR · 예시"
            : kind === "build-error" && i === 4
              ? "빌드 실패로 미실행"
              : kind === "observation-error" && i === 4
                ? "OBSERVATION_ERROR · WireMock 저널 조회 실패 예시"
                : "화면 예시",
      })),
      installedA: "1.10.24",
      installedB: kind === "build-error" ? undefined : "2.12.5",
      files: [
        {
          path: "pyproject.toml",
          diff: '- "pydantic==1.10.24"\n+ "pydantic==2.12.5"',
        },
        {
          path: "uv.lock",
          diff: '- name = "pydantic", version = "1.10.24"\n+ name = "pydantic", version = "2.12.5"\n+ name = "pydantic-core", version = "2.41.5"',
        },
      ],
      packages: [
        { name: "pydantic", before: "1.10.24", after: "2.12.5", direct: true },
        {
          name: "pydantic-core",
          before: "없음",
          after: "2.41.5",
          direct: false,
        },
      ],
      cleanup: "완료 예시",
      ai: "설명 예시",
      email: "미발송",
    },
    cases: cases.map((c, index) => {
      const baseline = observation(index, false, kind),
        candidate = observation(index, true, kind);
      return {
        caseId: c.id,
        baseline,
        candidate,
        outcome:
          candidate.status === "unverified"
            ? "unverified"
            : candidate.status === "failed"
              ? "regression"
              : "passed",
        analysis: {
          fact:
            candidate.status === "unverified"
              ? kind === "observation-error"
                ? "HTTP 응답은 200이지만 후보의 외부 호출 저널은 미확인입니다."
                : "후보 빌드 실패로 업무 테스트를 실행하지 못했습니다."
              : `HTTP A/B: 200 · 배송 요청 A ${baseline.values.delivery}회 / B ${candidate.values.delivery}회`,
          hypothesis:
            kind === "regression"
              ? "모델과 dict의 동등성 변경이 배송 분기에 영향을 줬을 가능성이 있습니다. 내부 함수 호출은 관측하지 않았습니다."
              : "관측 범위와 판정 기준을 확인하세요.",
          next: "변경된 의존성 계약과 관련 소스를 확인한 뒤 새 커밋으로 재검증하세요.",
        },
      };
    }),
  };
}
export const pythonDemo: ValidationProject = {
  id: "python-uv-demo",
  name: "주문 처리 서비스",
  description: "GitHub 소스의 의존성 변경과 HTTP·외부 호출 비교",
  target: {
    id: "python-uv",
    name: "Python / uv",
    adapter: "python-uv",
    source: purchaseDemo.repository,
  },
  repository: {
    url: purchaseDemo.repository,
    ref: purchaseDemo.ref,
    inspection: "unchecked",
  },
  update: {
    ecosystem: "python-uv",
    packageName: "pydantic",
    declared: "==1.10.24",
    locked: "1.10.24",
    targetVersion: "2.12.5",
  },
  executionProfile: {
    dockerfile: "Dockerfile.ossguard",
    port: 8000,
    healthPath: "/health",
    variables: [
      { name: "SHIPPING_BASE_URL", kind: "mock", value: "", required: true },
    ],
  },
  baseline: { label: "pydantic 1.10.24", artifact: "uv.lock · 원본" },
  candidate: { label: "pydantic 2.12.5", artifact: "uv.lock · 변경 후" },
  rule: purchaseDemo.rule,
  steps: [
    { key: "request", label: "업무 요청" },
    { key: "shipping", label: "배송 API" },
    { key: "response", label: "HTTP 응답" },
  ],
  cases: cases.map((c, index) => ({
    id: c.id,
    name: c.name,
    input: c.input,
    request: {
      method: "POST",
      path: "/orders",
      body: JSON.stringify(
        {
          payment: index === 2 ? "failed" : "paid",
          stock: [10, 2, 10, 1][index],
          quantity: 2,
        },
        null,
        2,
      ),
    },
    assertions: [
      { key: "response", label: "HTTP 상태", expected: 200 },
      { key: "stock", label: "응답의 남은 재고", expected: c.stock },
      { key: "delivery", label: "배송 요청", expected: c.delivery, unit: "회" },
    ],
  })),
  samples: ["regression", "passed", "build-error", "observation-error"].map(
    run,
  ),
  defaultSample: "regression",
  recordedInputs: Object.fromEntries(cases.map((c) => [c.id, c.input])),
  connection: {
    entry: "POST /orders",
    dependencies: [{ name: "배송 API", endpoint: "WireMock · POST /shipping" }],
  },
};
pythonDemo.recordingContext = executionContext(pythonDemo);
pythonDemo.recordedRequests = Object.fromEntries(
  pythonDemo.cases.map((c) => [c.id, JSON.stringify(c.request)]),
);
