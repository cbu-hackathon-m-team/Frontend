import type {
  Observation,
  SampleRun,
  ValidationCase,
  ValidationProject,
} from "./model";
import { executionContext } from "./model";

const unknown: Observation = {
  status: "unverified",
  values: {},
  steps: {},
  events: [],
  evidence: "이 입력·환경에 해당하는 샘플 실행 기록이 없습니다.",
};
// Compares captured fixture observations only. It never executes arbitrary input
// or claims that a changed input has been run against an application.
export function compareRecordedSample(
  project: ValidationProject,
  sample: SampleRun,
  cases: ValidationCase[],
): SampleRun {
  const contextMatches =
    !project.recordingContext ||
    project.recordingContext === executionContext(project);
  const comparisons = cases.map((c) => {
    const original = project.recordedInputs
      ? project.recordedInputs[c.id] === c.input
      : project.cases.some(
          (item) => item.id === c.id && item.input === c.input,
        );
    const requestMatches = c.request
      ? project.recordedRequests?.[c.id] === JSON.stringify(c.request)
      : !project.recordedRequests?.[c.id];
    const recorded =
      contextMatches && original && requestMatches
        ? sample.cases.find((item) => item.caseId === c.id)
        : undefined;
    function assess(observation: Observation): Observation {
      const missing =
        !c.assertions.length ||
        observation.status === "unverified" ||
        c.assertions.some((a) => !Object.hasOwn(observation.values, a.key));
      return {
        ...observation,
        status: missing
          ? "unverified"
          : c.assertions.some((a) => observation.values[a.key] !== a.expected)
            ? "failed"
            : "passed",
      };
    }
    const baseline = assess(recorded?.baseline ?? unknown);
    const candidate = assess(recorded?.candidate ?? unknown);
    const outcome =
      baseline.status === "unverified" || candidate.status === "unverified"
        ? "unverified"
        : baseline.status === "failed"
          ? "baseline-failed"
          : candidate.status === "failed"
            ? "regression"
            : "passed";
    return {
      caseId: c.id,
      baseline,
      candidate,
      outcome,
      analysis: recorded
        ? {
            fact: c.assertions
              .map(
                (a) =>
                  `${a.label}: 기대 ${a.expected} / A ${baseline.values[a.key] ?? "미수집"} / B ${candidate.values[a.key] ?? "미수집"}`,
              )
              .join(" · "),
            hypothesis:
              outcome === "regression"
                ? recorded.analysis.hypothesis
                : outcome === "baseline-failed"
                  ? "기준 A부터 기대 조건을 만족하지 않습니다. 새 회귀로 단정할 수 없습니다."
                  : outcome === "unverified"
                    ? "판정에 필요한 관측값이 부족합니다."
                    : "확정한 기준에서 위반이 없습니다.",
            next: recorded.analysis.next,
          }
        : {
            fact: "이 입력·환경의 실행 기록이 없습니다.",
            hypothesis: "원인을 분석할 수 없습니다.",
            next: "실제 실행기를 연결한 뒤 이 입력을 실행하세요.",
          },
    } satisfies SampleRun["cases"][number];
  });
  const outcome = comparisons.some((c) => c.outcome === "baseline-failed")
    ? "baseline-failed"
    : comparisons.some((c) => c.outcome === "regression")
      ? "regression"
      : !comparisons.length ||
          comparisons.some((c) => c.outcome === "unverified")
        ? "unverified"
        : "passed";
  return {
    ...sample,
    change: contextMatches ? sample.change : "샘플과 다른 실행 설정",
    diff: contextMatches ? sample.diff : "변경된 환경의 실행 기록이 없습니다.",
    cases: comparisons,
    outcome,
    title:
      outcome === "regression"
        ? "기존 A는 통과했지만 후보 B에서 업무 동작이 달라졌습니다"
        : outcome === "baseline-failed"
          ? "기존 A부터 테스트 기준을 확인해야 합니다"
          : outcome === "unverified"
            ? "실행 기록이 없는 테스트가 있습니다"
            : "확정한 테스트 기준을 모두 통과했습니다",
    summary:
      "저장된 샘플 실행 기록을 사용자가 확정한 기대값과 비교한 결과입니다.",
  };
}
