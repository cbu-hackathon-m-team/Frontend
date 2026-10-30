import {
  Clock3,
  FolderOpen,
  LayoutDashboard,
  Settings2,
  ListChecks,
  GitCompareArrows,
} from "lucide-react";
import { selectedProject } from "@/components/ossguard/demo-project";
import { projectHref } from "@/components/ossguard/model";

export const workspaceNavigation = [
  { href: "/dashboard", title: "프로젝트", icon: FolderOpen },
  { href: "/dashboard/activity", title: "최근 변경", icon: Clock3 },
];
export function getWorkspaceNavigationGroups(
  search: string,
  pathname = "/dashboard",
  remoteProjects: { id: string; name: string }[] = [],
  connected = false,
) {
  const project =
    pathname === "/dashboard"
      ? (selectedProject(search) ??
        remoteProjects.find(
          (p) => p.id === new URLSearchParams(search).get("project"),
        ))
      : undefined;
  const groups = [{ title: "워크스페이스", items: connected ? workspaceNavigation.filter((item) => item.href !== "/dashboard/activity") : workspaceNavigation }];
  if (project)
    groups.push({
      title: project.name,
      items: [
        { href: projectHref(project.id), title: "개요", icon: LayoutDashboard },
        {
          href: projectHref(project.id, "runs"),
          title: "검증 실행",
          icon: GitCompareArrows,
        },
        {
          href: projectHref(project.id, "tests"),
          title: "업무 테스트",
          icon: ListChecks,
        },
        {
          href: projectHref(project.id, "setup"),
          title: "실행 설정",
          icon: Settings2,
        },
      ],
    });
  return groups;
}
export function isWorkspaceNavigationActive(
  href: string,
  pathname: string,
  search: string,
) {
  const [path, query = ""] = href.split("?");
  if (pathname === "/dashboard/projects" && path === "/dashboard" && !query)
    return true;
  if (pathname !== path) return false;
  if (path !== "/dashboard") return true;
  const target = new URLSearchParams(query);
  const current = new URLSearchParams(search);
  const project =
    selectedProject(search) ??
    (current.get("project") ? { id: current.get("project") } : undefined);
  if (!target.has("project")) return !project;
  if (target.get("project") !== project?.id) return false;
  const requested = current.get("tab") ?? "overview";
  const tab = ["overview", "setup", "tests", "results", "runs"].includes(
    requested,
  )
    ? requested
    : "overview";
  return (
    (tab === "results" ? "runs" : tab) === (target.get("tab") ?? "overview")
  );
}
