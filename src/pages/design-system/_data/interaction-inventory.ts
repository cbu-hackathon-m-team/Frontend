// Documentation inventory of component styles; runtime styles stay with their components.
export interface InteractionState {
  name: string
  className: string
  disabled?: boolean
  loading?: boolean
  checked?: boolean
  invalid?: boolean
}

export interface InteractionRecord {
  id: string
  group: string
  name: string
  source: string
  kind: "button" | "action" | "toggle" | "tab" | "select" | "badge" | "input" | "textarea" | "input-group" | "search" | "checkbox" | "radio" | "switch" | "slider" | "status" | "copy" | "generic"
  variant?: string
  theme?: "zinc" | "white" | "orange" | "rose"
  sample: string
  value: string
  baseClassName?: string
  states: readonly InteractionState[]
}

const rest: InteractionState = { name: "Default", className: "" }
const controlFocus: InteractionState = { name: "Focus", className: "outline-2 outline-offset-2 outline-keyboard-focus" }
const focus: InteractionState = { name: "Focus", className: "border-ring ring-[3px] ring-ring/50" }
const fieldFocus: InteractionState = { name: "Focus", className: "border-boundary-focus ring-[3px] ring-ring/50" }
const disabled: InteractionState = { name: "Disabled", className: "opacity-50", disabled: true }
const invalid: InteractionState = { name: "Invalid", className: "", invalid: true }
const hover = (className: string): InteractionState => ({ name: "Hover", className })
const selected = (className: string): InteractionState => ({ name: "Selected", className, checked: true })
const highlighted = (className: string): InteractionState => ({ name: "Highlighted", className })
const open = (className: string): InteractionState => ({ name: "Open", className })
const pressed = (className: string): InteractionState => ({ name: "Pressed", className })

export const interactionInventory: InteractionRecord[] = []
function add(rule: InteractionRecord) { interactionInventory.push(rule) }
function sample(group: string, id: string, name: string, source: string, value: string, baseClassName: string, states: readonly InteractionState[], text = "Overview", variant?: string) {
  add({ id, group, name, source, value, baseClassName, states, variant, sample: text, kind: "generic" })
}

const buttons = [
  { variant: "default", hover: "bg-primary/90", value: "primary → primary/90" },
  { variant: "secondary", hover: "bg-button-secondary-hover", value: "button-secondary → button-secondary-hover · button-secondary-border" },
  { variant: "outline", hover: "border-boundary-strong", value: "transparent · boundary-default → boundary-strong" },
  { variant: "ghost", hover: "bg-interaction-button-hover text-interface-contrast", value: "transparent → interaction-button-hover" },
  { variant: "destructive", hover: "bg-destructive/90 dark:bg-destructive/90", value: "destructive/60 → destructive/90 (dark)" },
  { variant: "link", hover: "underline", value: "primary · underline" },
] as const
for (const button of buttons) {
  add({ id: `button-${button.variant}`, group: "Button", kind: "button", variant: button.variant, name: `Button / ${button.variant}`, source: "ui/button.tsx", sample: "Save changes", value: `${button.value} · 150ms`, states: [rest, hover(button.hover), controlFocus, button.variant === "default" ? { ...disabled, className: "bg-interface-secondary opacity-80" } : disabled, invalid] })
}

const actions = [
  { theme: "zinc", sample: "Generate Report", hover: "bg-button-secondary-hover", value: "button-secondary → button-secondary-hover" },
  { theme: "white", sample: "Resume All", hover: "bg-interface-primary", value: "contrast → interface-primary" },
  { theme: "orange", sample: "Archive (2)", hover: "bg-signal-attention/10 text-signal-attention border-signal-attention/30", value: "orange/10 · orange/30" },
  { theme: "rose", sample: "Stop All", hover: "bg-signal-danger/10 text-signal-danger border-signal-danger/30", value: "rose/10 · rose/30" },
] as const
for (const action of actions) {
  add({ id: `action-${action.theme}`, group: "Action Button", kind: "action", theme: action.theme, name: `ActionButton / ${action.theme}`, source: "ui/action-button.tsx", sample: action.sample, value: `${action.value} · scale .95 · 150ms`, states: [rest, hover(action.hover), pressed(`${action.hover} scale-95`), controlFocus, { ...disabled, className: "" }, { name: "Loading", className: "", loading: true }, invalid] })
}

