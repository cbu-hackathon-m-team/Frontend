import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, CircleDashed, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { ValidationDetail } from "./validation-detail";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { GuardResults } from "./guard-results";
import { GuardSetup, validSetup } from "./guard-setup";
import { TestEditor, validTests } from "./test-editor";
import { unobservedRun } from "./workflow";
import { compareRecordedSample } from "./comparison";
import { initialDraft, readDraft, writeDraft, type GuardDraft } from "./draft";
import { type ValidationProject } from "./model";
import { ProjectOverview } from "./project-overview";
import { ValidationRuns } from "./validation-runs";

const phases = [
  "입력·기대값 확인",
  "기준 A 기록 불러오기",
  "후보 B 기록 불러오기",
  "단계·호출·결과 비교",
];
export function GuardConsole({
  project,
  templates = [],
}: {
  project: ValidationProject;
  templates?: ValidationProject[];
}) {
  const [params, setParams] = useSearchParams();
  const route = useNavigate();
  const requested = params.get("tab") ?? "overview";
  const tab = ["overview", "runs", "results", "tests", "setup"].includes(
    requested,
  )
    ? requested
    : "overview";
  const [loaded] = useState(() => {
    try {
      return { draft: readDraft(project), error: "" };
    } catch {
      return {
        draft: initialDraft(project),
        error:
          "저장된 검증 설정을 읽지 못했습니다. 기존 데이터를 보호하기 위해 편집을 중지했습니다.",
      };
    }
  });
  const [draft, setDraft] = useState(loaded.draft);
  const [error, setError] = useState(loaded.error);
  const [progress, setProgress] = useState<number | null>(null);
  const [preview, setPreview] = useState<GuardDraft["latest"]>();
  const [pending, setPending] = useState<GuardDraft | null>(null);
  const p = draft.definition;
  const busy = progress !== null;
  const blocked = !!loaded.error;
  const configured = validSetup(p);
  const ready = configured && draft.confirmed && validTests(p.cases);
  const sample = p.samples.find((s) => s.id === draft.scenario);
  function navigate(next: string) {
    setParams({ project: project.id, tab: next });
  }
  function persist(next: GuardDraft) {
    if (blocked) return false;
    setDraft(next);
    try {
      writeDraft(next);
      setError("");
      return true;
    } catch {
      setError(
        "브라우저에 저장하지 못했습니다. 입력은 화면에 유지되며 다시 저장할 수 있습니다.",
      );
      return false;
    }
  }
  function changeDefinition(definition: ValidationProject, invalidate = false) {
    setPreview(undefined);
    persist({
      ...draft,
      definition,
      confirmed: invalidate ? false : draft.confirmed,
    });
  }
  function loadTemplate(template: ValidationProject) {
    persist({
      ...draft,
      definition: {
        ...template,
        id: project.id,
        name: project.name,
        description: project.description,
      },
      scenario: template.defaultSample,
      confirmed: false,
    });
  }
  async function start() {
    if (!ready || busy || blocked) return;
    setPreview(undefined);
    if (!sample) return;
    const snapshot = structuredClone(p);
    const next = {
      ...draft,
      run: draft.run + 1,
      latest: {
        definition: snapshot,
        result: compareRecordedSample(snapshot, sample, snapshot.cases),
      },
    };
    if (!persist(draft)) return;
    setPending(next);
    setProgress(0);
    navigate("results");
  }
  useEffect(() => {
    if (progress === null || !pending) return;
    const timer = window.setTimeout(() => {
      if (progress === phases.length - 1) {
        setDraft(pending);
        try {
          writeDraft(pending);
          setError("");
        } catch {
          setError(
            "결과를 저장하지 못했습니다. 현재 화면에서 확인할 수 있습니다.",
          );
        }
        setPending(null);
        setProgress(null);
      } else setProgress(progress + 1);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [progress, pending]);
  return (
    <section
      className="flex min-w-0 flex-col gap-5 break-keep"
      aria-labelledby="guard-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              id="guard-title"
              className="type-heading-xl text-interface-contrast"
            >
              {
                {
                  overview: project.name,
                  runs: "검증 실행",
                  setup: "실행 설정",
                  tests: "업무 테스트",
                  results: "검증 결과",
                }[tab]
              }
            </h1>
            <Badge variant="muted">
              {p.samples.length
                ? p.repository
                  ? "화면 예시"
                  : "샘플 기록"
                : draft.latest?.result.awaitingResults
                  ? "결과 수집 대기"
                  : "실행기 미연결"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(tab === "overview" || tab === "runs") && (
            <>
              {ready && !sample && (
                <Button
                  variant="outline"
                  disabled={busy || blocked}
                  onClick={() => {
                    setPreview({
                      definition: structuredClone(p),
                      result: unobservedRun(
                        p,
                        "입력과 기대 동작을 확인하는 화면입니다. A/B 환경은 아직 실행하지 않았습니다.",
                      ),
                    });
                    navigate("results");
                  }}
                >
                  비교 화면 미리보기
                </Button>
              )}
              <Button
                onClick={() =>
                  ready
                    ? sample
                      ? void start()
                      : route(
                          `/dashboard?import=${encodeURIComponent(project.id)}`,
                        )
                    : navigate(configured ? "tests" : "setup")
                }
                disabled={busy || blocked}
              >
                {ready && <Play data-icon="inline-start" />}
                {ready
                  ? sample
                    ? "샘플 기록 비교"
                    : "서버에 등록"
                  : configured
                    ? "테스트 검토·확정"
                    : "실행 설정 작성"}
              </Button>
            </>
          )}
          {tab === "results" && project.samples.length > 0 && !busy && (
            <Select
              value={draft.scenario}
              onValueChange={(scenario) => {
                const result = project.samples.find((s) => s.id === scenario)!;
                setPreview(undefined);
                persist({
                  ...draft,
                  scenario,
                  latest: { definition: project, result },
                });
              }}
            >
              <SelectTrigger aria-label="결과 화면 예시">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {project.samples.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          {tab === "results" && !busy && (
            <Button variant="outline" onClick={() => navigate("setup")}>
              후보 변경·재검증
              <ArrowRight data-icon="inline-end" />
            </Button>
          )}
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {tab === "overview" && (
        <ProjectOverview
          draft={draft}
          configured={configured}
          navigate={navigate}
        />
      )}
      {tab === "runs" && (
        <ValidationRuns
          latest={draft.latest}
          run={draft.run}
          onOpen={() => navigate("results")}
          onSetup={() => navigate("setup")}
        />
      )}
      {tab === "setup" && (
        <GuardSetup
          project={p}
          templates={p.samples.length ? templates : []}
          scenario={draft.scenario}
          email={draft.email}
          busy={busy || blocked}
          onChange={(definition) => changeDefinition(definition)}
          onTemplate={loadTemplate}
          onScenario={(scenario) => persist({ ...draft, scenario })}
          onEmail={(email) => persist({ ...draft, email })}
          onNext={() => navigate("tests")}
        />
      )}
      {tab === "tests" && (
        <TestEditor
          project={p}
          confirmed={draft.confirmed}
          busy={busy || blocked}
          onChange={(definition) => changeDefinition(definition, true)}
          onConfirm={() => {
            if (persist({ ...draft, confirmed: true })) navigate("overview");
          }}
        />
      )}
      {tab === "results" &&
        (busy ? (
          <Card variant="panel">
            <CardHeader>
              <CardTitle>
                {sample ? "기준 A와 후보 B 비교 중" : "검증 실행 요청 중"}
              </CardTitle>
              <CardDescription>
                {sample
                  ? "실제 서버 실행 없이 저장된 샘플 기록을 비교합니다."
                  : "실행기 연결과 검증 작업 접수를 확인합니다."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-5" aria-label="검증 진행 단계">
                {(sample ? phases : ["실행 요청 접수 확인"]).map((phase, i) => (
                  <li
                    key={phase}
                    className={cn(
                      "flex items-center gap-3 type-body-md",
                      i > progress && "text-interface-muted",
                    )}
                  >
                    {i < progress ? (
                      <CheckCircle2 className="size-4 text-signal-success" />
                    ) : (
                      <CircleDashed className="size-4" />
                    )}
                    {phase}
                    {i === progress && <Badge variant="outline">진행 중</Badge>}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ) : preview || draft.latest ? (
          (preview ?? draft.latest)!.definition.repository ? (
            <ValidationDetail
              project={(preview ?? draft.latest)!.definition}
              result={(preview ?? draft.latest)!.result}
              run={draft.run}
            />
          ) : (
            <GuardResults
              project={(preview ?? draft.latest)!.definition}
              result={(preview ?? draft.latest)!.result}
              run={draft.run}
            />
          )
        ) : (
          <Card variant="panel">
            <CardHeader>
              <CardTitle>아직 비교 결과가 없습니다</CardTitle>
              <CardDescription>
                대상과 테스트를 설정한 뒤 검증을 시작하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("overview")}>
                검증 준비로 이동
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardContent>
          </Card>
        ))}
    </section>
  );
}
