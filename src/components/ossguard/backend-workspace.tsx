import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
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
import { readProjects } from "@/components/dashboard/projects";
import { selectedProject } from "./demo-project";
import { readDraft } from "./draft";

export function BackendConnection() {
  const { api, loading, error, connect, disconnect, refresh } = useBackend();
  const [token, setToken] = useState("");
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {api ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="success">서버 연결됨</Badge>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={() => void refresh()}
            >
              <RefreshCw />
              새로고침
            </Button>
            <Button variant="ghost" size="sm" onClick={disconnect}>
              연결 해제
            </Button>
          </div>
        </div>
      ) : (
        <Card variant="panel">
          <CardHeader className="px-5 py-4 md:px-5">
            <CardTitle>검증 서버에 연결</CardTitle>
          </CardHeader>
          <CardContent className="px-5 md:px-5 md:pb-5">
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void connect(token).then(() => setToken(""));
              }}
            >
              <Field className="min-w-0 flex-1">
                <FieldLabel htmlFor="team-token">팀 토큰</FieldLabel>
                <Input
                  id="team-token"
                  type="password"
                  autoComplete="off"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  disabled={loading}
                />
                <FieldDescription>
                  현재 탭에서만 연결을 유지합니다.
                </FieldDescription>
              </Field>
              <Button disabled={loading || !token.trim()}>
                {loading ? "연결 중…" : "서버 연결"}
              </Button>
            </form>
          </CardContent>
        </Card>
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
  let hasDrafts = false;
  try {
    hasDrafts = readProjects().length > 0;
  } catch {
    hasDrafts = true;
  }
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
    <section className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="type-heading-xl">프로젝트</h1>
          <p className="mt-2 type-body-md text-interface-secondary">
            의존성 업데이트의 빌드와 업무 동작을 검증합니다.
          </p>
        </div>
        <Button
          disabled={!api || loading}
          onClick={() => setCreating(!creating)}
        >
          <Plus />새 프로젝트
        </Button>
      </div>
      <BackendConnection />
      {creating && api && (
        <Card variant="panel">
          <CardHeader className="px-5 py-4 md:px-5">
            <CardTitle>공개 GitHub 저장소 등록</CardTitle>
          </CardHeader>
          <CardContent className="px-5 md:px-5">
            <form
              onSubmit={(e) => void create(e)}
              className="flex flex-col gap-4"
            >
              <Field>
                <FieldLabel htmlFor="server-name">프로젝트 이름</FieldLabel>
                <Input
                  id="server-name"
                  name="name"
                  defaultValue={imported?.name ?? ""}
                  required
                  maxLength={120}
                  disabled={busy}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="server-repository">저장소 URL</FieldLabel>
                <Input
                  id="server-repository"
                  name="repository"
                  defaultValue={imported?.repository?.url ?? ""}
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
                  defaultValue={imported?.repository?.ref || "main"}
                  required
                  disabled={busy}
                />
              </Field>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
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
                    <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {api && !projects.length && !loading && (
        <Empty variant="panel">
          <EmptyHeader>
            <EmptyTitle>첫 저장소를 등록하세요</EmptyTitle>
            <EmptyDescription>
              서버의 허용 목록에 등록된 공개 GitHub 저장소를 사용할 수 있습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-boundary-subtle pt-4 type-body-sm text-interface-secondary">
        <span>연결 없이 화면을 둘러볼 수 있습니다.</span>
        <Button variant="outline" asChild>
          <Link to={projectHref("python-uv-demo", "results")}>
            화면 예시
            <ArrowRight />
          </Link>
        </Button>
      </div>
      {hasDrafts && (
        <Link
          className="w-fit rounded-sm type-body-sm text-interface-secondary underline underline-offset-4 focus-control"
          to="/dashboard?mode=drafts"
        >
          기존 브라우저 초안
        </Link>
      )}
    </section>
  );
}
