import { useState } from "react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RequestComparison } from "./request-comparison";
import { AssertionComparison } from "./assertion-comparison";
import { GuardTrace } from "./guard-trace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  displayValue,
  outcomeLabel,
  runCounts,
  type Outcome,
  type SampleRun,
  type ValidationProject,
} from "./model";

function ResultBadge({ value }: { value: Outcome }) {
  return (
    <Badge
      variant={
        value === "passed"
          ? "success"
          : value === "regression"
            ? "error"
            : value === "baseline-failed"
              ? "warning"
              : "muted"
      }
    >
      {value === "passed" ? "통과" : outcomeLabel[value]}
    </Badge>
  );
}
export function GuardResults({
  project,
  result,
  run,
  embedded = false,
}: {
  project: ValidationProject;
  result: SampleRun;
  run: number;
  embedded?: boolean;
}) {
  const [selectedId, setSelectedId] = useState(
    result.cases.find(
      (c) => c.outcome === "regression" || c.outcome === "baseline-failed",
    )?.caseId ??
      result.cases.find((c) => c.outcome === "unverified")?.caseId ??
      project.cases[0]?.id,
  );
  const [filter, setFilter] = useState("all");
  const counts = runCounts(result);
  const visibleCases = project.cases.filter((c) => {
    const outcome =
      result.cases.find((r) => r.caseId === c.id)?.outcome ?? "unverified";
    return (
      filter === "all" ||
      (filter === "unverified"
        ? outcome === "unverified"
        : outcome === "regression" || outcome === "baseline-failed")
    );
  });
  const current =
    visibleCases.find((c) => c.id === selectedId) ?? visibleCases[0];
  const comparison =
    current && result.cases.find((c) => c.caseId === current.id);
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {!embedded && (
        <Card variant="panel">
          <CardHeader className="px-5 py-4 md:px-5">
            <div className="flex flex-wrap items-center gap-3">
              {result.source === "preview" ? (
                <Badge variant="outline">실행 전</Badge>
              ) : (
                <ResultBadge value={result.outcome} />
              )}
              <CardTitle>{result.title}</CardTitle>
              {result.source !== "preview" && (
                <span className="type-code-sm text-interface-muted">
                  {`${result.source ? "RUN" : "DEMO"}-${String(run).padStart(3, "0")}`}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 type-body-sm text-interface-secondary">
              <span>
                {project.baseline.label} → {project.candidate.label}
              </span>
              <span>{result.change}</span>
              <span>
                통과 {counts.passed} · 확인 필요 {counts.attention} · 미검증{" "}
                {counts.unverified}
              </span>
            </div>
          </CardHeader>
        </Card>
      )}{" "}
      {result.source && result.summary && (
        <Alert>
          <AlertDescription>{result.summary}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="type-heading-sm">
          업무 테스트{" "}
          <span className="ml-1 text-interface-muted">
            {project.cases.length}
          </span>
        </h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger aria-label="결과 필터" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">전체 테스트</SelectItem>
              <SelectItem value="attention">확인 필요</SelectItem>
              <SelectItem value="unverified">미검증</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)]">
        <div className="lg:hidden">
          <Select
            value={current?.id ?? ""}
            onValueChange={setSelectedId}
            disabled={!visibleCases.length}
          >
            <SelectTrigger aria-label="비교할 테스트" className="w-full">
              <SelectValue placeholder="해당 테스트 없음" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {visibleCases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ·{" "}
                    {
                      outcomeLabel[
                        result.cases.find((r) => r.caseId === c.id)?.outcome ??
                          "unverified"
                      ]
                    }
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Card variant="panel" className="hidden min-w-0 lg:block">
          <CardContent className="px-2 py-2 md:px-2 md:pb-2">
            <ul aria-label="테스트 결과" className="flex flex-col gap-1">
              {visibleCases.map((c) => (
                <li key={c.id}>
                  <Button
                    variant={current?.id === c.id ? "secondary" : "ghost"}
                    className="h-auto min-w-0 w-full justify-between whitespace-normal"
                    aria-pressed={current?.id === c.id}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <span className="flex min-w-0 flex-col items-start gap-1 py-2">
                      <span className="type-code-sm text-interface-muted">
                        {c.id}
                      </span>
                      <span className="max-w-full break-keep text-left">
                        {c.name}
                      </span>
                    </span>
                    <ResultBadge
                      value={
                        result.cases.find((r) => r.caseId === c.id)?.outcome ??
                        "unverified"
                      }
                    />
                  </Button>
                </li>
              ))}
            </ul>
            {!visibleCases.length && (
              <p className="p-3 type-body-sm text-interface-secondary">
                확인이 필요한 테스트가 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
        {!current && (
          <Empty variant="panel">
            <EmptyHeader>
              <EmptyTitle>해당하는 테스트가 없습니다</EmptyTitle>
              <EmptyDescription>
                결과 필터를 바꾸어 다른 테스트를 확인하세요.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {current && (
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="type-heading-sm">
                {current.id} · {current.name}
              </h2>
              <p className="type-body-xs text-interface-muted">
                A/B에 사용할 동일 입력
              </p>
              <pre className="whitespace-pre-wrap break-words type-code-sm text-interface-secondary">
                {current.input}
              </pre>
            </div>
            {current.intent && (
              <div className="flex flex-col gap-2">
                <h3 className="type-label-md">확정한 기대 동작</h3>
                <p className="type-body-md text-interface-secondary">
                  {current.intent}
                </p>
              </div>
            )}
            {project.repository && current.assertions.length > 0 && (
              <AssertionComparison
                project={project}
                test={current}
                comparison={comparison}
              />
            )}
            {project.steps.length ||
            comparison?.baseline.events?.length ||
            comparison?.candidate.events?.length ? (
              project.repository ? (
                <RequestComparison
                  key={current.id + result.id + run}
                  project={project}
                  comparison={comparison}
                />
              ) : (
                <GuardTrace
                  key={current.id + result.id + run}
                  project={project}
                  comparison={comparison}
                />
              )
            ) : (
              <>
                {result.source === "preview" && (
                  <ol aria-label="실행 계획" className="flex flex-wrap gap-4">
                    {[
                      "기준 A 실행",
                      "후보 B 적용",
                      "동일 테스트 실행",
                      "기록 비교",
                    ].map((label, i) => (
                      <li key={label} className="flex items-center gap-2">
                        <Badge variant="outline">{i + 1}</Badge>
                        <span className="type-body-sm text-interface-secondary">
                          {label}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["A", project.baseline.label],
                    ["B", project.candidate.label],
                  ].map(([label, version]) => (
                    <Empty variant="panel" key={label}>
                      <EmptyHeader>
                        <EmptyTitle>
                          {label} · {version}
                        </EmptyTitle>
                        <EmptyDescription>
                          {result.source === "preview"
                            ? "실행 전 · 호출 기록 없음"
                            : result.awaitingResults
                              ? "수집 대기 · 호출 기록 없음"
                              : "실행되지 않음 · 호출 기록 없음"}
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ))}
                </div>
              </>
            )}
            {current.request && (
              <Accordion type="single" collapsible>
                <AccordionItem value="request">
                  <AccordionTrigger>
                    {current.request.method} {current.request.path} · 동일 요청
                    본문
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-surface-canvas p-4 type-code-sm">
                      {current.request.body}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            {!project.repository && !!current.assertions.length && (
              <Card variant="panel">
                <CardHeader variant="divided" className="px-5 py-4 md:px-5">
                  <CardTitle>기대값과 실제 결과</CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>비교 항목</TableHead>
                        <TableHead>기대값</TableHead>
                        <TableHead>기준</TableHead>
                        <TableHead>후보</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {current.assertions.map((a) => (
                        <TableRow key={a.key}>
                          <TableCell>{a.label}</TableCell>
                          <TableCell>
                            {displayValue(a.expected, a.unit)}
                          </TableCell>
                          <TableCell>
                            {displayValue(
                              comparison?.baseline.values[a.key],
                              a.unit,
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                comparison?.candidate.values[a.key] !==
                                  undefined &&
                                  comparison.candidate.values[a.key] !==
                                    a.expected &&
                                  "text-signal-danger type-label-md",
                              )}
                            >
                              {displayValue(
                                comparison?.candidate.values[a.key],
                                a.unit,
                              )}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            {comparison && (!result.source || result.execution?.ai === "완료") && (
              <Card variant="panel">
                <CardHeader className="px-5 py-4 md:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>원인 분석</CardTitle>
                    <Badge variant="muted">
                      {result.source === "runner"
                        ? `AI · ${result.execution?.ai ?? "미연결"}`
                        : "AI 설명 샘플"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-5 md:px-5 md:pb-5">
                  <dl className="flex flex-col gap-4 type-body-md">
                    {[
                      ["확인된 사실", comparison.analysis.fact],
                      ["원인 후보", comparison.analysis.hypothesis],
                      ["다음 확인", comparison.analysis.next],
                    ].map(([label, text]) => (
                      <div key={label}>
                        <dt className="type-label-sm text-interface-secondary">
                          {label}
                        </dt>
                        <dd className="mt-1">{text}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}
            {result.source !== "preview" && (
              <Card variant="panel">
                <CardHeader className="px-5 py-4 md:px-5">
                  <CardTitle>원본 증거</CardTitle>
                </CardHeader>
                <CardContent className="px-5 md:px-5 md:pb-5">
                  <Accordion type="multiple">
                    <AccordionItem value="events">
                      <AccordionTrigger>
                        {result.source
                          ? "실행 기록"
                          : "실행 기록 · 시연 데이터"}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                          {[
                            ["기준", comparison?.baseline.evidence],
                            ["후보", comparison?.candidate.evidence],
                          ].map(([label, evidence]) => (
                            <div className="min-w-0" key={label}>
                              <h3 className="mb-2 type-label-md">{label}</h3>
                              <pre className="overflow-x-auto rounded-md bg-surface-canvas p-3 type-code-sm">
                                {evidence ?? "수집된 증거 없음"}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    {!project.repository && (
                      <AccordionItem value="diff">
                        <AccordionTrigger>아티팩트 변경</AccordionTrigger>
                        <AccordionContent>
                          <pre className="overflow-x-auto rounded-md bg-surface-canvas p-3 type-code-sm">
                            {result.diff}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
