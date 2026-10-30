import { useState } from "react";
import { Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { GuardResults } from "./guard-results";
import { RunSummary } from "./run-summary";
import { ExecutionPipeline } from "./execution-pipeline";
import { FileDiff } from "./file-diff";
import { outcomeLabel, type ValidationProject, type SampleRun } from "./model";
import styles from "./validation-detail.module.css";

function DetailContent({
  project,
  result,
  run,
}: {
  project: ValidationProject;
  result: SampleRun;
  run: number;
}) {
  const initialStage = result.execution?.stages.find((s) => s.state === "failed")
    ?? result.execution?.stages.find((s) => s.state === "running")
    ?? result.execution?.stages[0];
  const [stageId, setStageId] = useState(initialStage?.id);
  const stage =
    result.execution?.stages.find((s) => s.id === stageId) ??
    initialStage;
  const [tab, setTab] = useState(
    result.outcome === "baseline-failed" ||
    (result.execution?.stages.some((s) => s.state === "failed") &&
      result.cases.every((c) => c.outcome === "unverified")
    )
      ? "execution"
      : "comparison",
  );
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="grid items-center gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            {(result.awaitingResults ||
              result.title !== outcomeLabel[result.outcome]) && (
              <Badge
                variant={
                  result.outcome === "regression"
                    ? "error"
                    : result.outcome === "passed"
                      ? "success"
                      : "muted"
                }
              >
                {result.source === "preview"
                  ? "실행 전"
                  : result.awaitingResults
                    ? result.status === "QUEUED"
                      ? "대기 중"
                      : "실행 중"
                    : outcomeLabel[result.outcome]}
              </Badge>
            )}
            <span className="type-code-sm text-interface-muted">
              {result.source === "preview"
                ? "미리보기"
                : result.source === "runner"
                  ? result.id.slice(0, 8)
                  : `${result.execution?.kind === "example" ? "EXAMPLE" : "RUN"}-${String(run).padStart(3, "0")}`}
            </span>
          </div>
          <h2 className="break-keep type-heading-md">{result.title}</h2>
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 type-body-sm text-interface-secondary">
            <span className="min-w-0 break-all">
              {project.repository?.sha
                ? project.repository.sha.slice(0, 12)
                : "SHA 확인 전"}{" "}
              · {project.repository?.ref ?? "소스 미등록"}
            </span>
            <span className="break-all">
              {project.update
                ? `${project.update.packageName} ${project.update.locked || "잠금 확인 전"} → ${project.update.targetVersion}`
                : `${project.baseline.label} → ${project.candidate.label}`}
            </span>
            {result.execution?.kind === "example" && (
              <Badge variant="muted">화면 예시 · 실제 실행 아님</Badge>
            )}
            {result.control && (
              <Badge variant="outline">동일 버전 대조군</Badge>
            )}
            {result.createdAt && (
              <time dateTime={result.createdAt}>
                {new Date(result.createdAt).toLocaleString("ko-KR")}
              </time>
            )}
          </div>
        </div>
        <RunSummary result={result} compact />
      </div>
      {result.execution && (
        <Card variant="panel">
          <CardContent className="p-3 md:p-3">
            <ExecutionPipeline
              stages={result.execution.stages}
              selected={stageId}
              onSelect={(id) => {
                setStageId(id);
                setTab("execution");
              }}
            />
          </CardContent>
        </Card>
      )}
      <Tabs value={tab} onValueChange={setTab} className="min-w-0">
        <div className="overflow-x-auto">
          <TabsList variant="line" aria-label="실행 상세">
            <TabsTrigger variant="line" value="comparison">
              업무 비교
            </TabsTrigger>
            <TabsTrigger variant="line" value="changes">
              변경 증거
            </TabsTrigger>
            <TabsTrigger variant="line" value="execution">
              실행·로그
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="comparison" className="mt-3 min-w-0">
          {result.awaitingResults &&
          result.cases.every(
            (c) =>
              !Object.keys(c.baseline.values).length &&
              !Object.keys(c.candidate.values).length,
          ) ? (
            <Empty variant="panel">
              <EmptyHeader>
                <EmptyTitle>업무 결과 수집 중</EmptyTitle>
                <EmptyDescription>
                  실행 단계가 완료되는 대로 A/B 관측값을 표시합니다.
                </EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" onClick={() => setTab("execution")}>
                진행 로그 보기
              </Button>
            </Empty>
          ) : (
            <GuardResults
              project={project}
              result={result}
              run={run}
              embedded
            />
          )}
        </TabsContent>
        <TabsContent value="changes" className="mt-3 min-w-0">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["A · 실제 설치 버전", result.execution?.installedA],
                ["B · 실제 설치 버전", result.execution?.installedB],
              ].map(([label, value]) => (
                <Card variant="panel" key={label}>
                  <CardHeader className="px-5 py-4 md:px-5">
                    <CardTitle>
                      {label}
                      {result.execution?.kind === "example" ? " 예시" : ""}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 md:px-5 md:pb-5">
                    <p className="type-code-sm">{value ?? "수집되지 않음"}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {!!result.execution?.packages.length && (
              <Card variant="panel">
                <CardHeader className="px-5 py-4 md:px-5">
                  <CardTitle>전체 패키지 변경</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-5 md:pb-5">
                  <ul className="flex flex-col gap-4">
                    {result.execution.packages.map((p) => (
                      <li
                        key={p.name}
                        className="flex flex-wrap items-center justify-between gap-3"
                      >
                        <span className="flex min-w-0 items-center gap-2 type-code-sm">
                          <span className="min-w-0 break-all">{p.name}</span>
                          <Badge variant="outline">
                            {p.direct ? "직접" : "하위"}
                          </Badge>
                        </span>
                        <span className="break-all type-code-sm">
                          {p.before} → {p.after}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            <section className="flex min-w-0 flex-col gap-3" aria-label="변경 파일">
              <h3 className="type-heading-sm">변경 파일</h3>
              {(result.execution?.files ?? []).map((file, index) => (
                <FileDiff
                  key={file.path}
                  path={file.path}
                  diff={file.diff}
                  defaultOpen={index === 0}
                />
              ))}
              {!result.execution?.files.length && (
                <p className="type-body-sm text-interface-muted">
                  수집된 파일 diff가 없습니다.
                </p>
              )}
            </section>
          </div>
        </TabsContent>
        <TabsContent value="execution" className="mt-3 min-w-0">
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
            <Card variant="panel" className="overflow-hidden">
              <div className={styles.logHeader}>
                <h3 id="execution-log-title" className={styles.logTitle}>
                  <Terminal aria-hidden="true" className="size-4 shrink-0 text-interface-muted" />
                  <span className="min-w-0 break-words">{stage?.label ?? "실행 기록"}</span>
                </h3>
                {stage && (
                  <Badge variant={stage.state === "done" ? "success" : stage.state === "failed" ? "error" : "muted"}>
                    {{ done: "완료", failed: "실패", running: "실행 중", pending: "대기", skipped: "건너뜀" }[stage.state]}
                  </Badge>
                )}
              </div>
              <pre className={styles.logBody} tabIndex={0} role="region" aria-labelledby="execution-log-title">
                {stage?.detail.trim() || result.summary.trim() || "수집된 실행 로그가 없습니다."}
              </pre>
            </Card>
            <Card variant="panel">
              <CardHeader className="px-5 py-4 md:px-5">
                <CardTitle>후속 처리</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 md:px-5 md:pb-5">
                <dl className="flex flex-col gap-4 type-body-sm">
                  {[
                    ["자원 정리", result.execution?.cleanup],
                    ["AI 설명", result.execution?.ai],
                    ["결과 이메일", result.execution?.email],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="text-interface-secondary">{label}</dt>
                      <dd>{value ?? "대기"}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {!result.cases.length && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>테스트 결과 없음</EmptyTitle>
            <EmptyDescription>
              업데이트 또는 빌드 단계의 실행 기록을 확인하세요.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

export function ValidationDetail(props: {
  project: ValidationProject;
  result: SampleRun;
  run: number;
}) {
  return (
    <DetailContent
      key={`${props.result.id}:${props.run}:${props.result.awaitingResults ? "pending" : "finished"}`}
      {...props}
    />
  );
}
