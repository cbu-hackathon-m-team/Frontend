import { useState } from "react";
import { CheckCircle2, CircleDashed, XCircle, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { traceDifferences } from "./trace-diff";
import type {
  CaseComparison,
  Observation,
  StepState,
  ValidationProject,
} from "./model";

const labels: Record<StepState, string> = {
  completed: "완료",
  missing: "호출 없음",
  skipped: "실행 안 함",
  unknown: "미확인",
};
function StepNode({
  step,
  observation,
  selected,
  changed,
  onClick,
}: {
  step: ValidationProject["steps"][number];
  observation?: Observation;
  selected: boolean;
  changed: boolean;
  onClick: () => void;
}) {
  const event = observation?.events?.find((e) => e.stepKey === step.key);
  const state =
    observation?.steps[step.key] ?? (event ? "completed" : "unknown");
  const Icon =
    state === "completed"
      ? CheckCircle2
      : state === "missing"
        ? XCircle
        : state === "skipped"
          ? MinusCircle
          : CircleDashed;
  return (
    <div
      className={cn(
        "h-12 min-w-0 rounded-lg border",
        changed
          ? "border-signal-danger/40 bg-signal-danger/5"
          : "border-boundary-subtle bg-surface-canvas",
        selected && "ring-1 ring-boundary-strong",
      )}
    >
      <Button
        variant="ghost"
        size="lg"
        className="h-full w-full justify-start"
        onClick={onClick}
        aria-pressed={selected}
        aria-label={`${step.label} · ${labels[state]}`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <Icon
            className={cn(
              state === "completed"
                ? "text-signal-success"
                : state === "missing"
                  ? "text-signal-danger"
                  : "text-interface-muted",
            )}
          />
          <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <span>{step.label}</span>
            <span className="max-w-full truncate type-code-sm text-interface-muted">
              {event
                ? `${event.operation}${event.data.status !== undefined ? ` · ${event.data.status}` : ""}`
                : "—"}
            </span>
          </span>
          <span
            className={cn(
              "type-body-xs",
              state === "missing"
                ? "text-signal-danger"
                : "text-interface-secondary",
            )}
          >
            {event ? `#${event.sequence}` : labels[state]}
          </span>
        </span>
      </Button>
    </div>
  );
}
export function GuardTrace({
  project,
  comparison,
}: {
  project: ValidationProject;
  comparison?: CaseComparison;
}) {
  const steps = [...project.steps];
  for (const e of [
    ...(comparison?.baseline.events ?? []),
    ...(comparison?.candidate.events ?? []),
  ]) {
    if (!steps.some((s) => s.key === e.stepKey))
      steps.push({ key: e.stepKey, label: e.operation });
  }
  const diffs = traceDifferences({ ...project, steps }, comparison);
  const [chosen, setChosen] = useState(diffs[0]?.key ?? steps[0]?.key);
  const step = steps.find((s) => s.key === chosen) ?? steps[0];
  const first = steps.find((s) => s.key === diffs[0]?.key);
  return (
    <Card variant="panel">
      <CardHeader variant="divided" className="px-5 py-3 md:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>실행 흐름 비교</CardTitle>
          <Badge variant={first ? "error" : "outline"}>
            {first
              ? `첫 차이 · ${first.label}`
              : !comparison ||
                  steps.some(
                    (s) =>
                      !comparison.baseline.steps[s.key] ||
                      !comparison.candidate.steps[s.key] ||
                      comparison.baseline.steps[s.key] === "unknown" ||
                      comparison.candidate.steps[s.key] === "unknown",
                  )
                ? "수집 범위 확인 필요"
                : "관측한 흐름 동일"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-5 pt-3 md:px-5 md:pb-5">
        <div className="overflow-x-auto">
          <div className="min-w-96">
            <div className="mb-2 grid grid-cols-2 gap-5 type-label-md">
              <div>A · {project.baseline.label}</div>
              <div>B · {project.candidate.label}</div>
            </div>
            <div
              aria-label="기준과 후보 실행 흐름"
              className="grid grid-cols-2 gap-5"
            >
              {[comparison?.baseline, comparison?.candidate].map(
                (observation, lane) => {
                  const events = [...(observation?.events ?? [])].sort(
                    (a, b) => a.sequence - b.sequence,
                  );
                  const pairs = events
                    .slice(1)
                    .map((event, i) => ({
                      from: steps.findIndex((s) => s.key === events[i].stepKey),
                      to: steps.findIndex((s) => s.key === event.stepKey),
                      fromKey: events[i].stepKey,
                      toKey: event.stepKey,
                    }))
                    .filter((p) => p.from >= 0 && p.to >= 0);
                  return (
                    <div className="relative min-w-0" key={lane}>
                      <svg
                        className="pointer-events-none absolute inset-0 size-full overflow-visible"
                        viewBox={`0 0 400 ${steps.length * 60 - 12}`}
                        preserveAspectRatio="none"
                        aria-label={
                          lane === 0 ? "기준 A 수집 순서" : "후보 B 수집 순서"
                        }
                        role="img"
                      >
                        <title>
                          수집 순서:{" "}
                          {events
                            .map(
                              (e) =>
                                steps.find((s) => s.key === e.stepKey)?.label,
                            )
                            .join(" → ") || "기록 없음"}
                        </title>
                        {pairs.map((p, i) => {
                          const adjacent = p.to === p.from + 1;
                          const d = adjacent
                            ? `M 175 ${p.from * 60 + 48} V ${p.to * 60}`
                            : `M 350 ${p.from * 60 + 24} H 378 Q 390 ${p.from * 60 + 24} 390 ${p.from * 60 + 32} V ${p.to * 60 + 16} Q 390 ${p.to * 60 + 24} 378 ${p.to * 60 + 24} H 350`;
                          const other =
                            lane === 0
                              ? comparison?.candidate.events
                              : comparison?.baseline.events;
                          const changed = !(other ?? []).some(
                            (e, n) =>
                              e.stepKey === p.fromKey &&
                              other?.[n + 1]?.stepKey === p.toKey,
                          );
                          return (
                            <g
                              key={i}
                              className={
                                changed
                                  ? "text-signal-danger"
                                  : "text-interface-muted"
                              }
                            >
                              <path
                                data-trace-edge={`${p.fromKey}:${p.toKey}`}
                                d={d}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                              />
                              <path
                                d={
                                  adjacent
                                    ? `M 171 ${p.to * 60 - 5} l 4 4 l 4 -4`
                                    : `M 355 ${p.to * 60 + 24} l -4 4 l 4 4`
                                }
                                fill="none"
                                stroke="currentColor"
                                vectorEffect="non-scaling-stroke"
                              />
                            </g>
                          );
                        })}
                      </svg>
                      <ol
                        className="relative flex flex-col gap-3 pr-10"
                        aria-label={lane === 0 ? "기준 A 단계" : "후보 B 단계"}
                      >
                        {steps.map((s) => (
                          <li key={s.key}>
                            <StepNode
                              step={s}
                              observation={observation}
                              selected={step?.key === s.key}
                              changed={
                                lane === 1 && diffs.some((d) => d.key === s.key)
                              }
                              onClick={() => setChosen(s.key)}
                            />
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
        {!steps.length && (
          <p className="type-body-sm text-interface-secondary">
            수집된 업무 단계가 없습니다. 아래 결과값과 실행 기록을 확인하세요.
          </p>
        )}
        {step && (
          <section className="mt-5" aria-label="선택 단계 증거">
            <Separator className="mb-4" />
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="type-label-lg">{step.label}</h3>
              <span className="type-body-sm text-interface-secondary">
                {diffs.find((d) => d.key === step.key)?.reason ??
                  "단계별 호출 기록"}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "기존 A", observation: comparison?.baseline },
                { label: "후보 B", observation: comparison?.candidate },
              ].map(({ label, observation }) => {
                const events = observation?.events?.filter(
                  (e) => e.stepKey === step.key,
                );
                const state = observation?.steps[step.key] ?? "unknown";
                return (
                  <div
                    key={label}
                    className="min-w-0 rounded-md bg-surface-canvas p-3"
                  >
                    <div className="mb-2 flex justify-between gap-2 type-label-sm">
                      <span>{label}</span>
                      <span>
                        {state === "unknown" || !events
                          ? "수집 정보 없음"
                          : `기록 ${events.length}건`}
                      </span>
                    </div>
                    <pre className="overflow-x-auto type-code-sm">
                      {state === "unknown" || !events
                        ? "실행 여부를 확인할 수 없습니다."
                        : !events.length
                          ? state === "skipped"
                            ? "이 입력에서는 호출하지 않는 단계입니다."
                            : "기록 없음 · 예상 호출이 관측되지 않았습니다."
                          : events
                              .map(
                                (e) =>
                                  `#${e.sequence} ${e.operation}\n${JSON.stringify(e.data, null, 2)}`,
                              )
                              .join("\n\n")}
                    </pre>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
