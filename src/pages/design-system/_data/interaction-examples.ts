import { interactionInventory, type InteractionRecord } from "./interaction-inventory"

export interface InteractionExample extends InteractionRecord {
  usage: { file: string; component: string; label: string; evidence?: string }
  icon?: "refresh" | "play" | "alert" | "eye" | "plus" | "trash"
  size?: "default" | "sm" | "xs" | "micro" | "icon"
  placeholder?: string
  prefix?: string
  suffix?: string
  alwaysDisabled?: boolean
}

export const interactionExamples: InteractionExample[] = []
function used(id: string, file: string, component: string, sample: string, label: string, options: Partial<InteractionExample> & { showStates?: string[] } = {}) {
  const source = interactionInventory.find(rule => rule.id === id)
  if (!source) throw new Error(`Unknown interaction rule: ${id}`)
  const { showStates, ...overrides } = options
  interactionExamples.push({
    ...source, sample, ...overrides,
    states: (overrides.states ?? source.states).filter(state => !state.invalid && state.name !== "Invalid" && state.name !== "Active + invalid" && (!showStates || showStates.includes(state.name))),
    usage: { file, component, label, ...options.usage },
  })
}

const interactive = ["Default", "Hover", "Focus"]
used("button-default", "components/auth/LoginForm.tsx", "Button", "로그인", "Sign-in form", { baseClassName: "w-full", showStates: [...interactive, "Disabled"] })
used("button-destructive", "pages/design-system/_components/core-specimens.tsx", "Button", "Delete Workspace", "Workspace deletion", {
  value: "destructive/60 → destructive/90 (dark)",
  showStates: [...interactive, "Disabled"],
})
used("button-secondary", "components/common/WidgetErrorFallback.tsx", "Button", "Retry", "Widget error", { icon: "refresh", showStates: interactive })
used("button-ghost", "pages/design-system/_components/core-specimens.tsx", "Button", "Reset filters", "Project configuration", { showStates: interactive })
used("action-zinc", "pages/design-system/_components/core-specimens.tsx", "ActionButton", "Sync Data", "Activity history", { icon: "refresh" })
used("action-white", "pages/design-system/_components/core-specimens.tsx", "ActionButton", "Run task", "Task setup", { icon: "play", baseClassName: "w-full" })
used("action-rose", "pages/design-system/_components/core-specimens.tsx", "ActionButton", "Remove key", "API key removal")
used("action-orange", "pages/design-system/_components/core-specimens.tsx", "ActionButton", "Archive (2)", "Archive / unavailable action", { icon: "alert", alwaysDisabled: true, showStates: ["Default", "Disabled"] })
used("toggle-glass", "pages/design-system/_components/core-specimens.tsx", "Toggle", "Hide small", "Member list", { icon: "eye", baseClassName: "gap-1.5", showStates: [...interactive, "Selected"] })
used("pagination", "pages/design-system/_components/core-specimens.tsx", "PaginationLink", "1", "Activity history pagination", { size: "icon", showStates: [...interactive, "Selected"] })
used("tab-default", "pages/design-system/_components/core-specimens.tsx", "TabsTrigger", "Design", "Workspace filter", { showStates: [...interactive, "Selected"] })
used("tab-ghost", "pages/design-system/_components/core-specimens.tsx", "TabsList", "1H", "Chart interval", { size: "xs", showStates: ["Default", "Hover", "Selected", "Focus"] })
used("tab-line", "pages/design-system/_components/core-specimens.tsx", "TabsTrigger", "Favorites", "Project filter", { showStates: ["Default", "Hover", "Selected", "Focus"] })
used("sidebar-product", "components/dashboard/sidebar.tsx", "SidebarMenuButton", "Overview", "Main navigation", { showStates: ["Default", "Hover", "Selected", "Focus"] })
used("sidebar-brand", "components/dashboard/sidebar.tsx", "Button", "Hapalin Studio", "Workspace switcher", { showStates: ["Default", "Hover", "Open", "Focus"] })
used("sidebar-account", "components/dashboard/sidebar.tsx", "Button", "admin", "Account menu", { showStates: ["Default", "Hover", "Open", "Focus"] })
used("table", "pages/design-system/_components/core-specimens.tsx", "TableRow", "Website", "Member table", { showStates: ["Default", "Hover", "Selected"] })
used("member-row", "pages/design-system/_components/core-specimens.tsx", "TableRow", "Mobile app", "Member list", { showStates: ["Default", "Hover", "Selected"] })
used("project-row", "pages/design-system/_components/core-specimens.tsx", "TableRow", "Website", "Project list", { showStates: ["Default", "Hover", "Selected"] })
used("activity-row", "pages/design-system/_components/core-specimens.tsx", "TableRow", "Website", "Recent project activity", { showStates: ["Default", "Hover"] })
used("project-card", "pages/design-system/_components/core-specimens.tsx", "Card", "Website redesign", "Project card")
used("activity-metric", "pages/design-system/_components/core-specimens.tsx", "button", "Completed tasks", "Activity metrics")
used("input", "pages/design-system/_components/core-specimens.tsx", "Input", "Website", "Project name", { showStates: interactive })
used("input-group", "components/auth/LoginForm.tsx", "InputGroup", "password", "Sign-in password", { showStates: interactive })
used("input-group-unit", "pages/design-system/_components/core-specimens.tsx", "InputGroup", "1000", "Storage limit", { suffix: "GB", showStates: interactive })
used("search", "pages/design-system/_components/interaction-states.tsx", "SearchBar", "", "System event filter", { placeholder: "Filter through events...", showStates: interactive })
used("search-clear", "pages/design-system/_components/core-specimens.tsx", "SearchBar", "Clear", "Project search", { showStates: interactive })
used("select-default", "pages/design-system/_components/core-specimens.tsx", "SelectTrigger", "All", "History workspace filter", { prefix: "Workspace", showStates: ["Default", "Hover", "Open", "Focus"] })
used("select-ghost", "pages/design-system/_components/core-specimens.tsx", "SelectTrigger", "0.01", "List grouping", { size: "xs", showStates: ["Default", "Hover", "Open", "Focus"] })
used("select-glass", "pages/design-system/_components/core-specimens.tsx", "SelectTrigger", "EN", "Page display language", { size: "micro", showStates: ["Default", "Hover", "Open", "Focus"] })
used("combobox-default", "pages/design-system/_components/core-specimens.tsx", "ComboboxInput", "Website", "Project picker", { prefix: "Project", showStates: interactive })
used("combobox-ghost", "pages/design-system/_components/core-specimens.tsx", "ComboboxInput", "Website", "Compact project picker", { showStates: ["Default", "Focus"] })
used("select-item", "pages/design-system/_components/core-specimens.tsx", "SelectItem", "Category", "Sort order", { showStates: ["Default", "Highlighted", "Selected"] })
used("combobox-item", "pages/design-system/_components/core-specimens.tsx", "ComboboxItem", "Website", "Project option", { showStates: ["Default", "Highlighted", "Selected"] })
used("dropdown-item", "pages/design-system/_components/interaction-states.tsx", "DropdownMenuItem", "Design", "Workspace navigation", { variant: "sub-trigger", showStates: ["Default", "Highlighted"] })
used("date-item", "components/ui/geist-date-range-picker.tsx", "DropdownMenuItem", "Last 7 Days", "Date preset", { showStates: ["Default", "Highlighted"] })
for (const id of ["date-range", "date-presets", "date-clock", "date-apply", "calendar-day", "calendar-selection", "calendar-dropdown"]) {
  const source = interactionInventory.find(rule => rule.id === id)!
  used(id, "components/ui/geist-date-range-picker.tsx", id.startsWith("calendar-") ? "Calendar" : id === "date-apply" ? "button" : id === "date-clock" ? "input" : "PopoverTrigger", source.sample, "Date range picker", { showStates: source.states.filter(state => !state.disabled).map(state => state.name) })
}
used("checkbox", "pages/design-system/_components/core-specimens.tsx", "Checkbox", "Member", "Member selection", { showStates: ["Default", "Selected", "Focus"] })
used("radio", "pages/design-system/_components/core-specimens.tsx", "RadioGroupItem", "Draft", "Publishing status", { showStates: ["Default", "Selected", "Focus", "Disabled"] })
used("switch", "pages/design-system/_components/core-specimens.tsx", "Switch", "Details", "Chart visibility", { showStates: ["Default", "Selected", "Focus"] })
used("slider", "pages/design-system/_components/core-specimens.tsx", "Slider", "50", "Project parameter", { showStates: interactive })
used("status-emerald", "pages/design-system/_components/core-specimens.tsx", "StatusToggle", "Published", "Published status")
used("status-amber", "pages/design-system/_components/core-specimens.tsx", "StatusToggle", "Draft", "Draft mode", { baseClassName: "w-22" })
used("panel", "pages/design-system/_components/core-specimens.tsx", "Card", "Project overview", "Project panel")
used("stats-panel", "components/ui/stats-strip.tsx", "StatsStripLayout", "Workspace", "Summary stats")
used("stats-item", "pages/design-system/_components/core-specimens.tsx", "StatsStripItem", "Total Value", "Project summary")
used("detail-panel", "pages/design-system/_components/core-specimens.tsx", "Card", "Project details", "Project detail")
used("copy", "pages/design-system/_components/core-specimens.tsx", "CopyField", "project_Lq9pH...3HZsTA_KlAhw", "Workspace API key identifier")
used("breadcrumb", "components/settings/breadcrumbs.tsx", "BreadcrumbLink", "Settings", "Settings navigation")
used("code-disclosure", "pages/design-system/_components/code-disclosure.tsx", "summary", "Show code", "Component code disclosure")
used("textarea", "pages/design-system/_components/core-specimens.tsx", "Textarea", "{\n  \"lookback\": 20\n}", "Project parameters", { baseClassName: "font-mono text-[12px]", showStates: ["Default", "Focus"] })
used("header-button", "components/dashboard/header.tsx", "Button", "Sidebar", "Header sidebar toggle", { size: "icon", showStates: interactive })
used("settings-secondary", "pages/design-system/_components/core-specimens.tsx", "Button", "Create project", "Project creation", { icon: "plus", showStates: interactive })
used("settings-ghost", "pages/design-system/_components/core-specimens.tsx", "Button", "More", "Member actions", { size: "icon", showStates: interactive })
used("settings-row", "pages/design-system/_components/core-specimens.tsx", "div", "admin", "Member list", { showStates: ["Default", "Hover"] })
used("workspace-empty", "pages/design-system/_components/core-specimens.tsx", "div", "Connect workspace", "Workspace setup panel")
