import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDashed,
  GitCompareArrows,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  cases,
  caseResult,
  scenarios,
  stages,
  verdict,
  type Scenario,
} from "./sample";

function Status({ value }: { value: string }) {
  const variant =
    value === "통과" || value === "전체 통과"
      ? "success"
      : value === "규칙 위반" || value === "회귀 의심"
        ? "error"
        : value === "기준 확인 필요"
          ? "warning"
          : "muted";
  return <Badge variant={variant}>{value}</Badge>;
}
function Workflow({
  candidate,
  scenario,
  index,
}: {
  candidate: boolean;
  scenario: Scenario;
  index: number;
}) {
  const unverified = candidate && scenario === "error";
  const missing =
    index < 2 &&
    ((candidate && scenario === "defect") || scenario === "baseline");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="type-label-md">
          {candidate ? "후보 환경" : "기준 환경"}
        </span>
        <Badge variant="outline">{candidate ? "Version B" : "Version A"}</Badge>
      </div>
      <ol
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        aria-label={candidate ? "후보 업무 흐름" : "기준 업무 흐름"}
      >
        {["주문 접수", "결제 확인", "재고 차감", "배송 요청"].map(
          (label, step) => {
            const skipped = index > 1 && step > 1;
            const failed = !unverified && !skipped && missing && step === 3;
            const Icon =
              unverified || skipped
                ? CircleDashed
                : failed
                  ? XCircle
                  : CheckCircle2;
            return (
              <li
                key={label}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border p-3",
                  failed
                    ? "border-signal-danger/30 bg-signal-danger/5"
                    : "border-boundary-subtle bg-surface-canvas",
                )}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className={cn(
                      "size-5",
                      unverified || skipped
                        ? "text-interface-muted"
                        : failed
                          ? "text-signal-danger"
                          : "text-signal-success",
                    )}
                  />
                  <span className="type-code-sm text-interface-muted">
                    0{step + 1}
                  </span>
                </div>
                <span className="type-label-sm">{label}</span>
                <span
                  className={cn(
                    "type-body-xs",
                    failed ? "text-signal-danger" : "text-interface-secondary",
                  )}
                >
                  {unverified
                    ? "미확인"
                    : skipped
                      ? "실행 안 함 · 정상"
                      : failed
                        ? "누락 · 0회"
                        : "완료"}
                </span>
              </li>
            );
          },
        )}
      </ol>
    </div>
  );
}
export function GuardConsole() {
  const [params, setParams] = useSearchParams();
  const tab = ["results", "tests", "setup"].includes(params.get("tab") ?? "")
    ? params.get("tab")!
    : "results";
  const [scenario, setScenario] = useState<Scenario>("defect");
  const [result, setResult] = useState<Scenario>("defect");
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("all");
  const [confirmed, setConfirmed] = useState(true);
  const [rule, setRule] = useState(
    "결제가 완료되고 재고가 충분하면 주문 수량만큼 차감하고 배송을 1회 요청한다. 결제 실패 또는 재고 부족이면 차감·배송을 하지 않는다.",
  );
  const [appName, setAppName] = useState("order-service");
  const [email, setEmail] = useState("demo@example.com");
  const [progress, setProgress] = useState<number | null>(null);
  const [run, setRun] = useState(1);
  const [expectations, setExpectations] = useState(
    cases.map((c) => String(c.delivery)),
  );
  const busy = progress !== null;
  const valid =
    appName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  useEffect(() => {
    if (progress === null) return;
    const timer = window.setTimeout(() => {
      if (progress === stages.length - 1) {
        setProgress(null);
        setResult(scenario);
        setRun((n) => n + 1);
        setSelected(0);
      } else setProgress(progress + 1);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [progress, scenario]);
  function start() {
    if (!valid || !confirmed || busy) return;
    setParams({ tab: "results" });
    setProgress(0);
  }
  const current = cases[selected];
  const count = result === "fixed" ? 4 : result === "error" ? 0 : 2;
  const candidateDelivery =
    result === "error"
      ? "—"
      : selected < 2 && result !== "fixed"
        ? 0
        : current.delivery;
  return (
    <section
      className="flex flex-col gap-7 break-keep"
      aria-labelledby="guard-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 type-label-sm text-interface-secondary">
            <ShieldCheck className="size-4" />
            OSSGuard<span>/</span>주문 처리 샘플
            <Badge variant="muted">Node-RED</Badge>
          </div>
          <h1
            id="guard-title"
            className="type-heading-xl text-interface-contrast"
          >
            업데이트 검증
          </h1>
          <p className="type-body-md text-interface-secondary">
            변경 전후의 업무 흐름을 비교하고, 놓친 동작을 확인하세요.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={start} disabled={busy || !valid || !confirmed}>
            <Play data-icon="inline-start" />
            {busy ? "샘플 실행 중…" : "샘플 검증 실행"}
          </Button>
          <span className="type-body-xs text-interface-muted">
            격리된 후보 환경에서 검증
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-boundary-subtle bg-surface-panel px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">데모</Badge>
          <span className="type-body-sm text-interface-secondary">
            시연용 데이터 · 실제 서버 실행 및 이메일 발송 없음
          </span>
        </div>
        <Select
          value={scenario}
          onValueChange={(v) => setScenario(v as Scenario)}
          disabled={busy}
        >
          <SelectTrigger className="w-full sm:w-56" aria-label="시연 시나리오">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.entries(scenarios).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {(!confirmed || !valid) && (
        <Alert>
          <CircleDashed />
          <AlertTitle>실행 전 확인이 필요해요</AlertTitle>
          <AlertDescription>
            {!valid
              ? "실행 설정의 앱 이름과 이메일을 확인해 주세요."
              : "변경한 업무 규칙과 기대 결과를 확정해 주세요."}
          </AlertDescription>
        </Alert>
      )}
      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
        <TabsList variant="line">
          <TabsTrigger value="results">
            <GitCompareArrows />
            검증 결과
          </TabsTrigger>
          <TabsTrigger value="tests">테스트 확인</TabsTrigger>
          <TabsTrigger value="setup">실행 설정</TabsTrigger>
        </TabsList>
        <TabsContent value="results">
          <div className="mt-4 flex flex-col gap-6">
            {busy ? (
              <Card variant="panel">
                <CardHeader>
                  <CardTitle>검증 과정을 시연하고 있어요</CardTitle>
                  <CardDescription>
                    선택한 샘플의 실행 순서를 재현합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
                    aria-live="polite"
                  >
                    {stages.map((s, i) => (
                      <li
                        key={s}
                        className="flex items-center gap-2 type-body-sm"
                      >
                        {i < progress! ? (
                          <Check className="size-4 text-signal-success" />
                        ) : (
                          <CircleDashed className="size-4" />
                        )}
                        <span
                          className={cn(
                            i === progress &&
                              "text-interface-contrast type-label-sm",
                          )}
                        >
                          {s}
                          {i === progress ? " 진행 중" : ""}
                        </span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <Card variant="panel">
                    <CardHeader>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Status value={verdict(result)} />
                          <span className="type-code-sm text-interface-muted">
                            DEMO-{String(run).padStart(3, "0")}
                          </span>
                        </div>
                        <span className="type-body-xs text-interface-muted">
                          {run > 1 ? "방금 실행한 샘플" : "저장된 시연 샘플"}
                        </span>
                      </div>
                      <CardTitle className="type-heading-md">
                        {result === "defect"
                          ? "응답은 성공했지만, 배송 요청이 누락됐어요."
                          : result === "fixed"
                            ? "모든 테스트가 업무 규칙을 충족했어요."
                            : result === "baseline"
                              ? "기존 환경부터 업무 규칙을 위반하고 있어요."
                              : "후보 환경을 실행하지 못했어요."}
                      </CardTitle>
                      <CardDescription>
                        {result === "defect"
                          ? "정상 주문과 재고 경계값 테스트에서 배송 요청이 1회에서 0회로 줄었습니다."
                          : result === "fixed"
                            ? "검증한 4개 테스트 범위에서 기존·후보 결과가 일치합니다."
                            : result === "baseline"
                              ? "새 업데이트의 회귀로 단정할 수 없습니다. 기준 환경을 먼저 확인하세요."
                              : "후보 시작 시간 초과. 테스트 4건은 미검증으로 남습니다."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 border-t border-boundary-subtle pt-5">
                        {[
                          ["통과", count],
                          [
                            "규칙 위반",
                            result === "defect" || result === "baseline"
                              ? 2
                              : 0,
                          ],
                          ["미검증", result === "error" ? 4 : 0],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <p className="type-body-sm text-interface-secondary">
                              {label}
                            </p>
                            <p className="mt-1 type-metric-lg-semibold tabular-nums">
                              {value}
                              <span className="ml-1 type-body-sm text-interface-muted">
                                / 4
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex flex-col gap-4 py-1">
                    <h2 className="type-heading-sm">실행 정보</h2>
                    <dl className="flex flex-col gap-3 type-body-sm">
                      {[
                        ["런타임", "Version A → B"],
                        [
                          "흐름 변경",
                          result === "fixed"
                            ? "배송 연결 복구"
                            : "배송 연결 누락",
                        ],
                        [
                          "후보 업데이트",
                          result === "error" ? "실행 실패" : "적용 완료 · 샘플",
                        ],
                        [
                          "AI 분석",
                          result === "error" ? "분석 없음" : "샘플 설명",
                        ],
                        ["자원 정리", "시연 · 실제 자원 없음"],
                        ["이메일", "미발송 · 데모"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3">
                          <dt className="text-interface-secondary">{k}</dt>
                          <dd className="text-right">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <Separator />
                    <p className="type-body-xs text-interface-muted">
                      팀이 의도적으로 구성한 결함 샘플입니다. 실제 오픈소스
                      버전의 결함을 의미하지 않습니다.
                    </p>
                  </div>
                </div>
                <Card variant="panel">
                  <CardHeader variant="divided">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CardTitle>
                        {current.id} · {current.name} — 업무 흐름 비교
                      </CardTitle>
                      <Badge variant="outline">
                        같은 입력 · 같은 초기 상태
                      </Badge>
                    </div>
                    <CardDescription>{current.input}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-6 xl:grid-cols-2">
                      <Workflow
                        candidate={false}
                        scenario={result}
                        index={selected}
                      />
                      <Workflow candidate scenario={result} index={selected} />
                    </div>
                    <div className="mt-6 overflow-hidden rounded-lg border border-boundary-subtle">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>비교 항목</TableHead>
                            <TableHead>기대 결과</TableHead>
                            <TableHead>기준 A</TableHead>
                            <TableHead>후보 B</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>HTTP 응답</TableCell>
                            <TableCell>200</TableCell>
                            <TableCell>200</TableCell>
                            <TableCell>
                              {result === "error" ? "—" : "200"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>남은 재고</TableCell>
                            <TableCell>{current.stock}</TableCell>
                            <TableCell>{current.stock}</TableCell>
                            <TableCell>
                              {result === "error" ? "—" : current.stock}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>배송 요청</TableCell>
                            <TableCell>{current.delivery}회</TableCell>
                            <TableCell>
                              {result === "baseline" && selected < 2
                                ? 0
                                : current.delivery}
                              회
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  candidateDelivery !== current.delivery &&
                                    "text-signal-danger type-label-md",
                                )}
                              >
                                {candidateDelivery}
                                {candidateDelivery === "—" ? "" : "회"}
                              </span>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                <Card variant="panel">
                  <CardHeader variant="divided">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle>테스트 결과</CardTitle>
                        <CardDescription>
                          테스트를 선택하면 아래에서 처리 단계와 증거를 비교할
                          수 있어요.
                        </CardDescription>
                      </div>
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-36" aria-label="결과 필터">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">전체 테스트</SelectItem>
                            <SelectItem value="attention">확인 필요</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 md:p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>테스트</TableHead>
                          <TableHead>입력 조건</TableHead>
                          <TableHead>기준</TableHead>
                          <TableHead>후보</TableHead>
                          <TableHead className="text-right">판정</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cases.map((c, i) =>
                          filter === "attention" &&
                          caseResult(result, i) === "통과" ? null : (
                            <TableRow
                              key={c.id}
                              data-state={
                                selected === i ? "selected" : undefined
                              }
                            >
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelected(i)}
                                  aria-pressed={selected === i}
                                >
                                  {c.id} · {c.name}
                                </Button>
                              </TableCell>
                              <TableCell>{c.input}</TableCell>
                              <TableCell>
                                <Status
                                  value={
                                    result === "baseline" && i < 2
                                      ? "규칙 위반"
                                      : "통과"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Status
                                  value={
                                    result === "baseline" && i < 2
                                      ? "규칙 위반"
                                      : caseResult(result, i)
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Status value={caseResult(result, i)} />
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                        {filter === "attention" && result === "fixed" && (
                          <TableRow>
                            <TableCell colSpan={5}>
                              확인이 필요한 테스트가 없습니다.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <div className="grid items-start gap-6 lg:grid-cols-2">
                  <Card variant="panel">
                    <CardHeader>
                      <CardTitle>
                        <span className="flex items-center gap-2">
                          <Sparkles className="size-4" />
                          원인 분석<Badge variant="muted">AI 설명 샘플</Badge>
                        </span>
                      </CardTitle>
                      <CardDescription>
                        판정 근거와 원인 후보를 구분해서 확인하세요.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <dl className="flex flex-col gap-4 type-body-md">
                        <div>
                          <dt className="type-label-sm text-interface-secondary">
                            확인된 사실
                          </dt>
                          <dd className="mt-1">
                            {result === "error"
                              ? "후보 환경이 준비되지 않아 처리 기록을 수집하지 못했습니다."
                              : "후보 배송 요청 " +
                                candidateDelivery +
                                "회 / 기대값 " +
                                current.delivery +
                                "회"}
                          </dd>
                        </div>
                        <div>
                          <dt className="type-label-sm text-interface-secondary">
                            원인 후보
                          </dt>
                          <dd className="mt-1">
                            {result !== "error" &&
                            (result === "fixed" || selected > 1)
                              ? "이 테스트에서 설명할 규칙 위반이 없습니다."
                              : result === "error"
                                ? "기동 로그 확인이 필요합니다."
                                : "재고 차감 이후 배송 단계로 이어지는 연결 변경이 누락 원인일 수 있습니다."}
                          </dd>
                        </div>
                        <div>
                          <dt className="type-label-sm text-interface-secondary">
                            다음 확인
                          </dt>
                          <dd className="mt-1">
                            관련 흐름 변경과 호출 기록을 확인하고, 수정한 후보로
                            다시 검증하세요.
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  <Card variant="panel">
                    <CardHeader>
                      <CardTitle>원본 증거</CardTitle>
                      <CardDescription>
                        선택한 테스트의 시연 기록과 흐름 변경입니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="multiple">
                        <AccordionItem value="events">
                          <AccordionTrigger>
                            모의 서비스 호출 기록
                          </AccordionTrigger>
                          <AccordionContent>
                            <pre className="overflow-x-auto rounded-md bg-surface-canvas p-3 type-code-sm">
                              {current.id +
                                " / source=demo-fixture\nbaseline stock=" +
                                current.stock +
                                "\nbaseline shipping.request=" +
                                (result === "baseline" && selected < 2
                                  ? 0
                                  : current.delivery) +
                                "\ncandidate shipping.request=" +
                                candidateDelivery}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="diff">
                          <AccordionTrigger>업무 흐름 변경</AccordionTrigger>
                          <AccordionContent>
                            <div className="flex flex-col gap-2 rounded-md bg-surface-canvas p-3 type-code-sm">
                              <span className="text-interface-secondary">
                                재고 차감 → 배송 요청
                              </span>
                              <span
                                className={
                                  result === "fixed"
                                    ? "text-signal-success"
                                    : "text-signal-danger"
                                }
                              >
                                {result === "fixed"
                                  ? "+ 연결 복구"
                                  : result === "error"
                                    ? "실행 실패 · 비교 불가"
                                    : "− 후보의 배송 연결 제거"}
                              </span>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value="tests">
          <div className="mt-4 flex flex-col gap-6">
            <Card variant="panel">
              <CardHeader>
                <CardTitle>업무 규칙</CardTitle>
                <CardDescription>
                  어떤 동작이 정상인지 정의하고, 테스트의 기대 결과를
                  확정하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="business-rule">
                      검증할 업무 규칙
                    </FieldLabel>
                    <Textarea
                      id="business-rule"
                      value={rule}
                      disabled={busy}
                      onChange={(e) => {
                        setRule(e.target.value);
                        setConfirmed(false);
                      }}
                      rows={4}
                    />
                    <FieldDescription>
                      고정 주문 시나리오를 사용하는 데모입니다. 입력한 규칙의 AI
                      생성은 연결 전입니다.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
            <Card variant="panel">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>테스트 초안 · 4개</CardTitle>
                  <Badge variant={confirmed ? "success" : "warning"}>
                    {confirmed ? "확정됨" : "검토 필요"}
                  </Badge>
                </div>
                <CardDescription>
                  샘플 기대값을 검토하세요. 변경한 값의 실제 판정은 API 연결 후
                  지원합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  {cases.map((c, i) => (
                    <Field key={c.id}>
                      <FieldLabel htmlFor={"expect-" + c.id}>
                        {c.id} · {c.name} / 기대 배송 요청 횟수
                      </FieldLabel>
                      <Input
                        id={"expect-" + c.id}
                        type="number"
                        min={0}
                        max={1}
                        value={expectations[i]}
                        disabled={busy}
                        onChange={(e) => {
                          setExpectations(
                            expectations.map((v, n) =>
                              n === i ? e.target.value : v,
                            ),
                          );
                          setConfirmed(false);
                        }}
                      />
                      <FieldDescription>
                        {c.input} · 기대 재고 {c.stock}
                      </FieldDescription>
                    </Field>
                  ))}
                </FieldGroup>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button
                    disabled={
                      busy ||
                      !rule.trim() ||
                      expectations.some(
                        (v, i) => v !== String(cases[i].delivery),
                      )
                    }
                    onClick={() => setConfirmed(true)}
                  >
                    <Check data-icon="inline-start" />
                    샘플 기준 확정
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      setExpectations(cases.map((c) => String(c.delivery)));
                      setConfirmed(false);
                    }}
                  >
                    <RotateCcw data-icon="inline-start" />
                    기대값 복원
                  </Button>
                  <span className="type-body-xs text-interface-secondary">
                    고정 시나리오의 기대값과 일치할 때 시연할 수 있어요.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="setup">
          <div className="mt-4 flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
              <Card variant="panel">
                <CardHeader>
                  <CardTitle>검증 환경 설정</CardTitle>
                  <CardDescription>
                    기존 환경과 업데이트할 후보를 준비합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="app-name">앱 이름 · 필수</FieldLabel>
                      <Input
                        id="app-name"
                        value={appName}
                        disabled={busy}
                        aria-invalid={!appName.trim()}
                        onChange={(e) => setAppName(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>검증 대상</FieldLabel>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline">Node-RED</Badge>
                        <span className="type-code-md">Version A</span>
                        <ArrowRight className="size-4 text-interface-muted" />
                        <span className="type-code-md">Version B</span>
                      </div>
                      <FieldDescription>
                        팀 제공 이미지 2개로 구성한 시연 환경입니다. 실제 이미지
                        버전은 API 연결 시 표시합니다.
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="notification-email">
                        결과 수신 이메일 · 필수
                      </FieldLabel>
                      <Input
                        id="notification-email"
                        type="email"
                        value={email}
                        disabled={busy}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                      />
                      <FieldDescription>
                        화면 입력 확인용이며 이메일은 전송하지 않습니다.
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="env-name">
                        필수 환경변수 · APP_NAME
                      </FieldLabel>
                      <Input id="env-name" value={appName} readOnly />
                      <FieldDescription>
                        앱 이름을 변경하면 함께 반영됩니다. 비밀값은 이 데모에서
                        입력받지 않습니다.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                  <div className="mt-6">
                    <Button
                      onClick={() => setParams({ tab: "tests" })}
                      disabled={!valid}
                    >
                      테스트 확인으로
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <aside className="flex flex-col gap-4">
                <h2 className="type-heading-sm">검증 범위</h2>
                <p className="type-body-md text-interface-secondary">
                  기존 환경을 복제한 후보에만 변경을 적용하고, 동일한 입력으로
                  업무 규칙을 비교합니다.
                </p>
                <Separator />
                <ul className="flex flex-col gap-3 type-body-sm text-interface-secondary">
                  <li>운영 서버는 변경하지 않음</li>
                  <li>결제·배송은 모의 서비스 사용</li>
                  <li>검증 작업은 한 번에 1건</li>
                  <li>설정은 현재 화면에서만 유지</li>
                </ul>
              </aside>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
