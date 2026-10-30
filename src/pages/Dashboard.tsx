import { GuardConsole } from "@/components/ossguard/guard-console";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  selectedProject,
  validationProjects,
} from "@/components/ossguard/demo-project";
import { projectHref } from "@/components/ossguard/model";
import { ProjectWorkspace } from "@/components/dashboard/project-workspace";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BackendWorkspace } from "@/components/ossguard/backend-workspace";
import { ServerConsole } from "@/components/ossguard/server-console";

export default function Dashboard() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const project = selectedProject(search);
  if (project)
    return (
      <GuardConsole
        key={project.id}
        project={project}
        templates={validationProjects}
      />
    );
  const id = new URLSearchParams(search).get("project");
  if (id && /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id))
    return <ServerConsole key={id} id={id} />;
  if (new URLSearchParams(search).has("project"))
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert>
          <AlertDescription>
            등록된 검증 프로젝트를 찾을 수 없습니다.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link to="/dashboard">프로젝트 목록</Link>
        </Button>
      </div>
    );
  if (new URLSearchParams(search).get("mode") !== "drafts")
    return <BackendWorkspace />;
  return (
    <ProjectWorkspace
      includeDemo
      onCreated={(id) => navigate(projectHref(id, "setup"))}
    />
  );
}
