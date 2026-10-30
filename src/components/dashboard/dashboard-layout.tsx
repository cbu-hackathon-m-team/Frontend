import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { Check } from "lucide-react";
import { DashboardAccountIdentity, DashboardBrandIdentity } from "./sidebar";
import {
  defaultWorkspace,
  readWorkspace,
  writeWorkspace,
  type Workspace,
} from "./workspace";
import { WorkspaceAccountMenu } from "./workspace-account-menu";
import {
  getWorkspaceNavigationGroups,
  isWorkspaceNavigationActive,
} from "./workspace-navigation";
import { FloatingNavPanel } from "./floating-nav-panel";
import {
  isSettingsPath,
  settingsNavigation,
  settingsNavigationGroups,
  workspaceReturn,
} from "./settings-navigation";
import { cn } from "@/lib/utils";
import { selectedProject } from "@/components/ossguard/demo-project";
import { projectHref } from "@/components/ossguard/model";
import {
  BackendProvider,
  useBackend,
} from "@/components/ossguard/backend-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface WorkspaceContext {
  workspace: Workspace;
  error: string | null;
  saveWorkspace: (workspace: Workspace) => string | null;
}
export function useWorkspace() {
  return useOutletContext<WorkspaceContext>();
}

function WorkspaceNavigationContent({ workspace }: { workspace: Workspace }) {
  const { projects: remoteProjects, api } = useBackend();
  const { pathname, search } = useLocation();
  const settings = isSettingsPath(pathname);
  const { setOpenMobile } = useSidebar();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  function closeMenus() {
    setOpenMobile(false);
    setAccountOpen(false);
    setWorkspaceOpen(false);
  }
  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {settings ? (
              <SidebarMenuButton asChild className="h-10">
                <Link to={workspaceReturn.href} onClick={closeMenus}>
                  <workspaceReturn.icon />
                  <span>{workspaceReturn.title}</span>
                </Link>
              </SidebarMenuButton>
            ) : (
              <DropdownMenu
                open={workspaceOpen}
                onOpenChange={setWorkspaceOpen}
              >
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    className="h-10 group/header"
                    isActive={workspaceOpen}
                    aria-label="워크스페이스 선택"
                  >
                    <DashboardBrandIdentity name={workspace.name} />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>워크스페이스</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={closeMenus}>
                      <Check />
                      <span className="truncate">{workspace.name}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label={settings ? "설정 탐색" : "워크스페이스 탐색"}>
          {(settings
            ? settingsNavigationGroups
            : getWorkspaceNavigationGroups(search, pathname, remoteProjects, !!api)
          ).map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map(({ href, title, icon: Icon }) => (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        asChild
                        variant="product"
                        isActive={isWorkspaceNavigationActive(
                          href,
                          pathname,
                          search,
                        )}
                        className="h-auto"
                      >
                        <Link
                          to={href}
                          aria-current={
                            isWorkspaceNavigationActive(href, pathname, search)
                              ? "page"
                              : undefined
                          }
                          onClick={closeMenus}
                        >
                          <Icon />
                          <span>{title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Popover open={accountOpen} onOpenChange={setAccountOpen}>
              <PopoverTrigger asChild>
                <SidebarMenuButton
                  className="h-10 justify-between group/footer"
                  aria-label="계정 메뉴"
                  isActive={accountOpen}
                >
                  <DashboardAccountIdentity name="내 계정" />
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="top"
                variant="menu"
                aria-label="계정 설정"
              >
                <WorkspaceAccountMenu onNavigate={closeMenus} />
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
function WorkspaceNavigation({ workspace }: { workspace: Workspace }) {
  const { state, isMobile } = useSidebar();
  return (
    <Sidebar>
      {(isMobile || state === "expanded") && (
        <WorkspaceNavigationContent workspace={workspace} />
      )}
    </Sidebar>
  );
}
function WorkspaceChrome() {
  const { projects: remoteProjects, api } = useBackend();
  const { pathname, search } = useLocation();
  const settings = isSettingsPath(pathname);
  const project =
    pathname === "/dashboard"
      ? (selectedProject(search) ??
        remoteProjects.find(
          (p) => p.id === new URLSearchParams(search).get("project"),
        ))
      : undefined;
  const { state: sidebarState, isMobile } = useSidebar();
  const contentRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [pathname, search]);
  const page =
    pathname === "/dashboard/settings"
      ? "워크스페이스 설정"
      : pathname.startsWith("/validations/")
        ? "검증 결과"
        : pathname === "/dashboard" &&
            new URLSearchParams(search).has("project")
          ? ({
              overview: "개요",
              runs: "검증 실행",
              setup: "실행 설정",
              tests: "업무 테스트",
              results: "검증 결과",
            }[new URLSearchParams(search).get("tab") ?? "overview"] ?? "개요")
          : ([
              ...getWorkspaceNavigationGroups(
                search,
                pathname,
                remoteProjects,
                !!api,
              ).flatMap((group) => group.items),
              ...settingsNavigation,
            ].find((item) =>
              isWorkspaceNavigationActive(item.href, pathname, search),
            )?.title ?? "페이지를 찾을 수 없습니다");
  const [state, setState] = useState(() => {
    try {
      return { workspace: readWorkspace(), error: null as string | null };
    } catch {
      return {
        workspace: defaultWorkspace,
        error:
          "워크스페이스 정보를 읽지 못했습니다. 브라우저 저장소를 확인한 뒤 새로고침해 주세요.",
      };
    }
  });
  useEffect(() => {
    document.title = `${page} | OSSGuard`;
  }, [page]);
  function saveWorkspace(workspace: Workspace) {
    if (state.error) return state.error;
    try {
      writeWorkspace(workspace);
    } catch {
      return "변경사항을 저장하지 못했습니다. 브라우저 저장 공간과 권한을 확인해 주세요.";
    }
    setState({ workspace, error: null });
    return null;
  }
  return (
    <div className="relative flex h-dvh min-h-0 w-full overflow-hidden bg-surface-canvas">
      <WorkspaceNavigation workspace={state.workspace} />
      {sidebarState === "collapsed" && !isMobile && (
        <FloatingNavPanel key={pathname + search} />
      )}
      <SidebarInset className="min-h-0 min-w-0">
        <header className="flex h-13 shrink-0 items-center gap-3 border-b border-boundary-subtle px-4">
          <SidebarTrigger aria-label="사이드바 토글" />
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="hidden min-w-0 sm:inline-flex">
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">
                    <span className="block max-w-48 truncate">
                      {state.workspace.name}
                    </span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              {project && (
                <>
                  <BreadcrumbItem className="hidden min-w-0 md:inline-flex">
                    <BreadcrumbLink asChild>
                      <Link to={projectHref(project.id)}>
                        <span className="block max-w-40 truncate">
                          {project.name}
                        </span>
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </>
              )}
              {settings && pathname !== "/dashboard/settings" && (
                <>
                  <BreadcrumbItem className="hidden sm:inline-flex">
                    <BreadcrumbLink asChild>
                      <Link to="/dashboard/settings">워크스페이스 설정</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden sm:block" />
                </>
              )}
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage>
                  <span className="block truncate">{page}</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div
          ref={contentRef}
          className="min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-7 sm:px-8 sm:py-8 lg:px-10"
        >
          <div
            className={cn(
              "mx-auto w-full",
              settings ? "max-w-4xl" : "max-w-6xl",
            )}
          >
            <Outlet
              context={{ ...state, saveWorkspace } satisfies WorkspaceContext}
            />
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
export function DashboardLayout() {
  return (
    <BackendProvider>
      <SidebarProvider className="h-dvh min-h-0">
        <WorkspaceChrome />
      </SidebarProvider>
    </BackendProvider>
  );
}
