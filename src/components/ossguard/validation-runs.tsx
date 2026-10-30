import { ArrowRight, GitBranch, GitCompareArrows } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { outcomeLabel } from "./model";
import { RunSummary } from "./run-summary";
import type { GuardDraft } from "./draft";

export function ValidationRuns({
  latest,
  run,
  onOpen,
  onSetup,
}: {
  latest: GuardDraft["latest"];
  run: number;
  onOpen: () => void;
  onSetup: () => void;
}) {
  if (!latest)
    return (
      <Empty variant="panel">
        <EmptyHeader>
          <GitCompareArrows className="mb-2 size-6 text-interface-muted" />
          <EmptyTitle>첫 검증을 준비하세요</EmptyTitle>
          <EmptyDescription>
            저장소·의존성·업무 테스트를 확정하면 여기서 실행 결과를 확인할 수
            있습니다.
          </EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" onClick={onSetup}>
          실행 설정 작성
          <ArrowRight />
        </Button>
      </Empty>
    );
  const { definition: project, result } = latest;
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <p className="type-body-sm text-interface-secondary">
        이 브라우저에 보관된 최근 검증입니다.{" "}
        {result.execution?.kind === "example" &&
          "예시를 바꾸어 통과·회귀·빌드 실패·관측 오류 화면을 확인할 수 있습니다."}
      </p>
      <article className="min-w-0 overflow-hidden rounded-lg border border-boundary-default bg-surface-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-boundary-subtle px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="type-code-sm">
              {result.execution?.kind === "example"
                ? "EXAMPLE"
                : result.source
                  ? "RUN"
                  : "DEMO"}
              -{String(run).padStart(3, "0")}
            </span>
            <Badge
              variant={
                result.outcome === "passed"
                  ? "success"
                  : result.outcome === "regression"
                    ? "error"
                    : "warning"
              }
            >
              {outcomeLabel[result.outcome]}
            </Badge>
          </div>
          <Button variant="outline" onClick={onOpen}>
            실행 상세
            <ArrowRight />
          </Button>
        </div>
        <div className="grid items-start gap-5 p-5 xl:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-3">
            <h2 className="break-keep type-heading-md">{result.title}</h2>
            <p className="break-all type-code-sm text-interface-secondary">
              {result.change}
            </p>
            <div className="flex items-center gap-2 type-body-sm text-interface-muted">
              <GitBranch className="size-3.5" />
              {project.repository?.sha?.slice(0, 12) || "SHA 확인 전"}
            </div>
            {result.execution?.kind === "example" && (
              <span className="type-body-xs text-interface-muted">
                화면 예시 · 실제 실행 아님
              </span>
            )}
          </div>
          <RunSummary result={result} />
        </div>
      </article>
    </div>
  );
}
