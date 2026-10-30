import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, FilePlus2, PencilLine } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { WorkspacePageHeader } from "@/components/dashboard/page-header";
import { readProjects } from "@/components/dashboard/projects";

export default function DashboardActivity() {
  const [snapshot] = useState(() => {
    try {
      return { projects: readProjects(), error: null };
    } catch {
      return {
        projects: [],
        error:
          "프로젝트의 변경 정보를 읽지 못했습니다. 저장소를 확인한 뒤 다시 시도해 주세요.",
      };
    }
  });
  const projects = [...snapshot.projects].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
  return (
    <div className="flex flex-col gap-8">
      <WorkspacePageHeader
        title="최근 변경"
        description="프로젝트별 마지막 변경과 수정 시점을 확인하세요."
      />
      {snapshot.error ? (
        <Alert variant="destructive">
          <AlertDescription>{snapshot.error}</AlertDescription>
        </Alert>
      ) : projects.length ? (
        <section
          aria-label="최근 변경 목록"
          className="rounded-lg border border-boundary-default"
        >
          <div className="border-b border-boundary-subtle px-5 py-4">
            <h2 className="type-label-lg">프로젝트 업데이트</h2>
            <p className="mt-1 type-body-sm text-interface-subtle">
              각 프로젝트의 마지막 저장 정보입니다.
            </p>
          </div>
          <ul className="divide-y divide-boundary-subtle">
            {projects.map((project) => {
              const created = project.createdAt === project.updatedAt;
              const Icon = created ? FilePlus2 : PencilLine;
              return (
                <li
                  key={project.id}
                  className="flex items-start gap-4 px-5 py-5"
                >
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-interface-subtle"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="type-label-md text-interface-contrast">
                      <span className="break-words">{project.name}</span>
                    </p>
                    <p className="mt-1 type-body-sm text-interface-secondary">
                      {created
                        ? "프로젝트를 만들었습니다."
                        : "프로젝트 정보를 수정했습니다."}
                    </p>
                  </div>
                  <time
                    className="shrink-0 type-body-xs text-interface-subtle"
                    dateTime={project.updatedAt}
                  >
                    {new Date(project.updatedAt).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <Empty variant="panel" className="min-h-72">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock3 />
            </EmptyMedia>
            <EmptyTitle>아직 변경 내역이 없습니다</EmptyTitle>
            <EmptyDescription>
              프로젝트를 만들거나 수정하면 이곳에서 확인할 수 있습니다.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary" asChild>
              <Link to="/dashboard">프로젝트로 이동</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
