import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useBackend } from "./backend-context";
import { errorText, type ApiProject } from "./api";
import { projectHref } from "./model";
import { selectedProject } from "./demo-project";
import { readDraft } from "./draft";
import { purchaseDemo } from "./execution-defaults";

export function BackendConnection({ settings = false }: { settings?: boolean }) {
  const { api, loading, error, connect, disconnect, refresh } = useBackend();
  const [token, setToken] = useState("");
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {api ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="success">서버 연결됨</Badge>
          {settings && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                onClick={() => void refresh()}
              >
                <RefreshCw data-icon="inline-start" />
                새로고침
              </Button>
              <Button variant="ghost" size="sm" onClick={disconnect}>
                연결 해제
              </Button>
            </div>
          )}
        </div>
      ) : settings ? (
        <Card variant="panel">
          <CardHeader className="px-5 py-4 md:px-5">
            <CardTitle>검증 서버에 연결</CardTitle>
          </CardHeader>
          <CardContent className="px-5 md:px-5 md:pb-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void connect(token).then(() => setToken(""));
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="team-token">서버 접근 키</FieldLabel>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      className="min-w-0 flex-1"
                      id="team-token"
                      type="password"
                      autoComplete="off"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Button
                      className="shrink-0"
                      disabled={loading || !token.trim()}
                    >
                      {loading ? "연결 중…" : "서버 연결"}
                    </Button>
                  </div>
                  <FieldDescription>
                    서버 관리자에게 받은 접근 키를 입력하세요. 현재 탭에서만
                    연결을 유지합니다.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>검증 서버에 연결하세요</EmptyTitle>
            <EmptyDescription>
              설정에서 서버에 연결하면 프로젝트를 관리하고 검증을 실행할 수 있습니다.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/dashboard/settings#server-connection">
              서버 연결 설정
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </Empty>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
export function BackendWorkspace() {
  const { api, projects, loading, refresh } = useBackend();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const importId = params.get("import");
  let imported;
  try {
    const source = importId
      ? selectedProject(`?project=${encodeURIComponent(importId)}`)
      : undefined;
    imported = source ? readDraft(source).definition : undefined;
  } catch {
    /* The original draft remains untouched. */
  }
  const [creating, setCreating] = useState(!!importId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!api) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const project = await api.request<ApiProject>("/api/projects", "POST", {
        name: String(form.get("name")).trim(),
        repository_url: String(form.get("repository")).trim(),
        ref: String(form.get("ref")).trim(),
      });
      await refresh();
      navigate(projectHref(project.id, "setup"));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="flex min-h-[calc(100svh-8rem)] min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="type-heading-xl">프로젝트</h1>
        </div>
        <Button
          disabled={!api || loading}
          onClick={() => setCreating(!creating)}
        >
          <Plus data-icon="inline-start" />새 프로젝트
        </Button>
      </div>
      <div className={!api ? "flex flex-1 flex-col justify-center" : undefined}>
        <BackendConnection />
      </div>
      {creating && api && (
        <Card variant="panel">
          <CardHeader className="px-5 py-4 md:px-5">
            <CardTitle>공개 GitHub 저장소 등록</CardTitle>
          </CardHeader>
          <CardContent className="px-5 md:px-5">
            <form onSubmit={(e) => void create(e)}>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="server-name">프로젝트 이름</FieldLabel>
                  <Input
                    id="server-name"
                    name="name"
                    defaultValue={imported?.name ?? purchaseDemo.name}
                    required
                    maxLength={120}
                    disabled={busy}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="server-repository">
                    저장소 URL
                  </FieldLabel>
                  <Input
                    id="server-repository"
                    name="repository"
                    defaultValue={
                      imported?.repository?.url ?? purchaseDemo.repository
                    }
                    type="url"
                    required
                    placeholder="https://github.com/team/service"
                    disabled={busy}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="server-ref">브랜치·태그·커밋</FieldLabel>
                  <Input
                    id="server-ref"
                    name="ref"
                    defaultValue={imported?.repository?.ref || purchaseDemo.ref}
                    required
                    disabled={busy}
                  />
                </Field>
              </FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="mt-4 flex gap-2">
                <Button disabled={busy}>
                  {busy ? "등록 중…" : "저장소 등록"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setCreating(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {api && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Card variant="panel" key={p.id} className="min-w-0">
              <CardHeader className="px-5 py-4 md:px-5">
                <CardTitle>
                  <Link
                    className="focus-control rounded-sm"
                    to={projectHref(p.id)}
                  >
                    {p.name}
                  </Link>
                </CardTitle>
                <p className="break-all type-body-sm text-interface-secondary">
                  {p.repository_url.replace("https://github.com/", "")}
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5 md:px-5 md:pb-5">
                <Badge variant={p.commit_sha ? "outline" : "muted"}>
                  {p.commit_sha?.slice(0, 8) || "소스 확인 전"}
                </Badge>
                <Button variant="ghost" asChild>
                  <Link to={projectHref(p.id)}>
                    프로젝트 열기
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {api && !projects.length && !loading && !creating && (
        <Empty variant="panel">
          <EmptyHeader>
            <EmptyTitle>첫 저장소를 등록하세요</EmptyTitle>
            <EmptyDescription>
              서버의 허용 목록에 등록된 공개 GitHub 저장소를 사용할 수 있습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </section>
  );
}
