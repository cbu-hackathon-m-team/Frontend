import type { CaseComparison, ValidationProject } from "./model";
export function traceDifferences(
  project: ValidationProject,
  comparison?: CaseComparison,
) {
  if (!comparison) return [];
  const a = {
    ...comparison.baseline,
    events: comparison.baseline.events
      ? [...comparison.baseline.events].sort((x, y) => x.sequence - y.sequence)
      : undefined,
  };
  const b = {
    ...comparison.candidate,
    events: comparison.candidate.events
      ? [...comparison.candidate.events].sort((x, y) => x.sequence - y.sequence)
      : undefined,
  };
  const common = new Set(
    (a.events ?? [])
      .map((e) => e.stepKey)
      .filter((key) => b.events?.some((e) => e.stepKey === key)),
  );
  const aOrder = (a.events ?? [])
    .filter((e) => common.has(e.stepKey))
    .map((e) => e.stepKey);
  const bOrder = (b.events ?? [])
    .filter((e) => common.has(e.stepKey))
    .map((e) => e.stepKey);
  return project.steps.flatMap((step) => {
    const before =
      a.steps[step.key] ??
      (a.events?.some((e) => e.stepKey === step.key) ? "completed" : "unknown");
    const after =
      b.steps[step.key] ??
      (b.events?.some((e) => e.stepKey === step.key) ? "completed" : "unknown");
    if (before === "unknown" || after === "unknown") return [];
    if (before !== after)
      return [
        {
          key: step.key,
          reason:
            after === "missing"
              ? "호출 누락"
              : before === "skipped"
                ? "추가 실행"
                : "실행 상태 변경",
        },
      ];
    const av = (a.events ?? []).filter((e) => e.stepKey === step.key);
    const bv = (b.events ?? []).filter((e) => e.stepKey === step.key);
    if (a.events && b.events && av.length !== bv.length)
      return [{ key: step.key, reason: "호출 횟수 변경" }];
    if (av.some((event, i) => bv[i] && event.operation !== bv[i].operation))
      return [{ key: step.key, reason: "호출 경로 변경" }];
    if (
      av.some(
        (event, i) =>
          JSON.stringify(event.data) !== JSON.stringify(bv[i]?.data),
      )
    )
      return [{ key: step.key, reason: "호출 데이터 변경" }];
    if (
      common.has(step.key) &&
      aOrder.indexOf(step.key) !== bOrder.indexOf(step.key)
    )
      return [{ key: step.key, reason: "호출 순서 변경" }];
    return [];
  });
}
