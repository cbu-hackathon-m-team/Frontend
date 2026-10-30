import { CheckCircle2, CircleDashed, TriangleAlert } from "lucide-react";
import { runCounts, type SampleRun } from "./model";
import { cn } from "@/lib/utils";

export function RunSummary({
  result,
  compact = false,
}: {
  result: SampleRun;
  compact?: boolean;
}) {
  const counts = runCounts(result);
  return (
    <section
      aria-label="테스트 판정 요약"
      className="overflow-hidden rounded-lg border border-boundary-default bg-surface-panel"
    >
      <dl className="grid grid-cols-3 divide-x divide-boundary-default">
        {[
          {
            label: "통과",
            value: counts.passed,
            icon: CheckCircle2,
            color: "text-signal-success",
          },
          {
            label: "확인 필요",
            value: counts.attention,
            icon: TriangleAlert,
            color: "text-signal-danger",
          },
          {
            label: "미검증",
            value: counts.unverified,
            icon: CircleDashed,
            color: "text-interface-muted",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className={cn(
              "flex flex-col",
              compact ? "gap-1 p-3" : "gap-2 p-4 sm:px-5",
            )}
          >
            <dt className="flex items-center gap-1.5 whitespace-nowrap type-body-sm text-interface-secondary">
              <Icon
                className={cn("hidden size-3.5 shrink-0 sm:block", color)}
              />
              {label}
            </dt>
            <dd className="flex items-baseline gap-2">
              <span
                className={cn(
                  compact ? "type-metric-md" : "type-metric-lg-semibold",
                  "tabular-nums",
                  value > 0 && color,
                )}
              >
                {value}
              </span>
              <span className="type-body-xs text-interface-muted">
                / {result.cases.length}
              </span>
            </dd>
          </div>
        ))}
      </dl>
      {result.cases.length > 0 && (
        <div
          className={cn(
            "flex gap-1 border-t border-boundary-subtle",
            compact ? "px-3 py-2" : "px-4 py-3",
          )}
          aria-label="테스트별 판정 분포"
        >
          {result.cases.map((c) => (
            <span
              key={c.caseId}
              title={`${c.caseId} · ${c.outcome === "passed" ? "통과" : c.outcome === "unverified" ? "미검증" : "확인 필요"}`}
              className={cn(
                "h-1.5 min-w-0 flex-1 rounded-sm",
                c.outcome === "passed"
                  ? "bg-signal-success"
                  : c.outcome === "unverified"
                    ? "bg-boundary-strong"
                    : "bg-signal-danger",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