for (const tab of [
  { variant: "default", hover: "text-interface-primary", selected: "bg-interaction-selected text-interface-contrast", value: "interaction-selected · blue focus / 2px gap" },
  { variant: "ghost", hover: "text-interface-secondary", selected: "bg-interaction-hover-control text-interface-contrast", value: "interaction-hover-control · text-interface-contrast" },
  { variant: "line", hover: "text-interface-primary", selected: "border-contrast text-interface-contrast", value: "border-contrast · text-interface-contrast" },
]) {
  add({ id: `tab-${tab.variant}`, group: "Tabs & Toggle", kind: "tab", variant: tab.variant, name: `Tabs / ${tab.variant}`, source: "ui/tabs.tsx", sample: "Overview", value: `${tab.value} · 150ms`, states: [rest, hover(tab.hover), selected(tab.selected), controlFocus, disabled] })
}
for (const toggle of [
  { variant: "default", hover: "bg-muted text-interface-contrast", selected: "bg-accent text-accent-foreground", value: "muted hover · accent selected" },
  { variant: "outline", hover: "bg-interaction-button-hover text-interface-contrast", selected: "bg-interaction-selected text-interface-contrast", value: "border-input · neutral hover · interaction-selected" },
  { variant: "glass", hover: "bg-interaction-button-hover text-interface-contrast", selected: "bg-interaction-button-hover text-interface-contrast border-boundary-default", value: "interaction-button-hover · boundary-default" },
]) {
  add({ id: `toggle-${toggle.variant}`, group: "Tabs & Toggle", kind: "toggle", variant: toggle.variant, name: `Toggle / ${toggle.variant}`, source: "ui/toggle.tsx", sample: "Chart", value: `${toggle.value} · 150ms colors only`, states: [rest, hover(toggle.hover), selected(toggle.selected), { name: "Selected + hover", className: toggle.selected, checked: true }, controlFocus, disabled] })
}

