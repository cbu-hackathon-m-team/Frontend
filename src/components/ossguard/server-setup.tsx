import { useEffect, useState } from "react";
import { GitBranch, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  errorText,
  type ApiProject,
  type ExecutionProfile,
  type GuardApi,
} from "./api";

export function ServerSetup({
  api,
  project,
  packageName,
  target,
  onPackage,
  onTarget,
  onReload,
  onNext,
}: {
  api: GuardApi;
  project: ApiProject;
  packageName: string;
  target: string;
  onPackage: (value: string) => void;
  onTarget: (value: string) => void;
  onReload: (suiteId?: string) => Promise<void>;
  onNext: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [profile, setProfile] = useState(project.execution_profile);
  const [environment, setEnvironment] = useState(project.environment_profile);
  const [email, setEmail] = useState(project.notification.email ?? "");
  const [versions, setVersions] = useState<string[]>([]),
    [versionsError, setVersionsError] = useState("");
  const dependencies = project.inspection.dependencies ?? [];
  const dependency = dependencies.find((d) => d.name === packageName);
  useEffect(() => {
    setVersions([]);
    setVersionsError("");
    if (!packageName) return;
    const controller = new AbortController();
    api
      .request<{ versions: string[] }>(
        `/api/projects/${project.id}/dependencies/${encodeURIComponent(packageName)}/versions`,
        "GET",
        undefined,
        controller.signal,
      )
      .then((v) => setVersions(v.versions))
      .catch((e) => {
        if (!controller.signal.aborted) setVersionsError(errorText(e));
      });
    return () => controller.abort();
  }, [api, packageName, project.id]);
  async function inspect() {
    setBusy(true);
    setError("");
    try {
      const result = await api.request<{ suite_id: string | null }>(
        `/api/projects/${project.id}/inspect`,
        "POST",
      );
      await onReload(result.suite_id ?? undefined);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      await api.request(
        `/api/projects/${project.id}/execution-profile`,
        "PUT",
        profile,
      );
      await api.request(
        `/api/projects/${project.id}/environment-profile`,
        "PUT",
        {
          values: environment.values ?? {},
          secret_refs: environment.secret_refs ?? {},
        },
      );
      await api.request(
        `/api/projects/${project.id}/notification-settings`,
        "PUT",
        { enabled: !!email.trim(), email: email.trim() },
      );
      await onReload();
      toast.success("실행 설정을 저장했습니다.");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  function changeProfile(value: Partial<ExecutionProfile>) {
    setProfile({ ...profile, ...value });
  }
  return (
    <div className="flex min-w-0 flex-col gap-5">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card variant="panel">
        <CardHeader className="px-5 py-4 md:px-5">
          <CardTitle>GitHub 소스</CardTitle>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4 px-5 md:px-5 md:pb-5">
          <p className="break-all type-code-sm">{project.repository_url}</p>
          <div className="flex flex-wrap items-center gap-3 type-body-sm">
            <GitBranch className="size-4" />
            {project.ref}
            <Badge variant={project.commit_sha ? "success" : "muted"}>
              {project.commit_sha ? "소스 확인됨" : "확인 전"}
            </Badge>
          </div>
          {project.commit_sha && (
            <p className="break-all type-code-sm text-interface-secondary">
              {project.commit_sha}
            </p>
          )}
          <div>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void inspect()}
            >
              <Search />
              {busy
                ? "처리 중…"
                : project.commit_sha
                  ? "소스 다시 확인"
                  : "소스 확인"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {project.commit_sha && (
        <>
          <Card variant="panel">
            <CardHeader className="px-5 py-4 md:px-5">
              <CardTitle>의존성 업데이트</CardTitle>
            </CardHeader>
            <CardContent className="px-5 md:px-5 md:pb-5">
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="dependency-name">직접 의존성</FieldLabel>
                  <Select
                    value={packageName}
                    onValueChange={onPackage}
                    disabled={busy}
                  >
                    <SelectTrigger id="dependency-name" className="w-full">
                      <SelectValue placeholder="패키지 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {dependencies.map((d) => (
                          <SelectItem key={d.name} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {dependency && (
                    <FieldDescription>
                      선언 {dependency.declaration} · 잠금{" "}
                      {dependency.locked_version}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="target-version">목표 버전</FieldLabel>
                  <Input
                    id="target-version"
                    value={target}
                    onChange={(e) => onTarget(e.target.value)}
                    list="pypi-versions"
                    disabled={!packageName || busy}
                    placeholder="배포 버전 선택 또는 입력"
                  />
                  <datalist id="pypi-versions">
                    {versions.map((v) => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                  <FieldDescription>
                    {versionsError ||
                      (versions.length
                        ? "PyPI 배포 버전 확인됨"
                        : "버전은 실행 접수 시 다시 확인합니다.")}
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
          <Card variant="panel">
            <CardHeader className="px-5 py-4 md:px-5">
              <CardTitle>실행 환경</CardTitle>
            </CardHeader>
            <CardContent className="px-5 md:px-5 md:pb-5">
              <form
                className="flex flex-col gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  void save();
                }}
              >
                <FieldGroup className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="server-port">앱 포트</FieldLabel>
                    <Input
                      id="server-port"
                      type="number"
                      required
                      min={1024}
                      max={65535}
                      value={profile.app_port ?? 8000}
                      onChange={(e) =>
                        changeProfile({ app_port: Number(e.target.value) })
                      }
                      disabled={busy}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="server-health">
                      준비 확인 경로
                    </FieldLabel>
                    <Input
                      id="server-health"
                      required
                      value={profile.health_path ?? "/health"}
                      onChange={(e) =>
                        changeProfile({ health_path: e.target.value })
                      }
                      disabled={busy}
                    />
                  </Field>
                </FieldGroup>
                {Object.entries(profile.env_schema ?? {}).map(
                  ([name, definition]) => (
                    <Field key={name}>
                      <FieldLabel htmlFor={`server-env-${name}`}>
                        {name}
                        {definition.secret ? " · Secret 버전 참조" : ""}
                      </FieldLabel>
                      <Input
                        id={`server-env-${name}`}
                        disabled={busy || definition.source === "runner_mock"}
                        required={definition.required}
                        value={
                          definition.source === "runner_mock"
                            ? "WireMock 자동 주입"
                            : ((definition.secret
                                ? environment.secret_refs?.[name]
                                : environment.values?.[name]) ?? "")
                        }
                        placeholder={
                          definition.secret
                            ? "projects/…/secrets/…/versions/1"
                            : ""
                        }
                        onChange={(e) => {
                          const group = definition.secret
                            ? "secret_refs"
                            : "values";
                          setEnvironment({
                            ...environment,
                            [group]: {
                              ...environment[group],
                              [name]: e.target.value,
                            },
                          });
                        }}
                      />
                    </Field>
                  ),
                )}
                <Field>
                  <FieldLabel htmlFor="server-email">
                    결과 이메일 · 선택
                  </FieldLabel>
                  <Input
                    id="server-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    disabled={busy}
                  />
                </Field>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" disabled={busy}>
                    {busy ? "저장 중…" : "실행 설정 저장"}
                  </Button>
                  <Button type="button" onClick={onNext} disabled={busy}>
                    업무 테스트 검토
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
