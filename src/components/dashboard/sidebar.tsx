import * as React from 'react';
import { Link } from 'react-router-dom';
import { Layers2, User, ChevronsUpDown, Building2, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { transitionAppearance } from '@/lib/appearance-transition';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
const workspaces = [
  { id: "design", name: "Design", path: "/design-system" },
  { id: "engineering", name: "Engineering", path: "/" },
];

export { navItemClasses } from "@/components/ui/sidebar";

export const dashboardBrandTriggerClasses =
  "flex h-10 w-full justify-start items-center gap-2.5 px-2.5 py-0 rounded-md hover:bg-interaction-hover-control transition-colors overflow-hidden group/header data-[state=open]:bg-interaction-selected data-[state=open]:hover:bg-interaction-selected dark:data-[state=open]:hover:bg-interaction-selected";

export const dashboardAccountTriggerClasses =
  "w-full justify-between px-2.5 py-1.5 h-10 text-interface-secondary hover:bg-interaction-hover-control hover:text-interface-contrast transition-colors duration-(--motion-responsive) overflow-hidden group/footer data-[state=open]:bg-interaction-selected data-[state=open]:text-interface-contrast data-[state=open]:hover:bg-interaction-selected dark:data-[state=open]:hover:bg-interaction-selected";


export function DashboardBrandIdentity({ name = "Hapalin Studio" }: { name?: string }) {
  return (
    <>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-foreground transition-transform duration-(--motion-responsive) group-hover/header:scale-105 motion-reduce:transform-none motion-reduce:transition-none">
        <Layers2 className="h-3.5 w-3.5 text-background" />
      </div>
      <div className="flex flex-1 items-center justify-between overflow-hidden">
        <span className="min-w-0 truncate type-heading-xs font-semibold tracking-tight text-interface-default">
          {name}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-interface-subtle transition-colors group-hover/header:text-interface-default group-data-[state=open]/header:text-interface-default" />
      </div>
    </>
  );
}

export function DashboardAccountIdentity({ name = "Preview account" }: { name?: string }) {
  const username = name;
  const ready = true;
  return (
    <>
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-3.5 w-3.5 text-interface-default" />
        </div>
        {ready ? <span className="truncate type-label-md leading-tight">{username ?? "Account"}</span> : <Skeleton className="h-3 w-16" />}
      </div>
      <MoreHorizontal className="h-3.5 w-3.5 shrink-0 text-interface-subtle transition-colors group-hover/footer:text-interface-default group-data-[state=open]/footer:text-interface-default" />
    </>
  );
}

export function WorkspaceMenu({
  open,
  onOpenChange,
  pathname,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
}) {
  const isWorkspaceActive = pathname.startsWith("/design-system");
  return (
    <SidebarMenuItem>
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isWorkspaceActive}
            variant="product"
            className="h-auto w-full group/workspace"
          >
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left truncate">Workspace</span>
            {open ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 flex flex-col gap-0.5 pl-6">
            {workspaces.map((workspace) => {
              const isSubActive = pathname === workspace.path;
              return (
                <Link
                  key={workspace.id}
                  to={workspace.path}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 type-body-md transition-colors duration-(--motion-responsive) outline-none focus-control",
                    isSubActive
                      ? "type-label-md text-interface-contrast"
                      : "text-interface-secondary hover:bg-contrast/8 hover:text-interface-supporting",
                  )}
                >
                  <span
                    className={cn(
                      "h-1 w-1 shrink-0 rounded-full",
                      isSubActive ? "bg-contrast" : "bg-tone-700",
                    )}
                  />
                  <span className="truncate">{workspace.name}</span>
                </Link>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

export function DashboardThemeToggle({
  theme,
  setTheme,
  language = "en",
}: {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  language?: "ko" | "en";
}) {
  const controlName = React.useId();
  return (
    <fieldset className="m-0 flex h-7.5 min-w-0 w-fit items-center rounded-full border-0 p-0 ring-1 ring-theme-switch-border">
      <legend className="sr-only">{language === "ko" ? "화면 모드" : "Theme"}</legend>
      {([
        { value: "system", label: language === "ko" ? "시스템 설정" : "System theme" },
        { value: "light", label: language === "ko" ? "라이트 모드" : "Light theme" },
        { value: "dark", label: language === "ko" ? "다크 모드" : "Dark theme" },
      ] as const).map(({ value, label }) => (
        <label key={value} className="relative block size-7.5 cursor-pointer" title={label}>
          <input
            type="radio"
            name={controlName}
            value={value}
            checked={theme === value}
            onChange={() => transitionAppearance(() => setTheme(value))}
            aria-label={label}
            className="peer absolute inset-0 z-10 size-7.5 cursor-pointer opacity-0"
          />
          <span className={cn(
            "pointer-events-none flex size-7.5 items-center justify-center rounded-full text-theme-switch-text transition-colors peer-hover:text-theme-switch-active-text peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-boundary-focus",
            theme === value && "bg-theme-switch-active-bg text-theme-switch-active-text shadow-theme-switch ring-1 ring-theme-switch-active-border",
          )}>
            <ThemeSwitchIcon theme={value} />
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function ThemeSwitchIcon({ theme }: { theme: "system" | "light" | "dark" }) {
  const paths = {
    system: "M1 3.25C1 1.45 2.46 0 4.25 0h7.5C13.55 0 15 1.46 15 3.25V16H1V3.25M4.25 1.5c-.97 0-1.75.78-1.75 1.75V14.5h11V3.25c0-.97-.78-1.75-1.75-1.75zM4 4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6H4zm5 9h3v-1.5H9z",
    light: "M8.75.75V0h-1.5v2h1.5V.75M3.26 4.32l-.53-.53-.35-.35-.53-.53L2.9 1.85l.53.53.35.35.53.53zm8.42-1.06.53-.53.35-.35.53-.53 1.06 1.06-.53.53-.35.35-.53.53zM8 11.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5m0 1.5a4.75 4.75 0 1 0 0-9.5 4.75 4.75 0 0 0 0 9.5m6-5.5h2v1.5h-2zm-13.25 0H0v1.5h2v-1.5H.75m1.62 5.32-.53.53 1.06 1.06.53-.53.35-.35.53-.53-1.06-1.06-.53.53zm10.2 1.06.53.53 1.06-1.06-.53-.53-.35-.35-.53-.53-1.06 1.06.53.53zM8.75 14v2h-1.5v-2z",
    dark: "M1.5 8a6 6 0 0 1 3.62-5.51 7 7 0 0 0 7.08 9.25A5.99 5.99 0 0 1 1.5 8M6.42.58a7.5 7.5 0 1 0 7.96 10.41l-.92-1.01a5.5 5.5 0 0 1-6.3-8.25zm6.83.42v1.75H15v1.5h-1.75V6h-1.5V4.25H10v-1.5h1.75V1z",
  };

  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="size-3.5">
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d={paths[theme]} />
    </svg>
  );
}