sample("Navigation & Rows", "sidebar-product", "Dashboard sidebar", "dashboard/sidebar.tsx", "hover 8% · selected 10% · inset 8%", "type-body-md-medium flex w-full items-center rounded-md px-2.5 py-2 text-interface-secondary", [rest, hover("bg-interaction-hover-control text-interface-supporting"), selected("bg-interaction-selected text-interface-contrast ring-1 ring-inset ring-interaction-hover-control"), controlFocus])
sample("Navigation & Rows", "sidebar-hover-button", "Collapsed sidebar navigation", "ui/sidebar-hover-panel.tsx", "40px control · 20px icon · 12px radius · shared navigation states", "type-body-md-medium inline-flex size-10 items-center justify-center rounded-xl text-interface-secondary", [rest, hover("bg-interaction-hover-control text-interface-supporting"), selected("bg-interaction-selected text-interface-contrast ring-1 ring-inset ring-interaction-hover-control"), controlFocus, disabled], "P")
for (const variant of ["default", "outline"]) {
  sample("Navigation & Rows", `sidebar-${variant}`, `Sidebar primitive / ${variant}`, "ui/sidebar.tsx", "sidebar-accent · blue focus / 2px gap", `flex h-8 w-full items-center rounded-md p-2 text-sm text-sidebar-foreground ${variant === "outline" ? "bg-background shadow-[0_0_0_1px_var(--sidebar-border)]" : ""}`, [rest, hover("bg-sidebar-accent text-sidebar-accent-foreground"), pressed("bg-sidebar-accent text-sidebar-accent-foreground"), selected("bg-sidebar-accent font-medium text-sidebar-accent-foreground"), controlFocus, disabled])
}
sample("Navigation & Rows", "sidebar-product-variant", "Sidebar product navigation", "ui/sidebar.tsx", "hover 8% · selected 10%", "type-body-md-medium", [rest, hover("bg-interaction-hover-control text-interface-supporting"), selected("bg-interaction-selected text-interface-contrast"), controlFocus, disabled], "Overview", "product")
sample("Navigation & Rows", "sidebar-sub", "Sidebar sub-item", "ui/sidebar.tsx", "sidebar-accent · blue focus / 2px gap", "flex h-7 w-full items-center rounded-md px-2 text-sm text-sidebar-foreground", [rest, hover("bg-sidebar-accent text-sidebar-accent-foreground"), pressed("bg-sidebar-accent text-sidebar-accent-foreground"), selected("bg-sidebar-accent text-sidebar-accent-foreground"), controlFocus, disabled])
sample("Navigation & Rows", "sidebar-brand", "Sidebar brand trigger", "dashboard/sidebar.tsx", "hover 8% · open 10%", "flex h-10 w-full items-center rounded-md px-2.5 text-interface-contrast", [rest, hover("bg-interaction-hover-control"), open("bg-interaction-selected"), controlFocus], "Hapalin Studio")
sample("Navigation & Rows", "sidebar-account", "Sidebar account trigger", "dashboard/sidebar.tsx", "hover 8% · open 10% · text-interface-contrast", "flex h-10 w-full items-center rounded-md px-2.5 text-interface-secondary", [rest, hover("bg-interaction-hover-control text-interface-contrast"), open("bg-interaction-selected text-interface-contrast"), controlFocus], "Account")
sample("Navigation & Rows", "table", "Table row", "ui/table.tsx", "hover 4% · selected 6% · 150ms", "flex h-9 w-full items-center border-b border-boundary-subtle px-3 text-[13px] text-interface-secondary", [rest, hover("bg-table-row-hover"), selected("bg-table-row-selected")], "Website")
sample("Navigation & Rows", "project-row", "Project list row", "pages/design-system/_components/interaction-states.tsx", "hover 4% · selected 6%", "flex w-full items-center px-3 py-3", [rest, hover("bg-table-row-hover"), selected("bg-table-row-selected")], "Website")
sample("Navigation & Rows", "activity-row", "Activity row", "pages/design-system/_components/interaction-states.tsx", "hover 4%", "flex w-full items-center rounded-md px-3 py-2", [rest, hover("bg-table-row-hover")], "Website")
for (const variant of ["default", "outline", "muted"]) {
  sample("Navigation & Rows", `item-${variant}`, `Item link / ${variant}`, "ui/item.tsx", "accent/50 · ring/50 3px · 150ms", `flex w-full items-center rounded-md border p-3 text-sm ${variant === "outline" ? "border-border" : "border-transparent"} ${variant === "muted" ? "bg-muted/50" : "bg-transparent"}`, [rest, hover("bg-accent/50"), focus])
}
sample("Navigation & Rows", "nav-trigger", "Navigation menu trigger", "ui/navigation-menu.tsx", "accent → open accent/50", "flex h-9 w-full items-center rounded-md bg-background px-4 text-sm font-medium", [rest, hover("bg-accent text-accent-foreground"), open("bg-accent/50 text-accent-foreground"), { ...focus, className: "bg-accent text-accent-foreground ring-[3px] ring-ring/50 outline-1" }, disabled])
sample("Navigation & Rows", "nav-link", "Navigation menu link", "ui/navigation-menu.tsx", "accent · selected accent/50", "flex w-full rounded-sm p-2 text-sm", [rest, hover("bg-accent text-accent-foreground"), selected("bg-accent/50 text-accent-foreground"), { ...focus, className: "bg-accent text-accent-foreground ring-[3px] ring-ring/50 outline-1" }])

