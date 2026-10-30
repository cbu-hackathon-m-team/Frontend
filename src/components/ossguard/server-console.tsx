import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Play, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Card, CardContent } from "@/components/ui/card";
import { useBackend } from "./backend-context";
import { BackendConnection } from "./backend-workspace";
import {
  activeRun,
  errorText,
  statusLabel,
  ApiError,
  type ApiProject,
  type ApiRun,
  type RunEvidence,
  type Suite,
} from "./api";
import {
  projectPresentation,
  runPresentation,
  verdictLabel,
  phaseLabel,
} from "./api-presentation";
import { ValidationDetail } from "./validation-detail";
import { ServerSetup } from "./server-setup";
import { ServerTests } from "./server-tests";
import { ProjectOverview } from "./project-overview";
import type { GuardDraft } from "./draft";
import { purchaseDemo } from "./execution-defaults";

interface Selection {
  packageName: string;
  target: string;
  suiteId?: string;
}
function readSelection(id: string, project?: ApiProject): Selection {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(`ossguard.selection.${id}`) ?? "{}",
    );
    const dependencies = project?.inspection.dependencies ?? [];
    const packageName =
      (typeof value.packageName === "string" ? value.packageName : "") ||
      (dependencies.length === 1 ? dependencies[0].name : "");
    return {
      packageName,
      target:
        (typeof value.target === "string" ? value.target : "") ||
        (project?.repository_url === purchaseDemo.repository &&
        packageName === purchaseDemo.packageName
          ? purchaseDemo.targetVersion
          : ""),
      suiteId: typeof value.suiteId === "string" ? value.suiteId : undefined,
    };
  } catch {
    return { packageName: "", target: "" };
  }
}
export function ServerConsole({ id }: { id: string }) {
  const { api, refresh } = useBackend();
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab") || "overview";
  const tab = ["overview", "runs", "results", "setup", "tests"].includes(
    requested,
  )
    ? requested
    : "overview";
  const runId = params.get("run");
  const [selection, setSelection] = useState(() => readSelection(id));
  const [project, setProject] = useState<ApiProject>();
  const [suite, setSuite] = useState<Suite>({
    cases: [],
    stubs: [],
    approved: false,
  });
  const [rule, setRule] = useState("");
  const [dirty, setDirty] = useState(false);
  const [runs, setRuns] = useState<ApiRun[]>([]);
  const [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [detail, setDetail] = useState<{
    job: ApiRun;
    evidence: RunEvidence;
  }>();
  const [pollError, setPollError] = useState("");
  const [retry, setRetry] = useState(0);
  const pending = useRef<{ signature: string; key: string } | null>(null);
  function choose(value: Selection) {
    setSelection(value);
    try {
      sessionStorage.setItem(`ossguard.selection.${id}`, JSON.stringify(value));
    } catch {
      /* Selection remains in memory. */
    }
  }
  function navigate(next: string, execution?: string) {
    setParams({
      project: id,
      tab: next,
      ...(execution ? { run: execution } : {}),
    });
  }
  const reload = useCallback(
    async (suiteId?: string) => {
      if (!api) return;
      const [p, history] = await Promise.all([api.project(id), api.runs(id)]);
      setProject(p);
      setRuns(history);
      setRule(
        p.rules.description ??
          (p.repository_url === purchaseDemo.repository
            ? purchaseDemo.rule
            : ""),
      );
      const preferred = suiteId ?? readSelection(id).suiteId;
      const tests = p.test_suites?.find((s) => s.id === preferred) ??
        p.test_suites?.[0] ?? { cases: [], stubs: [], approved: false };
      setSuite(tests);
      setDirty(false);
      setLoaded(true);
      setError("");
      const next = {
        ...readSelection(id, p),
        ...(suiteId ? { suiteId } : {}),
      };
      setSelection(next);
      try {
        sessionStorage.setItem(
          `ossguard.selection.${id}`,
          JSON.stringify(next),
        );
      } catch {
        /* Selection remains in memory. */
      }
    },
    [api, id],
  );
  useEffect(() => {
    if (!api) return;
    const controller = new AbortController();
    Promise.all([
      api.project(id, controller.signal),
      api.runs(id, controller.signal),
    ])
      .then(([p, history]) => {
        setProject(p);
        setSelection(readSelection(id, p));
        setRuns(history);
        setRule(
          p.rules.description ??
            (p.repository_url === purchaseDemo.repository
              ? purchaseDemo.rule
              : ""),
        );
        const preferred = readSelection(id).suiteId;
        setSuite(
          p.test_suites?.find((s) => s.id === preferred) ??
            p.test_suites?.[0] ?? { cases: [], stubs: [], approved: false },
        );
        setLoaded(true);
        setError("");
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setError(errorText(e));
          setLoaded(true);
        }
      });
    return () => controller.abort();
  }, [api, id]);
  const selectedRun = runId ?? runs[0]?.id;
  useEffect(() => {
    if (!api || !selectedRun) return;
    const controller = new AbortController();
    let timer: number | undefined;
    async function poll() {
      try {
        const [job, evidence] = await Promise.all([
          api!.run(selectedRun!, controller.signal),
          api!.evidence(selectedRun!, controller.signal),
        ]);
        if (controller.signal.aborted) return;
        if (job.project_id !== id) {
          setPollError("이 프로젝트의 실행이 아닙니다.");
          return;
        }
        setDetail({ job, evidence });
        setPollError("");
        setRuns((current) =>
          [job, ...current.filter((r) => r.id !== job.id)].sort((a, b) =>
            b.created_at.localeCompare(a.created_at),
          ),
        );
        if (
          activeRun(job) ||
          ["PENDING", "RUNNING"].includes(job.analysis_status) ||
          job.notification_statuses?.some((s) =>
            ["PENDING", "SENDING"].includes(s),
          )
        )
          timer = window.setTimeout(() => void poll(), 2000);
      } catch (e) {
        if (!controller.signal.aborted) setPollError(errorText(e));
      }
    }
    void poll();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [api, selectedRun, id, retry]);
  async function start() {
    if (!api || !project || !suite.id || busy) return;
    setBusy(true);
    setError("");
    const signature = JSON.stringify({
      project: id,
      revision: project.revision,
      suite: suite.id,
      suite_revision: suite.revision,
      ...selection,
    });
    if (pending.current?.signature !== signature)
      pending.current = { signature, key: crypto.randomUUID() };
    try {
      const submitted = await api.request<{ id: string }>(
        "/api/validations",
        "POST",
        {
          project_id: id,
          package: selection.packageName,
          target_version: selection.target,
          suite_id: suite.id,
          idempotency_key: pending.current.key,
        },
      );
      if (typeof submitted.id !== "string" || !submitted.id)
        throw new ApiError(
          "INVALID_RESPONSE",
          "실행 접수 응답에 ID가 없습니다. 실행 목록에서 접수 여부를 확인하세요.",
        );
      pending.current = null;
      setDetail(undefined);
      navigate("results", submitted.id);
      setRetry((r) => r + 1);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  if (!api)
    return (
      <div className="flex flex-col gap-5">
        <h1 className="type-heading-xl">검증 서버 연결</h1>
        <BackendConnection />
      </div>
    );
  if (!loaded)
    return (
      <p role="status" className="type-body-md text-interface-secondary">
        프로젝트를 불러오는 중…
      </p>
    );
  if (!project)
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error || "프로젝트를 찾을 수 없습니다."}
          <Button variant="link" asChild>
            <Link to="/dashboard">프로젝트 목록</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  const presentation =
    detail && detail.job.id === selectedRun
      ? runPresentation(project, detail.job, detail.evidence)
      : undefined;
  const currentDefinition = projectPresentation(
    project,
    suite,
    selection.packageName,
    selection.target,
  );
  const ready =
    !!project.commit_sha &&
    !!suite.id &&
    suite.approved &&
    !dirty &&
    !!selection.packageName &&
    !!selection.target;
  const hasActive = runs.some(activeRun);
  const latest = detail?.job.id === runs[0]?.id ? presentation : undefined;
  const draft: GuardDraft = {
    version: 1,
    definition: currentDefinition,
    confirmed: suite.approved && !dirty,
    email: project.notification.email ?? "",
    scenario: "",
    run: runs.length,
    latest,
  };
  return (
    <section
      className="flex min-w-0 flex-col gap-5"
      aria-labelledby="server-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 id="server-title" className="type-heading-xl">
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
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tab === "results" && (
            <Button variant="ghost" onClick={() => navigate("runs")}>
              <ArrowLeft />
              실행 목록
            </Button>
          )}
          {(tab === "overview" || tab === "runs") && (
            <Button
              disabled={busy || hasActive}
              onClick={() =>
                ready
                  ? void start()
                  : navigate(
                      project.commit_sha &&
                        selection.packageName &&
                        selection.target
                        ? "tests"
                        : "setup",
                    )
              }
            >
              <Play />
              {busy
                ? "접수 중…"
                : hasActive
                  ? "검증 진행 중"
                  : ready
                    ? "검증 시작"
                    : project.commit_sha
                      ? selection.packageName && selection.target
                        ? "테스트 검토"
                        : "업데이트 설정"
                      : "소스 확인"}
            </Button>
          )}
          {tab === "results" && (
            <Button
              variant="outline"
              disabled={busy || hasActive}
              onClick={() => navigate("setup")}
            >
              후보 변경·재검증
              <ArrowRight />
            </Button>
          )}
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {pollError && (
        <Alert variant="destructive">
          <AlertDescription>
            <span>{pollError}</span>
            <Button variant="link" onClick={() => setRetry((v) => v + 1)}>
              다시 조회
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {tab === "overview" && runs.length > 0 && !latest && (
        <p role="status" className="type-body-sm text-interface-secondary">
          최근 검증을 불러오는 중…
        </p>
      )}
      {tab === "overview" && (!runs.length || latest) && (
        <ProjectOverview
          draft={draft}
          configured={
            !!project.commit_sha &&
            !!selection.packageName &&
            !!selection.target
          }
          navigate={(next) =>
            navigate(next, next === "results" ? runs[0]?.id : undefined)
          }
        />
      )}
      {tab === "setup" && (
        <ServerSetup
          key={project.revision}
          api={api}
          project={project}
          packageName={selection.packageName}
          target={selection.target}
          onPackage={(packageName) =>
            choose({ ...selection, packageName, target: "" })
          }
          onTarget={(target) => choose({ ...selection, target })}
          onReload={async (suiteId) => {
            await reload(suiteId);
            await refresh();
          }}
          onNext={() => navigate("tests")}
        />
      )}
      {tab === "tests" && (
        <ServerTests
          key={suite.id ?? "new"}
          api={api}
          projectId={id}
          suite={suite}
          rule={rule}
          inputSchema={project.rules.input_schema}
          dirty={dirty}
          onChange={(value) => {
            setSuite(value);
            setDirty(true);
          }}
          onRule={(value) => {
            setRule(value);
            setDirty(true);
          }}
          onSaved={(value) => {
            setSuite(value);
            setDirty(false);
            choose({ ...selection, suiteId: value.id });
          }}
        />
      )}
      {tab === "runs" && (
        <div className="flex min-w-0 flex-col gap-3">
          {runs.length === 0 ? (
            <Empty variant="panel">
              <EmptyHeader>
                <EmptyTitle>아직 검증 실행이 없습니다</EmptyTitle>
                <EmptyDescription>
                  {ready
                    ? "검증 시작을 누르면 새 실행이 여기에 표시됩니다."
                    : "소스를 확인하고 테스트를 승인한 뒤 검증을 시작하세요."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            runs.map((run) => (
              <Card variant="panel" key={run.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5 md:p-5">
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="type-code-sm">{run.id.slice(0, 8)}</span>
                      {run.snapshot.baseline_version === run.target_version && (
                        <Badge variant="outline">대조군</Badge>
                      )}
                      <Badge
                        variant={
                          activeRun(run)
                            ? "warning"
                            : run.verdict === "PASS"
                              ? "success"
                              : run.verdict === "REGRESSION_SUSPECTED"
                                ? "error"
                                : "muted"
                        }
                      >
                        {activeRun(run)
                          ? statusLabel[run.execution_status]
                          : run.error_code
                            ? "실행 실패"
                            : verdictLabel[run.verdict]}
                      </Badge>
                      <time
                        className="type-body-xs text-interface-secondary"
                        dateTime={run.created_at}
                      >
                        {new Date(run.created_at).toLocaleString("ko-KR")}
                      </time>
                    </div>
                    <p className="break-all type-body-sm text-interface-secondary">
                      {run.package} {run.snapshot.baseline_version} →{" "}
                      {run.target_version} · {phaseLabel(run.phase)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate("results", run.id)}
                  >
                    실행 상세
                    <ArrowRight />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
          <div>
            <Button
              variant="ghost"
              onClick={async () => {
                try {
                  setRuns(await api.runs(id));
                  setError("");
                } catch (e) {
                  setError(errorText(e));
                }
              }}
            >
              <RefreshCw />
              새로고침
            </Button>
          </div>
        </div>
      )}
      {tab === "results" &&
        (presentation ? (
          <ValidationDetail
            project={presentation.definition}
            result={presentation.result}
            run={runs.findIndex((r) => r.id === detail?.job.id) + 1}
          />
        ) : selectedRun ? (
          <p role="status" className="type-body-md text-interface-secondary">
            실행 증거를 불러오는 중…
          </p>
        ) : (
          <Empty variant="panel">
            <EmptyHeader>
              <EmptyTitle>아직 실행한 검증이 없습니다</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ))}
    </section>
  );
}
