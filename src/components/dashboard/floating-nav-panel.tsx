import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserRound } from "lucide-react";
import {
  getWorkspaceNavigationGroups,
  isWorkspaceNavigationActive,
} from "./workspace-navigation";
import {
  isSettingsPath,
  settingsNavigation,
  workspaceReturn,
} from "./settings-navigation";
import { WorkspaceAccountMenu } from "./workspace-account-menu";
import { useBackend } from "@/components/ossguard/backend-context";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import {
  SidebarHoverEdge,
  SidebarHoverPanel,
  SidebarHoverButton,
  SidebarHoverAccountContent,
} from "@/components/ui/sidebar-hover-panel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FloatingNavPanel() {
  const { projects: remoteProjects, api } = useBackend();
  const { pathname, search } = useLocation();
  const navigation = isSettingsPath(pathname)
    ? [workspaceReturn, ...settingsNavigation]
    : getWorkspaceNavigationGroups(search, pathname, remoteProjects, !!api).flatMap(
        (group) => group.items,
      );
  const id = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const edgeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const pointerInside = useRef(false);
  const focusOnOpen = useRef(false);
  const navigating = useRef(false);
  const restoreEdgeFocus = useRef(true);
  const accountKeyboard = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visible = hovered || focused || accountOpen;
  function cancelClose() {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }
  useEffect(
    () => () => {
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    },
    [],
  );
  function focusFirst() {
    setFocused(true);
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
  }
  useLayoutEffect(() => {
    if (visible && focusOnOpen.current) {
      focusOnOpen.current = false;
      panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    }
  }, [visible]);
  function openFromKeyboard() {
    navigating.current = false;
    cancelClose();
    if (visible) focusFirst();
    else {
      focusOnOpen.current = true;
      setFocused(true);
    }
  }
  function enter() {
    navigating.current = false;
    cancelClose();
    pointerInside.current = true;
    setHovered(true);
  }
  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setHovered(false);
      setTooltip(null);
      closeTimer.current = null;
    }, 300);
  }
  function leaveEdge() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      if (!pointerInside.current) scheduleClose();
    }, 30);
  }
  function leavePanel() {
    pointerInside.current = false;
    setTooltip(null);
    if (!accountOpen) scheduleClose();
  }
  function dismiss() {
    cancelClose();
    setHovered(false);
    setFocused(false);
    setAccountOpen(false);
    setTooltip(null);
  }
  function navigate() {
    navigating.current = true;
    dismiss();
  }
  function tooltipChange(label: string, open: boolean) {
    setTooltip((current) =>
      open && !accountOpen ? label : current === label ? null : current,
    );
  }
  return (
    <>
      <SidebarHoverEdge
        ref={edgeRef}
        aria-label="빠른 메뉴 열기"
        aria-controls={id}
        aria-expanded={visible}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") {
            cancelClose();
            setTooltip(null);
            setHovered(true);
          }
        }}
        onPointerLeave={leaveEdge}
        onClick={openFromKeyboard}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            openFromKeyboard();
          }
        }}
      />
      <SidebarHoverPanel
        ref={panelRef}
        id={id}
        open={visible}
        aria-label="빠른 탐색"
        onPointerEnter={enter}
        onPointerLeave={leavePanel}
        onFocusCapture={(event) => {
          if (event.target.matches(":focus-visible")) setFocused(true);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !accountOpen) {
            event.preventDefault();
            dismiss();
            edgeRef.current?.focus();
          }
        }}
      >
        {navigation.map(({ href, title, icon: Icon }) => (
          <SidebarMenuItem key={href}>
            <Tooltip
              open={visible && !accountOpen && tooltip === title}
              onOpenChange={(open) => tooltipChange(title, open)}
            >
              <TooltipTrigger asChild>
                <SidebarHoverButton
                  asChild
                  data-active={isWorkspaceNavigationActive(
                    href,
                    pathname,
                    search,
                  )}
                >
                  <Link
                    to={href}
                    aria-label={title}
                    aria-current={
                      isWorkspaceNavigationActive(href, pathname, search)
                        ? "page"
                        : undefined
                    }
                    onClick={navigate}
                  >
                    <Icon />
                    <span className="sr-only">{title}</span>
                  </Link>
                </SidebarHoverButton>
              </TooltipTrigger>
              {visible && !accountOpen && tooltip === title && (
                <TooltipContent side="right" sideOffset={10}>
                  {title}
                </TooltipContent>
              )}
            </Tooltip>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem aria-hidden="true" className="mt-auto w-8">
          <div className="pt-2">
            <Separator />
          </div>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Popover
            open={accountOpen}
            onOpenChange={(open) => {
              cancelClose();
              setTooltip(null);
              if (open) restoreEdgeFocus.current = true;
              setAccountOpen(open);
            }}
          >
            <Tooltip
              open={visible && !accountOpen && tooltip === "계정 메뉴"}
              onOpenChange={(open) => tooltipChange("계정 메뉴", open)}
            >
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <SidebarHoverButton
                    aria-label="계정 메뉴"
                    data-active={accountOpen}
                    onPointerDown={() => {
                      accountKeyboard.current = false;
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ")
                        accountKeyboard.current = true;
                    }}
                  >
                    <UserRound />
                    <span className="sr-only">계정 메뉴</span>
                  </SidebarHoverButton>
                </PopoverTrigger>
              </TooltipTrigger>
              {visible && !accountOpen && tooltip === "계정 메뉴" && (
                <TooltipContent side="right" sideOffset={10}>
                  계정 메뉴
                </TooltipContent>
              )}
            </Tooltip>
            <SidebarHoverAccountContent
              aria-label="계정 설정"
              onOpenAutoFocus={(event) => {
                if (!accountKeyboard.current) event.preventDefault();
              }}
              onInteractOutside={() => {
                restoreEdgeFocus.current = false;
              }}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                setFocused(false);
                setHovered(!navigating.current && pointerInside.current);
                if (restoreEdgeFocus.current && !navigating.current)
                  edgeRef.current?.focus();
              }}
            >
              <WorkspaceAccountMenu onNavigate={navigate} />
            </SidebarHoverAccountContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarHoverPanel>
    </>
  );
}