const fieldHover = hover("border-boundary-strong")
for (const kind of ["input", "textarea", "input-group", "search"] as const) {
  add({ id: kind, group: "Fields", kind, name: ({ input: "Input", textarea: "Textarea", "input-group": "Input Group / default", search: "Search Input" })[kind], source: `ui/${kind === "search" ? "search-bar" : kind}.tsx`, sample: kind === "search" ? "Search projects" : "alex_kim", value: kind === "textarea" ? "input/30 · ring/50 3px (dark)" : "boundary-default → strong → focus", states: [rest, ...(kind === "textarea" ? [] : [fieldHover]), kind === "textarea" ? focus : kind === "search" ? { ...fieldFocus, className: `${fieldFocus.className} [&_.lucide-search]:text-interface-contrast` } : fieldFocus, { ...disabled, className: "" }, invalid] })
}
add({ id: "input-group-unit", group: "Fields", kind: "input-group", variant: "unit", name: "Input Group / unit", source: "ui/input-group.tsx", sample: "1000", value: "surface-chrome addon · boundary-focus", states: [rest, fieldHover, fieldFocus, { ...disabled, className: "" }, invalid] })
add({ id: "search-clear", group: "Fields", kind: "button", variant: "ghost", name: "Search clear button", source: "ui/search-bar.tsx", sample: "Clear", baseClassName: "text-interface-muted hover:text-interface-contrast hover:bg-transparent", value: "text-interface-contrast", states: [rest, hover("bg-transparent text-interface-contrast"), controlFocus] })
for (const select of [
  { variant: "default", hover: "border-boundary-strong", open: "border-boundary-focus ring-[3px] ring-ring/50", value: "boundary-default → strong → focus" },
  { variant: "ghost", hover: "bg-interaction-subtle", open: "bg-interaction-subtle", value: "transparent → interaction-subtle" },
  { variant: "glass", hover: "bg-interaction-raised text-interface-contrast", open: "bg-interaction-raised text-interface-contrast", value: "interaction-subtle → interaction-raised" },
]) {
  add({ id: `select-${select.variant}`, group: "Fields", kind: "select", variant: select.variant, name: `Select / ${select.variant}`, source: "ui/select.tsx", sample: "All Team Roles", value: select.value, states: [rest, hover(select.hover), open(select.open), fieldFocus, disabled] })
}
sample("Fields", "combobox-default", "Combobox / default", "ui/combobox.tsx", "InputGroup focus · boundary-focus", "flex h-9 w-full items-center rounded-md border border-boundary-default bg-surface-control px-3 text-[13px] text-interface-primary", [rest, fieldHover, fieldFocus, { ...disabled, className: "text-interface-primary/50" }])
sample("Fields", "combobox-ghost", "Combobox / ghost", "ui/combobox.tsx", "transparent border · no focus ring", "flex h-9 w-full items-center rounded-md border border-transparent bg-transparent text-[13px] text-interface-primary", [rest, { name: "Focus", className: "border-transparent ring-0" }, { ...disabled, className: "text-interface-primary/50" }])
sample("Fields", "combobox-chips", "Combobox chips", "ui/combobox.tsx", "input/30 · border-ring · destructive", "flex min-h-9 w-full items-center rounded-md border border-input px-2.5 text-sm dark:bg-input/30", [rest, focus, { name: "Invalid", className: "border-destructive ring-[3px] ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40" }], "Website")
sample("Fields", "otp", "Input OTP slot", "ui/input-otp.tsx", "input/30 · border-ring · ring/50 3px", "flex size-9 items-center justify-center rounded-md border border-input text-sm dark:bg-input/30", [rest, { name: "Active", className: "border-ring ring-[3px] ring-ring/50" }, { name: "Invalid", className: "border-destructive" }, { name: "Active + invalid", className: "border-destructive ring-[3px] ring-destructive/20 dark:ring-destructive/40" }, disabled], "3")
for (const part of ["range", "presets"]) {
  sample("Fields", `date-${part}`, `Date range / ${part} trigger`, "ui/geist-date-range-picker.tsx", "contrast/5 · open boundary-focus", part === "range" ? "flex h-9 w-full items-center rounded-l-md border border-boundary-default px-2 text-[13px] text-interface-contrast" : "flex h-9 items-center justify-center rounded-r-md border border-boundary-default px-2.5 text-interface-contrast", [rest, hover("bg-interaction-subtle"), open("border-boundary-focus ring-[3px] ring-ring/50"), fieldFocus], part === "range" ? "Sep 14 – Oct 14" : "")
}
sample("Fields", "date-clock", "Date range time field", "ui/geist-date-range-picker.tsx", "surface-panel · focus ring/50 3px", "flex h-9 w-full items-center rounded-md border border-boundary-default bg-surface-panel px-3 text-sm text-tone-100", [rest, fieldFocus], "09:30")
sample("Fields", "date-apply", "Date range apply", "ui/geist-date-range-picker.tsx", "interaction-subtle → interaction-raised · 150ms", "flex h-9 items-center justify-center rounded-md border border-boundary-default bg-interaction-subtle px-3 text-sm font-medium text-interface-contrast", [rest, hover("bg-interaction-raised"), fieldFocus], "Apply")

