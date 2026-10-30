import { ArrowRight, CheckCircle2, CircleDashed, CircleMinus, LoaderCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SampleRun } from "./model";
import styles from "./execution-pipeline.module.css";

type Stage = NonNullable<SampleRun["execution"]>["stages"][number];
const stateLabel = { done: "완료", failed: "실패", running: "실행 중", pending: "대기", skipped: "건너뜀" };

export function ExecutionPipeline({ stages, selected, onSelect }: {
  stages: Stage[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={styles.scroll}>
      <ol className={styles.steps} aria-label="검증 실행 파이프라인">
        {stages.map((stage, index) => {
          const Icon = stage.state === "done" ? CheckCircle2
            : stage.state === "failed" ? XCircle
            : stage.state === "running" ? LoaderCircle
            : stage.state === "skipped" ? CircleMinus : CircleDashed;
          return (
            <li key={stage.id} className={styles.step}>
              <Button
                variant={selected === stage.id ? "secondary" : "outline"}
                size="xs"
                className="h-auto min-h-16 w-full whitespace-normal"
                aria-label={`${index + 1}단계 · ${stage.label} · ${stateLabel[stage.state]}`}
                aria-current={stage.state === "running" ? "step" : undefined}
                aria-pressed={selected === stage.id}
                onClick={() => onSelect(stage.id)}
              >
                <span className="flex min-w-0 flex-col items-center gap-2">
                  <span className="flex items-center gap-2">
                    <span className="type-code-sm tabular-nums text-interface-secondary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon aria-hidden="true" className={cn(
                      stage.state === "done" ? "text-signal-success"
                        : stage.state === "failed" ? "text-signal-danger"
                        : stage.state === "running" ? "animate-spin text-interface-contrast motion-reduce:animate-none"
                        : "text-interface-muted",
                    )} />
                  </span>
                  <span className="break-keep">{stage.label}</span>
                </span>
              </Button>
              {index < stages.length - 1 && <ArrowRight aria-hidden="true" className={styles.connector} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
