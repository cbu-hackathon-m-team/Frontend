import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  GitBranch,
  GitCompareArrows,
  ListChecks,
  Settings2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { GuardDraft } from "./draft";
import { RunSummary } from "./run-summary";
import { outcomeLabel } from "./model";

export function ProjectOverview({
  draft,
  configured,
  navigate,
}: {
  draft: GuardDraft;
  configured: boolean;
  navigate: (tab: string) => void;
}) {
  const p = draft.definition;
  const latest = draft.latest?.result;
  const executionLabel =
    latest?.source === "runner"
      ? latest.id.slice(0, 8)
      : `${latest?.execution?.kind === "example" ? "EXAMPLE" : "DEMO"}-${String(draft.run).padStart(3, "0")}`;
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section
        aria-label="최근 검증"
        className="overflow-hidden rounded-lg border border-boundary-default bg-surface-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-boundary-subtle px-5 py-3">
          <h2 className="type-heading-sm">최근 검증</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("runs")}>
            검증 실행 보기
            <ArrowRight />
          </Button>
        </div>
        {latest ? (
          <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col items-start gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant={
                    latest.outcome === "regression"
                      ? "error"
                      : latest.outcome === "passed"
                        ? "success"
                        : "warning"
                  }
                >
                  {latest.awaitingResults
                    ? latest.status === "QUEUED"
                      ? "대기 중"
                      : "실행 중"
                    : outcomeLabel[latest.outcome]}
                </Badge>
                <span className="type-code-sm text-interface-muted">
                  {executionLabel}
                </span>
              </div>
              <h3 className="break-keep type-heading-md">{latest.title}</h3>
              <p className="type-body-sm text-interface-secondary">
                {latest.change}
              </p>
              <Button
                variant="outline"
                className="mt-1"
                aria-label={`${executionLabel} 비교 결과 열기`}
                onClick={() => navigate("results")}
              >
                비교 결과 열기
                <ArrowRight />
              </Button>
            </div>
            <RunSummary result={latest} />
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>아직 실행한 검증이 없습니다</EmptyTitle>
              <EmptyDescription>
                실행 설정과 업무 테스트를 준비하면 첫 검증을 시작할 수 있습니다.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card variant="panel" className="min-w-0">
          <CardHeader className="px-5 py-4 md:px-5">
            <CardTitle>업데이트 대상</CardTitle>
          </CardHeader>
          <CardContent className="px-5 md:px-5 md:pb-5">
            <div className="mb-4 flex min-w-0 items-start gap-2 type-body-sm text-interface-secondary">
              <GitBranch className="mt-0.5 size-4 shrink-0" />
              <span className="break-all">
                {p.repository?.url ||
                  (p.repository ? "GitHub 저장소를 등록하세요" : p.target.name)}
              </span>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
              <div className="min-w-0 rounded-md bg-surface-canvas p-4">
                <p className="type-body-xs text-interface-muted">
                  기준 A · 잠금 버전
                </p>
                <p className="mt-2 break-all type-heading-md">
                  {p.update?.locked || p.baseline.label || "확인 전"}
                </p>
              </div>
              <ArrowRight className="size-4 text-interface-muted" />
              <div className="min-w-0 rounded-md border border-boundary-strong p-4">
                <p className="type-body-xs text-interface-muted">
                  후보 B · 목표 버전
                </p>
                <p className="mt-2 break-all type-heading-md">
                  {p.update?.targetVersion || p.candidate.label || "미설정"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {p.update?.packageName || "의존성 미설정"}
              </Badge>
              <span className="type-body-xs text-interface-secondary">
                {p.update?.ecosystem || p.target.adapter}
              </span>
            </div>
            <dl className="mt-5 grid gap-4 border-t border-boundary-subtle pt-4 sm:grid-cols-2">
              {[
                [
                  "기준 커밋",
                  p.repository?.sha?.slice(0, 12) || "소스 확인 전",
                ],
                ["빌드 규격", p.executionProfile?.dockerfile || "미설정"],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="type-body-xs text-interface-muted">{label}</dt>
                  <dd className="mt-1 break-all type-code-sm">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card variant="panel" className="min-w-0">
          <CardHeader className="px-5 py-4 md:px-5">
            <CardTitle>검증 준비</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 px-2 md:px-2 md:pb-2">
            {[
              {
                label: "소스·실행 설정",
                detail: configured
                  ? "설정 작성됨"
                  : "저장소와 실행 규격을 등록하세요",
                complete: configured,
                tab: "setup",
                icon: Settings2,
              },
              {
                label: "업무 테스트",
                detail: `${p.cases.length}개 · ${draft.confirmed ? "확정됨" : "검토 필요"}`,
                complete: draft.confirmed && p.cases.length > 0,
                tab: "tests",
                icon: ListChecks,
              },
              {
                label: "A/B 비교",
                detail: latest ? "최근 결과 확인" : "실행 후 증거를 확인하세요",
                complete: !!latest,
                tab: latest ? "results" : "runs",
                icon: GitCompareArrows,
              },
            ].map(({ label, detail, complete, tab, icon: Icon }) => (
              <Button
                key={label}
                variant="ghost"
                className="h-auto w-full justify-start whitespace-normal text-left"
                onClick={() => navigate(tab)}
              >
                <Icon className="size-4 shrink-0 text-interface-muted" />
                <span className="min-w-0 flex-1 py-2">
                  <span className="block type-label-md">{label}</span>
                  <span className="mt-1 block type-body-xs text-interface-secondary">
                    {detail}
                  </span>
                </span>
                {complete ? (
                  <CheckCircle2 className="text-signal-success" />
                ) : (
                  <CircleDashed className="text-interface-muted" />
                )}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