const menuBase = "flex w-full items-center rounded-sm px-2 py-1.5 text-[13px]"
for (const menu of [
  { id: "select-item", name: "Select item", source: "ui/select.tsx", base: "text-interface-primary", highlight: "bg-interaction-hover-control text-interface-contrast" },
  { id: "combobox-item", name: "Combobox item", source: "ui/combobox.tsx", base: "text-interface-primary", highlight: "bg-contrast/8 text-interface-contrast" },
  { id: "dropdown-item", name: "Dropdown item", source: "ui/dropdown-menu.tsx", base: "text-interface-primary", highlight: "bg-contrast/8 text-interface-contrast" },
  { id: "context-item", name: "Context menu item", source: "ui/context-menu.tsx", base: "text-interface-default", highlight: "bg-accent text-accent-foreground" },
  { id: "menubar-item", name: "Menubar item", source: "ui/menubar.tsx", base: "text-interface-default", highlight: "bg-accent text-accent-foreground" },
  { id: "command-item", name: "Command item", source: "ui/command.tsx", base: "text-interface-default", highlight: "bg-accent text-accent-foreground" },
  { id: "date-item", name: "Date range menu item", source: "ui/geist-date-range-picker.tsx", base: "text-interface-primary", highlight: "bg-contrast/8 text-interface-contrast" },
]) {
  sample("Menus", menu.id, menu.name, menu.source, menu.highlight.replaceAll("bg-", "").replaceAll("text-", ""), `${menuBase} ${menu.base}`, [rest, highlighted(menu.highlight), ...(menu.id === "command-item" ? [selected(menu.highlight)] : menu.id === "select-item" || menu.id === "combobox-item" ? [selected("")] : []), disabled], "Member", menu.id === "select-item" || menu.id === "combobox-item" ? "check-end" : undefined)
}
for (const menu of ["dropdown", "context", "menubar"] as const) {
  sample("Menus", `${menu}-destructive`, `${menu} / destructive`, `ui/${menu === "dropdown" ? "dropdown-menu" : menu === "context" ? "context-menu" : "menubar"}.tsx`, "destructive/10 · destructive/20 (dark)", `${menuBase} text-destructive`, [rest, highlighted("bg-destructive/10 text-destructive dark:bg-destructive/20"), disabled], "Delete")
  for (const kind of ["checkbox", "radio", "sub-trigger"] as const) {
    const hi = menu === "dropdown" ? "bg-contrast/8 text-interface-contrast" : "bg-accent text-accent-foreground"
    sample("Menus", `${menu}-${kind}`, `${menu} / ${kind}`, `ui/${menu === "dropdown" ? "dropdown-menu" : menu === "context" ? "context-menu" : "menubar"}.tsx`, menu === "dropdown" ? "contrast/8 · text-interface-contrast" : "accent · accent-foreground", `${menuBase} ${menu === "dropdown" ? "text-interface-primary" : "text-interface-default"}`, [rest, highlighted(hi), kind === "sub-trigger" ? open(hi) : selected(""), kind === "sub-trigger" ? { ...disabled, className: "" } : disabled], kind === "sub-trigger" ? "More options" : "Member", kind === "sub-trigger" ? "sub-trigger" : kind)
  }
}
sample("Menus", "menubar-trigger", "Menubar trigger", "ui/menubar.tsx", "accent · accent-foreground", "flex rounded-sm px-2 py-1 text-sm font-medium", [rest, highlighted("bg-accent text-accent-foreground"), open("bg-accent text-accent-foreground")], "File")
sample("Menus", "chip-remove", "Combobox chip remove", "ui/combobox.tsx", "opacity .50 → 1", "inline-flex items-center text-interface-default opacity-50", [rest, hover("opacity-100")], "×")

