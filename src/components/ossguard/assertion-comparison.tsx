import { Check, Equal, Minus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import styles from "./assertion-comparison.module.css";
import {
  displayValue,
  assertionPass,
  type CaseComparison,
  type ValidationCase,
  type ValidationProject,
} from "./model";

export function AssertionComparison({
  project,
  test,
  comparison,
}: {
  project: ValidationProject;
  test: ValidationCase;
  comparison?: CaseComparison;
}) {
  function priority(assertion: ValidationCase["assertions"][number]) {
    if (!comparison) return 0;
    const before = comparison.baseline.values[assertion.key];
    const after = comparison.candidate.values[assertion.key];
    if (before === undefined || after === undefined) return 2;
    if (before !== after) return 3;
    return before !== assertion.expected || after !== assertion.expected
      ? 1
      : 0;
  }
  const assertions = [...test.assertions].sort(
    (a, b) => priority(b) - priority(a),
  );
  return (
    <section
      aria-label="기대값과 A/B 관측값 비교"
      className={cn(
        styles.comparison,
        "min-w-0 overflow-hidden rounded-lg border border-boundary-default bg-surface-panel",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-boundary-default bg-surface-canvas px-4 py-3">
        <span className="type-label-md">업무 결과 비교</span>
        <div className="flex flex-wrap gap-x-3 gap-y-1 type-code-sm text-interface-secondary">
          {[
            {
              label: "기준 A",
              version: project.update?.locked || project.baseline.label,
            },
            {
              label: "후보 B",
              version: project.update?.targetVersion || project.candidate.label,
            },
          ].map(({ label, version }) => (
            <div key={label} className="flex min-w-0 items-center gap-2">
              <span>{label}</span>
              <span className="break-all type-code-sm text-interface-secondary">
                {version}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.metrics}>
        {assertions.map((assertion) => {
          const before = comparison?.baseline.values[assertion.key];
          const after = comparison?.candidate.values[assertion.key];
          const changed =
            before !== undefined && after !== undefined && before !== after;
          const unknown = before === undefined || after === undefined;
          const violation =
            !unknown &&
            (!assertionPass(
              assertion,
              before,
              comparison?.baseline.checks?.[assertion.key],
            ) ||
              !assertionPass(
                assertion,
                after,
                comparison?.candidate.checks?.[assertion.key],
              ));
          return (
            <div
              key={assertion.key}
              className={cn(styles.metric, violation && "bg-signal-danger/5")}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
                <h3 className="type-label-md">{assertion.label}</h3>
                <Badge
                  variant={unknown ? "muted" : violation ? "error" : "outline"}
                >
                  {unknown ? (
                    <Minus className="size-3" />
                  ) : changed ? (
                    <X className="size-3" />
                  ) : (
                    <Equal className="size-3" />
                  )}
                  {unknown
                    ? "미검증"
                    : changed
                      ? "결과 변경"
                      : violation
                        ? "기대값 위반"
                        : "동일"}
                </Badge>
              </div>
              <div className="grid grid-cols-2">
                {[before, after].map((value, lane) => {
                  const known = value !== undefined;
                  const passes =
                    known &&
                    assertionPass(
                      assertion,
                      value,
                      (lane === 0
                        ? comparison?.baseline
                        : comparison?.candidate
                      )?.checks?.[assertion.key],
                    );
                  const Icon = !known ? Minus : passes ? Check : X;
                  return (
                    <div
                      key={lane}
                      className="flex min-w-0 flex-col gap-1 px-4 pb-4 pt-2"
                    >
                      <span className="type-body-xs text-interface-muted">
                        {lane === 0 ? "기준 A" : "후보 B"}
                      </span>
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={cn(
                            "break-all type-metric-lg-semibold tabular-nums",
                            known && !passes && "text-signal-danger",
                            !known && "text-interface-muted",
                          )}
                        >
                          {known ? displayValue(value, assertion.unit) : "—"}
                        </span>
                        <Icon
                          aria-label={
                            !known
                              ? "미수집"
                              : passes
                                ? "기대값 충족"
                                : "기대값 위반"
                          }
                          className={cn(
                            "size-4 shrink-0",
                            !known
                              ? "text-interface-muted"
                              : passes
                                ? "text-signal-success"
                                : "text-signal-danger",
                          )}
                        />
                      </div>
                      <p className="break-words type-body-xs text-interface-secondary">
                        {known ? "기대" : "미수집 · 기대"}
                        {assertion.operator === "gte" ? " ≥ " : " "}
                        {displayValue(assertion.expected, assertion.unit)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
