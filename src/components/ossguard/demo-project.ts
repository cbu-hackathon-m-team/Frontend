import { pythonDemo } from "./python-demo";
import { cases, scenarios, type Scenario } from "./sample";
import { readProjects } from "@/components/dashboard/projects";
import { executionContext } from "./model";
import type {
  Observation,
  SampleRun,
  StepState,
  ValidationProject,
} from "./model";

// All Node-RED/order-domain fixtures stay here, outside the shared views.
const steps = [
  { key: "order", label: "주문 접수" },
  { key: "payment", label: "결제 확인" },
  { key: "stock", label: "재고 차감" },
  { key: "shipping", label: "배송 요청" },
  { key: "response", label: "응답 반환" },
];
function observation(
  scenario: Scenario,
  index: number,
  candidate: boolean,
): Observation {
  const c = cases[index];
  const unknown = candidate && scenario === "error";
  const missing =
    index < 2 &&
    (scenario === "baseline" || (candidate && scenario === "defect"));
  const values: Observation["values"] = unknown
    ? {}
    : { response: 200, stock: c.stock, delivery: missing ? 0 : c.delivery };
  const events: Observation["events"] = unknown
    ? []
    : [
        {
          stepKey: "order",
          operation: "POST /orders",
          data: {
            payment: index === 2 ? "failed" : "paid",
            quantity: 2,
            stock: [10, 2, 10, 1][index],
          },
        },
        {
          stepKey: "payment",
          operation: "POST mock://company/payment",
          data: { confirmed: index !== 2 },
        },
        ...(index < 2
          ? [
              {
                stepKey: "stock",
                operation: "POST mock://company/stock",
                data: { remaining: c.stock },
              },
              ...(!missing
                ? [
                    {
                      stepKey: "shipping",
                      operation: "POST mock://company/shipping",
                      data: { requests: 1 },
                    },
                  ]
                : []),
            ]
          : []),
        {
          stepKey: "response",
          operation: "HTTP response",
          data: { status: 200 },
        },
      ].map((event, i) => ({
        ...event,
        data: Object.fromEntries(
          Object.entries(event.data).filter(([, value]) => value !== undefined),
        ),
        sequence: i + 1,
      }));
  return {
    status: unknown ? "unverified" : missing ? "failed" : "passed",
    values,
    steps: Object.fromEntries(
      steps.map((s, i) => [
        s.key,
        (unknown
          ? "unknown"
          : index > 1 && i > 1 && s.key !== "response"
            ? "skipped"
            : missing && s.key === "shipping"
              ? "missing"
              : "completed") as StepState,
      ]),
    ),
    events,
    evidence: JSON.stringify(
      {
        source: "demo-fixture",
        case_id: c.id,
        environment: candidate ? "candidate" : "baseline",
        values,
        events,
        ...(unknown ? { error: "startup_timeout" } : {}),
      },
      null,
      2,
    ),
  };
}
function sample(id: Scenario): SampleRun {
  return {
    id,
    label: scenarios[id],
    title: {
      defect: "배송 요청 누락",
      fixed: "업무 테스트 전체 통과",
      baseline: "기준 환경 확인 필요",
      error: "후보 환경 실행 실패",
    }[id],
    summary: {
      defect:
        "정상 주문과 재고 경계값에서 배송 요청이 1회에서 0회로 줄었습니다.",
      fixed: "확정한 테스트 범위에서 기존·후보 결과가 일치합니다.",
      baseline:
        "기준 환경도 규칙을 위반했습니다. 업데이트의 회귀로 단정할 수 없습니다.",
      error: "후보 시작 시간 초과. 후보의 테스트 결과는 미검증입니다.",
    }[id],
    outcome: {
      defect: "regression",
      fixed: "passed",
      baseline: "baseline-failed",
      error: "unverified",
    }[id] as SampleRun["outcome"],
    change:
      id === "fixed"
        ? "배송 연결 복구"
        : id === "error"
          ? "기동 실패 샘플"
          : "배송 연결 누락",
    diff:
      id === "fixed"
        ? "+ stock.updated → shipping.requested"
        : id === "error"
          ? "candidate: startup_timeout\n업무 단계 수집 전 실행 중단"
          : "- stock.updated → shipping.requested\n+ stock.updated → response",
    cases: cases.map((c, index) => {
      const baseline = observation(id, index, false);
      const candidate = observation(id, index, true);
      return {
        caseId: c.id,
        baseline,
        candidate,
        outcome:
          candidate.status === "unverified"
            ? "unverified"
            : baseline.status === "failed"
              ? "baseline-failed"
              : candidate.status === "failed"
                ? "regression"
                : "passed",
        analysis: {
          fact:
            candidate.status === "unverified"
              ? "후보 환경의 처리 기록이 없습니다."
              : `후보 배송 요청 ${candidate.values.delivery}회 / 기대값 ${c.delivery}회`,
          hypothesis:
            candidate.status === "unverified"
              ? "기동 로그 확인이 필요합니다."
              : candidate.status === "passed"
                ? "이 테스트에서 확인된 규칙 위반이 없습니다."
                : "재고 차감 이후 배송 단계로 이어지는 연결 변경이 원인일 수 있습니다.",
          next:
            baseline.status === "failed"
              ? "기준 환경의 설정과 업무 규칙을 먼저 확인하세요."
              : "호출 기록과 흐름 변경을 확인하고 수정한 후보로 재검증하세요.",
        },
      };
    }),
  };
}
export const demoProject: ValidationProject = {
  id: "order-service",
  name: "주문 처리 서비스",
  description: "결제·재고·배송 동작의 업데이트 전후 비교",
  target: {
    id: "node-red",
    name: "Node-RED",
    source: "https://github.com/node-red/node-red",
    adapter: "node-red",
  },
  baseline: { label: "기존 버전 A", artifact: "orders-baseline.json" },
  candidate: { label: "새 버전 B", artifact: "orders-candidate.json" },
  rule: "결제가 완료되고 재고가 충분하면 주문 수량만큼 차감하고 배송을 1회 요청한다. 결제 실패 또는 재고 부족이면 차감·배송을 하지 않는다.",
  steps,
  cases: cases.map((c) => ({
    id: c.id,
    name: c.name,
    input: c.input,
    assertions: [
      {
        key: "response",
        label: "HTTP 응답",
        expected: 200,
        stepKey: "response",
      },
      { key: "stock", label: "남은 재고", expected: c.stock, stepKey: "stock" },
      {
        key: "delivery",
        stepKey: "shipping",
        label: "배송 요청 횟수",
        expected: c.delivery,
        unit: "회",
        editable: true,
      },
    ],
  })),
  samples: (["defect", "fixed", "baseline", "error"] as Scenario[]).map(sample),
  defaultSample: "defect",
  recordedInputs: Object.fromEntries(cases.map((c) => [c.id, c.input])),
  connection: {
    entry: "POST /orders",
    dependencies: [
      { name: "결제 API", endpoint: "mock://company/payment" },
      { name: "재고 API", endpoint: "mock://company/stock" },
      { name: "배송 API", endpoint: "mock://company/shipping" },
    ],
  },
};
demoProject.recordingContext = executionContext(demoProject);
export const validationProjects = [pythonDemo];
export function selectedProject(search: string) {
  const params = new URLSearchParams(search);
  const id = params.get("project");
  // Preserve previously shared result URLs without making the catalog tool-specific.
  const builtIn =
    validationProjects.find((p) => p.id === id) ??
    (id === demoProject.id ? demoProject : undefined) ??
    (!id && params.has("tab") ? demoProject : undefined);
  if (builtIn) return builtIn;
  try {
    const draft = readProjects().find((p) => p.id === id);
    if (draft)
      return {
        id: draft.id,
        name: draft.name,
        description: draft.description,
        rule: "",
        repository: { url: "", ref: "main", inspection: "unchecked" },
        update: {
          ecosystem: "python-uv",
          packageName: "",
          declared: "",
          locked: "",
          targetVersion: "",
        },
        executionProfile: {
          dockerfile: "Dockerfile.ossguard",
          port: 8000,
          healthPath: "/health",
          variables: [],
        },
        recordedInputs: {},
        recordingContext: undefined,
        cases: [],
        steps: [],
        samples: [],
        defaultSample: "",
        target: {
          id: "custom",
          name: "검증 대상 미설정",
          adapter: "",
          source: "",
        },
        baseline: { label: "", artifact: "" },
        candidate: { label: "", artifact: "" },
        connection: { entry: "", dependencies: [] },
      } satisfies ValidationProject;
  } catch {
    /* The project catalog displays the storage error without overwriting it. */
  }
  return undefined;
}