for (const kind of ["checkbox", "radio", "switch"] as const) {
  add({ id: kind, group: "Selection controls", kind, name: kind === "radio" ? "Radio group item" : kind[0].toUpperCase() + kind.slice(1), source: `ui/${kind === "radio" ? "radio-group" : kind}.tsx`, sample: "Enabled", value: kind === "switch" ? "input/80 → primary · blue focus / 2px gap" : "primary · blue focus / 2px gap · disabled .50", states: [rest, selected(""), controlFocus, disabled, ...(kind === "switch" ? [] : [invalid])] })
}
add({ id: "slider", group: "Selection controls", kind: "slider", name: "Slider thumb", source: "ui/slider.tsx", sample: "50", value: "hover scale 1.10 / ring 4px · blue focus / 2px gap", states: [rest, hover("[&_[data-slot=slider-thumb]]:scale-110 [&_[data-slot=slider-thumb]]:ring-4"), { name: "Focus", className: "[&_[data-slot=slider-thumb]]:scale-110 [&_[data-slot=slider-thumb]]:outline-2 [&_[data-slot=slider-thumb]]:outline-offset-2 [&_[data-slot=slider-thumb]]:outline-keyboard-focus" }, disabled] })
sample("Selection controls", "field-label", "Field label selection", "ui/field.tsx", "primary/5 → primary/10 (dark)", "flex w-full items-center rounded-md border border-border p-3 text-sm", [rest, selected("bg-primary/5 border-primary dark:bg-primary/10"), disabled], "Draft")
sample("Calendar", "calendar-day", "Calendar day / interaction", "ui/calendar.tsx", "interaction-selected · ring/50 · muted", "flex size-8 items-center justify-center rounded-md text-[13px]", [rest, hover("bg-interaction-selected text-interface-contrast"), focus, { ...disabled, className: "text-interface-subtle opacity-50" }, { name: "Today", className: "font-bold text-signal-accent" }, { name: "Outside", className: "text-interface-subtle" }], "14")
sample("Calendar", "calendar-selection", "Calendar day / selection", "ui/calendar.tsx", "contrast endpoints · interaction-selected range", "flex size-8 items-center justify-center rounded-md text-[13px]", [rest, selected("bg-contrast text-on-contrast"), { name: "Range start", className: "rounded-r-none bg-contrast text-on-contrast" }, { name: "Range middle", className: "rounded-none bg-interaction-selected text-interface-primary" }, { name: "Range end", className: "rounded-l-none bg-contrast text-on-contrast" }], "14")
sample("Selection controls", "calendar-dropdown", "Calendar month trigger", "ui/calendar.tsx", "contrast/5", "flex h-8 items-center rounded-md px-3 text-[13px]", [rest, hover("bg-interaction-subtle")], "October")
for (const variant of ["emerald", "amber", "zinc"]) {
  add({ id: `status-${variant}`, group: "Selection controls", kind: "status", variant, name: `Status toggle / ${variant}`, source: "ui/status-toggle.tsx", sample: variant === "zinc" ? "Standby" : variant === "amber" ? "Paused" : "Running", value: `${variant === "zinc" ? "border 15% → 30%" : `${variant} border 40% → 80%`} · scale .95 · 150ms`, states: [rest, hover(variant === "zinc" ? "border-contrast/30" : variant === "amber" ? "border-status-warning-border/80" : "border-status-success-border/80"), pressed(`${variant === "zinc" ? "border-contrast/30" : variant === "amber" ? "border-status-warning-border/80" : "border-status-success-border/80"} scale-95`)] })
}

