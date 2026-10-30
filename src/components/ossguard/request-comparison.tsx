import { useState, type CSSProperties } from "react";
import { CheckCircle2, CircleDashed, MinusCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import styles from "./request-comparison.module.css";
import { traceDifferences } from "./trace-diff";
import type {
  ValidationProject,
  CaseComparison,
  Observation,
  StepState,
} from "./model";
const stateLabel: Record<StepState, string> = {
  completed: "관측됨",
  missing: "호출 없음",
  skipped: "호출 대상 아님",
  unknown: "미확인",
};
export function RequestComparison({
  project,
  comparison,
}: {
  project: ValidationProject;
  comparison?: CaseComparison;
}) {
  const steps = [...project.steps];
  for (const event of [
    ...(comparison?.baseline.events ?? []),
    ...(comparison?.candidate.events ?? []),
  ])
    if (!steps.some((s) => s.key === event.stepKey))
      steps.push({ key: event.stepKey, label: event.operation });
  const diffs = traceDifferences({ ...project, steps }, comparison);
  const [selected, setSelected] = useState(
    diffs[0]?.key ??
      steps.find(
        (s) =>
          comparison?.candidate.steps[s.key] === "unknown" ||
          comparison?.baseline.steps[s.key] === "unknown",
      )?.key ??
      steps[0]?.key,
  );
  const chosen = steps.find((s) => s.key === selected) ?? steps[0];
  const first = steps.find((s) => s.key === diffs[0]?.key);
  const width = Math.max(600, steps.length * 184 + 88);
  const getState = (
    observation: Observation | undefined,
    key: string,
  ): StepState =>
    observation?.steps[key] ??
    (observation?.events?.some((e) => e.stepKey === key)
      ? "completed"
      : "unknown");
  return (
    <Card
      variant="panel"
      className="min-w-0 overflow-hidden [container-type:inline-size]"
    >
      <CardHeader className="px-5 py-4 md:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>요청·외부 호출 비교</CardTitle>
          <Badge variant={first ? "error" : "outline"}>
            {first
              ? `첫 차이 · ${first.label}`
              : comparison?.outcome === "unverified"
                ? "관측 확인 필요"
                : "관측한 범위 동일"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-5 md:px-5 md:pb-5">
        <div
          className={cn(styles.compact, "mb-4 gap-4")}
          aria-label="모바일 A/B 호출 비교"
        >
          <div className="grid grid-cols-2 gap-3 type-label-sm text-interface-secondary">
            <span>기준 A</span>
            <span>후보 B</span>
          </div>
          {steps.map((step, index) => (
            <div key={step.key} className="min-w-0">
              <p className="mb-2 type-body-xs text-interface-muted">
                {String(index + 1).padStart(2, "0")} · {step.label}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "기준 A", observation: comparison?.baseline },
                  { label: "후보 B", observation: comparison?.candidate },
                ].map(({ label, observation }) => {
                  const state = getState(observation, step.key);
                  const event = observation?.events?.find(
                    (e) => e.stepKey === step.key,
                  );
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
                      key={label}
                      className={cn(
                        "min-w-0 rounded-md border",
                        state === "missing"
                          ? "border-signal-danger/50 bg-signal-danger/5"
                          : "border-boundary-default bg-surface-canvas",
                        chosen?.key === step.key &&
                          "ring-1 ring-boundary-strong",
                      )}
                    >
                      <Button
                        variant="ghost"
                        className="h-auto w-full whitespace-normal"
                        aria-label={`${label} · ${step.label}`}
                        aria-pressed={chosen?.key === step.key}
                        onClick={() => setSelected(step.key)}
                      >
                        <span className="flex min-w-0 flex-col items-start gap-2 py-2">
                          <span className="flex items-center gap-2">
                            <Icon
                              className={cn(
                                state === "completed"
                                  ? "text-signal-success"
                                  : state === "missing"
                                    ? "text-signal-danger"
                                    : "text-interface-muted",
                              )}
                            />
                            <span className="type-label-sm">
                              {stateLabel[state]}
                            </span>
                          </span>
                          <span className="break-all text-left type-code-sm text-interface-secondary">
                            {event?.data.status !== undefined
                              ? `HTTP ${event.data.status}`
                              : (event?.operation ?? "—")}
                          </span>
                        </span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p
          className={cn(styles.wide, "mb-3 type-body-xs text-interface-muted")}
        >
          호출을 선택하면 같은 지점의 A/B 증거가 함께 바뀝니다.
        </p>
        <div
          className={cn(styles.wide, "overflow-x-auto pb-2")}
          tabIndex={0}
          aria-label="A/B 호출 경로 비교"
        >
          <div
            className="relative h-49 w-[var(--diagram-width)]"
            style={{ "--diagram-width": `${width}px` } as CSSProperties}
          >
            <svg
              width={width}
              height={196}
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              {[comparison?.baseline, comparison?.candidate].map(
                (observation, lane) => {
                  const events = [...(observation?.events ?? [])].sort(
                    (a, b) => a.sequence - b.sequence,
                  );
                  return events.slice(1).map((event, i) => {
                    const from = steps.findIndex(
                        (s) => s.key === events[i].stepKey,
                      ),
                      to = steps.findIndex((s) => s.key === event.stepKey);
                    const y = lane * 96 + 32,
                      start = 88 + from * 184 + 144,
                      end = 88 + to * 184;
                    const uncertain = steps
                      .slice(Math.min(from, to) + 1, Math.max(from, to))
                      .some((s) => getState(observation, s.key) === "unknown");
                    const changed = !uncertain && to !== from + 1;
                    return (
                      <g
                        key={`${lane}-${i}`}
                        className={
                          changed
                            ? "text-signal-danger"
                            : "text-interface-muted"
                        }
                      >
                        <path
                          data-trace-edge={`${lane}:${events[i].stepKey}:${event.stepKey}`}
                          d={
                            changed
                              ? `M ${start} ${y} C ${start + 25} ${y} ${start + 15} ${y + 42} ${start + 35} ${y + 42} H ${end - 35} C ${end - 15} ${y + 42} ${end - 25} ${y} ${end} ${y}`
                              : `M ${start} ${y} H ${end}`
                          }
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeDasharray={uncertain ? "3 4" : undefined}
                        />
                        <path
                          d={`M ${end - 5} ${y - 4} l 4 4 l -4 4`}
                          fill="none"
                          stroke="currentColor"
                        />
                      </g>
                    );
                  });
                },
              )}
            </svg>
            {[
              { label: "기준 A", observation: comparison?.baseline },
              { label: "후보 B", observation: comparison?.candidate },
            ].map(({ label, observation }, lane) => (
              <div key={label}>
                <div
                  className="absolute left-0 top-[var(--lane-top)] flex h-16 items-center type-label-md"
                  style={{ "--lane-top": `${lane * 96}px` } as CSSProperties}
                >
                  {label}
                </div>
                {steps.map((step, index) => {
                  const state = getState(observation, step.key),
                    event = observation?.events?.find(
                      (e) => e.stepKey === step.key,
                    );
                  const changed =
                    lane === 1 && diffs.some((d) => d.key === step.key);
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
                      key={step.key}
                      className={cn(
                        "absolute left-[var(--node-left)] top-[var(--lane-top)] h-16 w-36 rounded-lg border",
                        changed
                          ? "border-signal-danger/50 bg-signal-danger/5"
                          : "border-boundary-default bg-surface-canvas",
                        chosen?.key === step.key &&
                          "ring-1 ring-boundary-strong",
                        state !== "completed" && "border-dashed",
                      )}
                      style={
                        {
                          "--node-left": `${88 + index * 184}px`,
                          "--lane-top": `${lane * 96}px`,
                        } as CSSProperties
                      }
                    >
                      <Button
                        variant="ghost"
                        className="h-full w-full justify-start"
                        onClick={() => setSelected(step.key)}
                        aria-pressed={chosen?.key === step.key}
                        aria-label={`${label} · ${step.label} · ${stateLabel[state]}`}
                      >
                        <span className="flex min-w-0 flex-1 flex-col items-start gap-2">
                          <span className="flex max-w-full items-center gap-2">
                            <Icon
                              className={cn(
                                state === "completed"
                                  ? "text-signal-success"
                                  : state === "missing"
                                    ? "text-signal-danger"
                                    : "text-interface-muted",
                              )}
                            />
                            <span className="truncate">{step.label}</span>
                          </span>
                          <span className="max-w-full truncate type-code-sm text-interface-muted">
                            {event?.data.status !== undefined
                              ? `HTTP ${event.data.status}`
                              : event
                                ? event.operation
                                : stateLabel[state]}
                          </span>
                        </span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {chosen && (
          <section
            aria-label="선택 호출의 A/B 증거"
            className="flex flex-col gap-4"
          >
            <Separator />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="type-heading-sm">{chosen.label}</h3>
              <span className="type-body-sm text-interface-secondary">
                {diffs.find((d) => d.key === chosen.key)?.reason ??
                  "선택한 관측 기록"}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "기준 A", observation: comparison?.baseline },
                { label: "후보 B", observation: comparison?.candidate },
              ].map(({ label, observation }) => {
                const events = observation?.events?.filter(
                  (e) => e.stepKey === chosen.key,
                );
                const state = getState(observation, chosen.key);
                return (
                  <div
                    key={label}
                    className="min-w-0 rounded-lg bg-surface-canvas p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="type-label-md">{label}</span>
                      <Badge
                        variant={
                          state === "missing"
                            ? "error"
                            : state === "unknown"
                              ? "muted"
                              : "outline"
                        }
                      >
                        {state === "unknown" || !events
                          ? "미확인"
                          : `${events.length}건`}
                      </Badge>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words type-code-sm text-interface-secondary">
                      {state === "unknown" || !events
                        ? "수집된 기록이 없습니다. 0건으로 판정하지 않습니다."
                        : events.length
                          ? events
                              .map(
                                (e) =>
                                  `#${e.sequence} ${e.operation}\n${JSON.stringify(e.data, null, 2)}`,
                              )
                              .join("\n")
                          : state === "skipped"
                            ? "이 입력에서는 호출하지 않는 조건입니다."
                            : "수집한 저널에서 예상 호출이 관측되지 않았습니다."}
                    </pre>
                  </div>
                );
              })}
            </div>
            <p className="type-body-xs text-interface-muted">
              연결선은 수집된 호출 순서입니다. 내부 함수·SQL 호출과 처리 시간은
              표시하지 않습니다.
            </p>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
