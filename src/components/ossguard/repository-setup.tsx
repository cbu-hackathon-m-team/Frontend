import { useState } from "react";
import { ArrowRight, GitBranch, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import type { ValidationProject } from "./model";

const githubUrl = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
export function repositoryReady(p: ValidationProject) {
  return !!(
    p.repository &&
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(p.repository.url) &&
    p.repository.ref.trim() &&
    p.update?.packageName.trim() &&
    p.update.targetVersion.trim() &&
    /^(GET|POST|PUT|PATCH|DELETE)\s+\/\S*$/i.test(p.connection?.entry ?? "") &&
    p.executionProfile?.dockerfile.trim() &&
    p.executionProfile?.healthPath.startsWith("/") &&
    Number.isInteger(p.executionProfile.port) &&
    p.executionProfile.port > 0 &&
    p.executionProfile.port <= 65535 &&
    p.executionProfile.variables.every(
      (v) =>
        /^[A-Za-z_][A-Za-z0-9_]*$/.test(v.name) &&
        (!v.required || v.kind === "mock" || v.value.trim()),
    )
  );
}
export function RepositorySetup({
  project: p,
  email,
  busy,
  onChange,
  onEmail,
  onNext,
}: {
  project: ValidationProject;
  email: string;
  busy: boolean;
  onChange: (p: ValidationProject) => void;
  onEmail: (email: string) => void;
  onNext: () => void;
}) {
  const repo = p.repository ?? {
    url: "",
    ref: "main",
    inspection: "unchecked" as const,
  };
  const update = p.update ?? {
    ecosystem: "python-uv",
    packageName: "",
    declared: "",
    locked: "",
    targetVersion: "",
  };
  const profile = p.executionProfile ?? {
    dockerfile: "Dockerfile.ossguard",
    port: 8000,
    healthPath: "/health",
    variables: [],
  };
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState("");
  const disabled = busy || checking;
  const changeRepo = (next: typeof repo) =>
    onChange({
      ...p,
      repository: { ...next, sha: undefined, inspection: "unchecked" },
      target: {
        ...p.target,
        id: "python-uv",
        name: "Python / uv",
        adapter: "python-uv",
        source: next.url,
      },
    });
  const changeUpdate = (next: typeof update) =>
    onChange({
      ...p,
      update: next,
      baseline: {
        ...p.baseline,
        label: next.locked
          ? `${next.packageName} ${next.locked}`
          : "잠금 버전 확인 전",
      },
      candidate: {
        ...p.candidate,
        label: `${next.packageName || "의존성"} ${next.targetVersion || "목표 버전 미설정"}`,
      },
    });
  async function inspect() {
    setChecking(true);
    setNotice("");
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(p.id)}/inspect`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: repo.url, ref: repo.ref }),
        },
      );
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("application/json")
      )
        throw new Error();
      const data = (await response.json()) as { sha?: string };
      if (!data.sha || !/^[a-f0-9]{40}$/i.test(data.sha)) throw new Error();
      onChange({
        ...p,
        repository: { ...repo, sha: data.sha, inspection: "verified" },
      });
      setNotice(
        "커밋을 고정했습니다. 의존성 목록·지원 규격 확인은 API 연동 후 제공됩니다.",
      );
    } catch {
      setNotice(
        "소스 확인 API에 연결하지 못했습니다. 입력은 저장되며 SHA·파일·버전은 확인 전으로 유지됩니다.",
      );
    } finally {
      setChecking(false);
    }
  }
  return (
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_240px]">
      <div className="flex min-w-0 flex-col gap-5">
        <Card variant="panel">
          <CardHeader>
            <CardTitle>GitHub 소스</CardTitle>
            <CardDescription>
              기준 커밋은 하나, 후보는 해당 소스의 의존성을 변경해 만듭니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="repository-url">
                  공개 저장소 URL
                </FieldLabel>
                <Input
                  id="repository-url"
                  value={repo.url}
                  placeholder="https://github.com/team/service"
                  disabled={disabled}
                  onChange={(e) => changeRepo({ ...repo, url: e.target.value })}
                />
              </Field>
              <FieldGroup className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Field>
                  <FieldLabel htmlFor="repository-ref">
                    브랜치·태그·커밋
                  </FieldLabel>
                  <Input
                    id="repository-ref"
                    value={repo.ref}
                    disabled={disabled}
                    onChange={(e) =>
                      changeRepo({ ...repo, ref: e.target.value })
                    }
                  />
                </Field>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    disabled={disabled || !githubUrl.test(repo.url)}
                    onClick={() => void inspect()}
                  >
                    <Search data-icon="inline-start" />
                    {checking ? "확인 중" : "소스 확인"}
                  </Button>
                </div>
              </FieldGroup>
              <div className="flex min-w-0 flex-wrap items-center gap-2 type-code-sm">
                <GitBranch className="size-4 shrink-0" />
                <span className="break-all">{repo.sha ?? "SHA 확인 전"}</span>
                <Badge
                  variant={repo.inspection === "verified" ? "success" : "muted"}
                >
                  {repo.inspection === "verified" ? "커밋 고정" : "미확인"}
                </Badge>
              </div>
              {notice && (
                <Alert>
                  <AlertDescription>{notice}</AlertDescription>
                </Alert>
              )}
            </FieldGroup>
          </CardContent>
        </Card>
        <Card variant="panel">
          <CardHeader>
            <CardTitle>업데이트할 의존성</CardTitle>
            <CardDescription>
              직접 의존성 하나의 목표 배포 버전을 지정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="package-name">PyPI 패키지</FieldLabel>
                  <Input
                    id="package-name"
                    value={update.packageName}
                    placeholder="패키지 이름"
                    disabled={disabled}
                    onChange={(e) =>
                      changeUpdate({ ...update, packageName: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="target-version">목표 버전 B</FieldLabel>
                  <Input
                    id="target-version"
                    value={update.targetVersion}
                    placeholder="배포 버전"
                    disabled={disabled}
                    onChange={(e) =>
                      changeUpdate({ ...update, targetVersion: e.target.value })
                    }
                  />
                </Field>
              </FieldGroup>
              <div className="grid gap-4 rounded-lg bg-surface-canvas p-4 sm:grid-cols-2">
                <div>
                  <p className="type-body-xs text-interface-muted">
                    pyproject.toml 선언
                  </p>
                  <p className="mt-1 break-all type-code-sm">
                    {update.declared || "소스 확인 후 수집"}
                  </p>
                </div>
                <div>
                  <p className="type-body-xs text-interface-muted">
                    uv.lock 잠금 버전 A
                  </p>
                  <p className="mt-1 type-code-sm">
                    {update.locked || "소스 확인 후 수집"}
                  </p>
                </div>
              </div>
              <FieldDescription>
                입력한 목표 버전의 존재 여부는 확인 전입니다. 잠금 버전과 실제
                설치 버전은 구분해 표시합니다.
              </FieldDescription>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card variant="panel">
          <CardHeader>
            <CardTitle>빌드·HTTP 실행</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="dockerfile">Dockerfile</FieldLabel>
                <Input
                  id="dockerfile"
                  value={profile.dockerfile}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({
                      ...p,
                      executionProfile: {
                        ...profile,
                        dockerfile: e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="app-port">앱 포트</FieldLabel>
                  <Input
                    id="app-port"
                    type="number"
                    min={1}
                    max={65535}
                    value={profile.port}
                    disabled={disabled}
                    onChange={(e) =>
                      onChange({
                        ...p,
                        executionProfile: {
                          ...profile,
                          port: Number(e.target.value),
                        },
                      })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="health-path">준비 확인 경로</FieldLabel>
                  <Input
                    id="health-path"
                    value={profile.healthPath}
                    disabled={disabled}
                    onChange={(e) =>
                      onChange({
                        ...p,
                        executionProfile: {
                          ...profile,
                          healthPath: e.target.value,
                        },
                      })
                    }
                  />
                </Field>
              </FieldGroup>
              <Field>
                <FieldLabel htmlFor="request-entry">
                  테스트 기본 경로
                </FieldLabel>
                <Input
                  id="request-entry"
                  placeholder="POST /endpoint"
                  value={p.connection?.entry ?? ""}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({
                      ...p,
                      connection: {
                        ...p.connection,
                        dependencies: p.connection?.dependencies ?? [],
                        entry: e.target.value,
                      },
                    })
                  }
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card variant="panel">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>환경변수</CardTitle>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() =>
                  onChange({
                    ...p,
                    executionProfile: {
                      ...profile,
                      variables: [
                        ...profile.variables,
                        { name: "", kind: "plain", value: "", required: true },
                      ],
                    },
                  })
                }
              >
                <Plus data-icon="inline-start" />
                변수 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {profile.variables.map((v, i) => (
                <FieldGroup
                  key={i}
                  className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)_auto]"
                >
                  <Field>
                    <FieldLabel htmlFor={`var-name-${i}`}>이름</FieldLabel>
                    <Input
                      id={`var-name-${i}`}
                      value={v.name}
                      disabled={disabled}
                      onChange={(e) =>
                        onChange({
                          ...p,
                          executionProfile: {
                            ...profile,
                            variables: profile.variables.map((x, n) =>
                              n === i ? { ...x, name: e.target.value } : x,
                            ),
                          },
                        })
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`var-kind-${i}`}>주입 방식</FieldLabel>
                    <Select
                      value={v.kind}
                      disabled={disabled}
                      onValueChange={(kind) =>
                        onChange({
                          ...p,
                          executionProfile: {
                            ...profile,
                            variables: profile.variables.map((x, n) =>
                              n === i
                                ? {
                                    ...x,
                                    kind: kind as typeof v.kind,
                                    value: "",
                                  }
                                : x,
                            ),
                          },
                        })
                      }
                    >
                      <SelectTrigger id={`var-kind-${i}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="plain">일반값</SelectItem>
                          <SelectItem value="secret-ref">비밀 참조</SelectItem>
                          <SelectItem value="mock">Mock 자동 주입</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`var-value-${i}`}>
                      {v.kind === "secret-ref" ? "Secret 버전 참조" : "값"}
                    </FieldLabel>
                    <Input
                      id={`var-value-${i}`}
                      value={
                        v.kind === "mock" ? "환경별 WireMock 주소" : v.value
                      }
                      disabled={disabled || v.kind === "mock"}
                      placeholder={
                        v.kind === "secret-ref"
                          ? "projects/…/secrets/…/versions/…"
                          : ""
                      }
                      onChange={(e) =>
                        onChange({
                          ...p,
                          executionProfile: {
                            ...profile,
                            variables: profile.variables.map((x, n) =>
                              n === i ? { ...x, value: e.target.value } : x,
                            ),
                          },
                        })
                      }
                    />
                  </Field>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`환경변수 ${i + 1} 삭제`}
                    disabled={disabled}
                    onClick={() =>
                      onChange({
                        ...p,
                        executionProfile: {
                          ...profile,
                          variables: profile.variables.filter(
                            (_, n) => n !== i,
                          ),
                        },
                      })
                    }
                  >
                    <Trash2 />
                  </Button>
                </FieldGroup>
              ))}
              {!profile.variables.length && (
                <FieldDescription>
                  필요한 변수만 등록합니다. 비밀값은 원문 대신 Secret Manager
                  참조를 사용하세요.
                </FieldDescription>
              )}
            </FieldGroup>
          </CardContent>
        </Card>
        <Card variant="panel">
          <CardHeader>
            <CardTitle>결과 이메일</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="notification-email">
                  수신 주소 · 선택
                </FieldLabel>
                <Input
                  id="notification-email"
                  type="email"
                  value={email}
                  placeholder="team@example.com"
                  disabled={disabled}
                  onChange={(e) => onEmail(e.target.value)}
                />
                <FieldDescription>
                  수신 주소를 저장합니다. 발송 서비스는 연결 전입니다.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="type-body-xs text-interface-muted">
            이 브라우저에 자동 저장
          </p>
          <Button disabled={disabled || !repositoryReady(p)} onClick={onNext}>
            다음: 테스트 정의
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
      <aside className="flex min-w-0 flex-col gap-4" aria-label="지원 규격">
        <h2 className="type-heading-sm">첫 MVP 지원 규격</h2>
        <ul className="flex flex-col gap-3 type-body-sm text-interface-secondary">
          {[
            "허용된 공개 GitHub 저장소",
            "Python 3.12 · uv",
            "pyproject.toml + uv.lock",
            "표준 Dockerfile · HTTP JSON",
            "외부 API는 WireMock으로 대체",
          ].map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <p className="type-body-xs text-interface-muted">
          URL 입력은 등록 정보입니다. 소스 확인 성공과 실제 실행 지원을 의미하지
          않습니다.
        </p>
      </aside>
    </div>
  );
}