for (const badge of [
  ...["success", "warning", "error", "muted"].map(variant => ({ variant, hover: "" })),
  { variant: "default", hover: "bg-primary/90" }, { variant: "secondary", hover: "bg-secondary/90" },
  { variant: "destructive", hover: "bg-destructive/90 dark:bg-destructive/90" }, { variant: "outline", hover: "bg-accent text-accent-foreground" },
]) {
  add({ id: `badge-${badge.variant}`, group: "Surfaces & utilities", kind: "badge", variant: badge.variant, name: `Badge link / ${badge.variant}`, source: "ui/badge.tsx", sample: "Status", value: `${badge.hover.replace("bg-", "")} · ring/50 3px`, states: [rest, hover(badge.hover), badge.variant === "destructive" ? { ...focus, className: "border-ring ring-[3px] ring-destructive/20 dark:ring-destructive/40" } : focus, invalid] })
}
sample("Surfaces & utilities", "panel", "Dashboard panel", "pages/design-system/_components/interaction-states.tsx", "boundary-default → strong · 150ms", "flex min-h-10 w-full items-center rounded-lg border border-boundary-default bg-surface-panel px-3 py-2 text-[13px] font-semibold text-interface-contrast", [rest, hover("border-boundary-strong")], "Workspace activity")
add({ id: "copy", group: "Surfaces & utilities", kind: "copy", name: "Copy field", source: "ui/copy-field.tsx", sample: "0x1234…abcd", value: "secondary surface / boundary · copied check", states: [rest, hover("bg-button-secondary-hover [&>span]:text-interface-primary [&>svg]:text-interface-contrast"), controlFocus, { name: "Copied", className: "", checked: true }] })
sample("Surfaces & utilities", "stats-panel", "Stats strip panel", "ui/stats-strip.tsx", "boundary-default → strong · 150ms", "flex min-h-10 w-full items-center rounded-lg border border-boundary-default bg-surface-panel px-3 text-interface-contrast", [rest, hover("border-boundary-strong")], "Workspace")
sample("Surfaces & utilities", "stats-item", "Stats strip item", "ui/card.tsx", "hover 4% · interface-secondary → interface-primary", "flex min-h-10 w-full items-center px-3 text-[11px] font-bold text-interface-secondary", [rest, hover("bg-card-emphasis text-interface-primary")], "Total value")
sample("Surfaces & utilities", "breadcrumb", "Breadcrumb link", "ui/breadcrumb.tsx", "muted-foreground → foreground · 150ms", "text-[13px] text-interface-subtle", [rest, hover("text-interface-default")], "Settings")
sample("Surfaces & utilities", "empty-link", "Empty state description link", "ui/empty.tsx", "muted-foreground → primary · underline", "text-sm text-interface-subtle underline underline-offset-4", [rest, hover("text-primary")], "Learn more")
sample("Surfaces & utilities", "code-disclosure", "Code disclosure", "pages/design-system/design-system.module.css", "muted-foreground → foreground · 150ms", "type-label-md text-interface-subtle", [rest, hover("text-interface-default")], "Show code")
sample("Surfaces & utilities", "accordion", "Accordion trigger", "ui/accordion.tsx", "underline · ring/50 3px · open chevron", "flex h-10 w-full items-center justify-between rounded-md text-sm font-medium", [rest, hover("underline"), open(""), focus, disabled], "Details")
for (const name of ["dialog", "sheet"]) {
  sample("Surfaces & utilities", `${name}-close`, `${name} close`, `ui/${name}.tsx`, "opacity .70 → 1 · focus ring 2px", "inline-flex size-6 items-center justify-center rounded-xs text-interface-default opacity-70", [rest, hover("opacity-100"), { name: "Focus", className: "ring-2 ring-ring ring-offset-2 ring-offset-background outline-none" }, open(name === "dialog" ? "bg-accent text-interface-subtle" : "bg-secondary")], "×")
}
sample("Surfaces & utilities", "resize", "Resizable handle", "ui/resizable.tsx", "ring 1px · offset 1px", "flex h-8 w-px bg-border", [rest, { name: "Focus", className: "ring-1 ring-ring ring-offset-1" }], "")
sample("Surfaces & utilities", "scroll-area", "Scroll Area viewport", "ui/scroll-area.tsx", "ring/50 3px · outline 1px", "flex min-h-10 w-full items-center rounded-md px-3 text-sm", [rest, { name: "Focus", className: "ring-[3px] ring-ring/50 outline-1" }], "Scrollable content")
sample("Surfaces & utilities", "label", "Label / disabled field", "ui/label.tsx", "disabled opacity .50", "text-sm font-medium", [rest, disabled], "Display name")
// Compositions delegate these state rules to Button rather than defining a new palette.
for (const delegate of [
  { id: "alert-action", name: "Alert dialog action", source: "ui/alert-dialog.tsx", variant: "default" },
  { id: "alert-cancel", name: "Alert dialog cancel", source: "ui/alert-dialog.tsx", variant: "secondary" },
  { id: "input-addon-button", name: "Input Group button", source: "ui/input-group.tsx", variant: "ghost" },
  { id: "pagination", name: "Pagination link", source: "ui/pagination.tsx", variant: "ghost" },
]) {
  const button = buttons.find(button => button.variant === delegate.variant)!
  add({ ...delegate, group: "Composed controls", kind: "button", sample: "Continue", value: `Button / ${delegate.variant}`, states: [rest, hover(button.hover), ...(delegate.id === "pagination" ? [selected("bg-interaction-button-hover text-interface-contrast border-boundary-default shadow-sm")] : []), controlFocus, disabled] })
}
for (const variant of ["default", "outline", "glass"]) {
  const source = interactionInventory.find(rule => rule.id === `toggle-${variant}`)!
  add({ ...source, id: `toggle-group-${variant}`, group: "Composed controls", name: `Toggle Group / ${variant}`, source: "ui/toggle-group.tsx" })
}

