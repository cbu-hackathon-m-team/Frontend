import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { DashboardThemeToggle } from "./sidebar";
import { BookOpen, House, LayoutDashboard, LogOut, Settings2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { endPreviewSession } from "@/lib/preview-session";

export function WorkspaceAccountMenu({
  onNavigate,
  context = "workspace",
}: {
  onNavigate: () => void;
  context?: "workspace" | "landing" | "design-system";
}) {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2.5 p-3">
        <Avatar aria-hidden="true">
          <AvatarFallback><User className="size-4" /></AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="type-label-lg text-interface-contrast">내 계정</span>
          <span className="type-body-sm text-interface-subtle">개인 워크스페이스</span>
        </div>
      </div>
      <Separator />
      <div className="p-1.5">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <span className="type-body-md">화면 모드</span>
          <DashboardThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <Separator />
      <div className="flex flex-col p-1.5">
        {context !== "workspace" && (
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/dashboard" onClick={onNavigate}>
              <LayoutDashboard data-icon="inline-start" />
              대시보드
            </Link>
          </Button>
        )}
        {context === "workspace" && (
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/dashboard/settings" onClick={onNavigate}>
              <Settings2 data-icon="inline-start" />
              워크스페이스 설정
            </Link>
          </Button>
        )}
        {context !== "design-system" && (
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/design-system" onClick={onNavigate}>
              <BookOpen data-icon="inline-start" />
              디자인 시스템
            </Link>
          </Button>
        )}
        {context !== "landing" && (
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/" onClick={onNavigate}>
              <House data-icon="inline-start" />
              사이트 보기
            </Link>
          </Button>
        )}
      </div>
      <Separator />
      <div className="p-1.5">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/login" replace onClick={() => {
            try { sessionStorage.removeItem("ossguard.api-session"); } catch { /* Route exit also releases the in-memory client. */ }
            endPreviewSession();
            onNavigate();
          }}>
            <LogOut data-icon="inline-start" />
            로그아웃
          </Link>
        </Button>
      </div>
    </div>
  );
}
