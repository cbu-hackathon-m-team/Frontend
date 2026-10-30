import { Clock3, FolderOpen, ShieldCheck } from "lucide-react";

export const workspaceNavigation = [
  { href: "/dashboard", title: "검증 콘솔", icon: ShieldCheck },
  { href: "/dashboard/projects", title: "프로젝트", icon: FolderOpen },
  { href: "/dashboard/activity", title: "최근 변경", icon: Clock3 },
];