sample("Composition examples", "member-row", "Member list row", "pages/design-system/_components/interaction-states.tsx", "hover 4% · selected 6% · 150ms", "flex h-9 w-full items-center border-b border-boundary-subtle px-3 text-[13px] text-interface-secondary", [rest, hover("bg-table-row-hover"), selected("bg-table-row-selected")], "Website")
sample("Composition examples", "project-card", "Project / card", "pages/design-system/_components/interaction-states.tsx", "hover 4% · selected 4% + border", "flex min-h-10 w-full items-center rounded-xl border border-boundary-default bg-surface-chrome px-3 text-[13px]", [rest, hover("bg-card-emphasis border-boundary-strong"), selected("bg-card-emphasis border-boundary-strong")], "Project")
sample("Composition examples", "activity-metric", "Activity metric tab", "pages/design-system/_components/interaction-states.tsx", "hover 4% · selected 6% · 150ms", "flex min-h-10 w-full items-center border border-boundary-subtle px-3 text-[13px]", [rest, hover("bg-table-row-hover"), selected("bg-table-row-selected"), { name: "Focus", className: "ring-1 ring-inset ring-contrast/40" }], "Completed tasks")
sample("Composition examples", "detail-panel", "Project detail panel", "pages/design-system/_components/interaction-states.tsx", "boundary-default → strong · 150ms", "flex min-h-10 w-full items-center rounded-lg border border-boundary-default bg-surface-chrome px-3 text-[13px] text-interface-contrast shadow-panel", [rest, hover("border-boundary-strong")], "Project details")
add({ id: "header-button", group: "Composition examples", kind: "button", variant: "ghost", name: "Header sidebar toggle", source: "dashboard/header.tsx", sample: "Sidebar", baseClassName: "size-8 p-0", value: "interaction-button-hover", states: [rest, hover("bg-interaction-button-hover text-interface-contrast"), controlFocus] })
sample("Composition examples", "settings-row", "Settings list row", "pages/design-system/_components/interaction-states.tsx", "hover 4%", "flex min-h-10 w-full items-center px-3 text-[14px]", [rest, hover("bg-table-row-hover")], "Admin")
sample("Composition examples", "workspace-empty", "Workspace setup panel", "pages/design-system/_components/interaction-states.tsx", "hover 4% · boundary-strong · 150ms", "flex min-h-10 w-full items-center rounded-lg border border-dashed border-boundary-default bg-surface-panel px-3 text-[13px]", [rest, hover("bg-card-emphasis border-boundary-strong")], "Connect workspace")
add({ id: "settings-secondary", group: "Composition examples", kind: "button", variant: "secondary", name: "Settings secondary button", source: "pages/design-system/_components/interaction-states.tsx", sample: "Connect key", baseClassName: "text-interface-contrast", value: "button-secondary → button-secondary-hover", states: [rest, hover("bg-button-secondary-hover"), controlFocus, disabled] })
add({ id: "settings-ghost", group: "Composition examples", kind: "button", variant: "ghost", name: "Settings icon override", source: "pages/design-system/_components/interaction-states.tsx", sample: "More", baseClassName: "text-interface-muted hover:text-interface-contrast", value: "interaction-button-hover", states: [rest, hover("bg-interaction-button-hover text-interface-contrast"), controlFocus] })

export const interactionGroups = Array.from(new Set(interactionInventory.map(rule => rule.group)))
