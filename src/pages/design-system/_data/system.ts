export const textColorTokens = [
  { name: "Contrast", className: "text-interface-contrast", light: "#18181b", dark: "#ffffff", blueLight: "#27272a", blueDark: "#f7f7f8", use: "Highest emphasis, selected text, and ranking symbols" },
  { name: "Default", className: "text-interface-default", light: "oklch(0.145 0 0)", dark: "oklch(0.95 0 0)", blueLight: "#27272a", blueDark: "#f7f7f8", use: "Default interface text and action labels" },
  { name: "Primary", className: "text-interface-primary", light: "#27272a", dark: "#e4e4e7", blueLight: "#27272a", blueDark: "#eeeeee", use: "Primary data, panel titles, and sidebar symbols" },
  { name: "Supporting", className: "text-interface-supporting", light: "#3f3f46", dark: "#d4d4d8", blueLight: "#46474c", blueDark: "#dcdcdc", use: "Supporting values, volume, and hover emphasis" },
  { name: "Secondary", className: "text-interface-secondary", light: "#52525b", dark: "#a1a1aa", blueLight: "#46474c", blueDark: "#bebebf", use: "Descriptions, secondary table data, and navigation metadata" },
  { name: "Subtle", className: "text-interface-subtle", light: "oklch(0.45 0 0)", dark: "oklch(0.65 0 0)", blueLight: "#6b6c70", blueDark: "#a0a1a5", use: "Component descriptions, placeholders, and table headers" },
  { name: "Muted", className: "text-interface-muted", light: "#6b6b73", dark: "#71717a", blueLight: "#6b6c70", blueDark: "#a0a1a5", use: "Metadata, timestamps, ranks, and low-emphasis labels" },
  { name: "Disabled", className: "text-interface-disabled", light: "#a1a1aa", dark: "#52525b", blueLight: "#a0a1a5", blueDark: "#6b6c70", use: "Disabled or lowest-emphasis text" },
] as const

export const surfaceTokens = [
  { name: "Canvas", value: "--surface-canvas · light #f6f6f6 / dark #030303", color: "var(--surface-canvas)", use: "Page and sidebar background" },
  { name: "Panel", value: "--surface-panel · light #fff / dark #0c0c0c", color: "var(--surface-panel)", use: "Cards, charts, and settings groups" },
  { name: "Section", value: "--surface-section · light #f9f9f9 / dark #060606", color: "var(--surface-section)", use: "Large split panes between canvas and panel" },
  { name: "Chrome", value: "--surface-chrome · light #f9f9f9 / dark #060606", color: "var(--surface-chrome)", use: "Table heads, panel bars, and fields" },
  { name: "Data inset", value: "--surface-inset · light #f9f9f9 / dark #060606", color: "var(--surface-inset)", use: "History rows and nested data regions" },
  { name: "Control", value: "--surface-control · light #fafafa / dark #111111", color: "var(--surface-control)", use: "Secondary actions and compact controls" },
  { name: "Raised", value: "--surface-raised · light #f1f1f1 / dark #1a1a1a", color: "var(--surface-raised)", use: "Selected ranges and raised controls" },
  { name: "Deep", value: "--surface-deep · light #f6f6f6 / dark #030303", color: "var(--surface-deep)", use: "Terminals, code, and deeply inset data" },
  { name: "Overlay", value: "--surface-overlay · popover", color: "var(--surface-overlay)", use: "Menus, dialogs, and popovers" },
] as const

export const colorPalettes = [
  {
    name: "Interface",
    colors: [
      { name: "Default boundary", value: "--boundary-default", color: "var(--boundary-default)" },
      { name: "Subtle divider", value: "--boundary-subtle", color: "var(--boundary-subtle)" },
      { name: "Foreground", value: "--foreground", color: "var(--foreground)" },
      { name: "Muted text", value: "--muted-foreground", color: "var(--muted-foreground)" },
      { name: "Field focus", value: "--ring", color: "var(--ring)" },
      { name: "Control focus", value: "--keyboard-focus", color: "var(--keyboard-focus)" },
    ],
  },
  {
    name: "Text hierarchy",
    colors: [
      { name: "Primary data", value: "--interface-primary", color: "var(--interface-primary)" },
      { name: "Secondary", value: "--interface-secondary", color: "var(--interface-secondary)" },
      { name: "Muted", value: "--interface-muted", color: "var(--interface-muted)" },
      { name: "Disabled", value: "--interface-disabled", color: "var(--interface-disabled)" },
    ],
  },
  {
    name: "Status",
    colors: [
      { name: "Success", value: "--signal-success", color: "var(--signal-success)" },
      { name: "Information", value: "--signal-info", color: "var(--signal-info)" },
      { name: "Error", value: "--signal-danger", color: "var(--signal-danger)" },
      { name: "Warning", value: "--signal-warning", color: "var(--signal-warning)" },
    ],
  },
  {
    name: "Chart strokes (not text)",
    colors: [
      { name: "Positive", value: "--plot-success", color: "var(--plot-success)" },
      { name: "Negative", value: "--plot-danger", color: "var(--plot-danger)" },
      { name: "Gold", value: "--plot-gold", color: "var(--plot-gold)" },
      { name: "Sky", value: "--plot-sky", color: "var(--plot-sky)" },
    ],
  },
] as const

export { typeTokens } from './typography.generated'

export const spacingTokens = [
  { name: "Micro", value: "2px · gap-0.5", use: "Icon and status separation" },
  { name: "Tight", value: "4px · gap-1", use: "Label and supporting value" },
  { name: "Icon", value: "6px · gap-1.5", use: "Icon and control label" },
  { name: "Control", value: "8px · gap-2", use: "Inline controls" },
  { name: "Compact inset", value: "12px · px-3", use: "Compact control padding" },
  { name: "Panel inset", value: "16px · px-4", use: "Cards, tables, panel headers" },
  { name: "Page inset", value: "20px · px-5", use: "Narrow content gutter" },
  { name: "Section", value: "24px · gap-6", use: "Card inset and section rhythm" },
  { name: "Wide gutter", value: "32px · px-8", use: "Desktop gutter and large inset" },
] as const

export const iconTokens = [
  { name: "Micro", value: "12px · size-3", use: "Dense labels and small icons" },
  { name: "Dense", value: "14px · size-3.5", use: "Compact actions and toggles" },
  { name: "Control", value: "16px · size-4", use: "Inputs, selects, and icon controls" },
  { name: "Section", value: "20px · size-5", use: "Page and panel identity" },
] as const

export const controlTokens = [
  { name: "Compact", value: "28px · h-7", use: "Dense tabs and icon controls" },
  { name: "Action", value: "32px · h-8", use: "All standard buttons and actions" },
  { name: "Large action", value: "44px · Button lg", use: "Login submission and explicitly enlarged actions; current landing CTAs use 32px" },
  { name: "Default field", value: "36px · h-9", use: "Inputs and selects" },
  { name: "Large field", value: "40px · h-10", use: "Larger inputs and selects" },
  { name: "Panel row", value: "44px · h-11", use: "Panel rows and settings fields" },
] as const

export const shapeTokens = [
  { name: "Compact", value: "4px", radius: "calc(var(--radius) - 4px)" },
  { name: "Control", value: "6px", radius: "calc(var(--radius) - 2px)" },
  { name: "Panel", value: "8px", radius: "var(--radius)" },
  { name: "Large panel", value: "12px", radius: "calc(var(--radius) + 4px)" },
  { name: "Pill", value: "9999px", radius: "9999px" },
] as const

export const boundaryTokens = [
  { name: "Component shell", value: "1px · boundary-default", use: "Cards, panels, dialogs, and grouped fields" },
  { name: "Structural divider", value: "1px · boundary-default", use: "Panel headers, footers, and major subsections" },
  { name: "Dense row divider", value: "1px · boundary-subtle", use: "Table, list, terminal, and compact data rows" },
  { name: "Hover boundary", value: "1px · boundary-strong", use: "Cards, panels, and design-system exhibit frames" },
  { name: "Focus / open", value: "1px · boundary-focus", use: "Focused fields and open selectors" },
] as const

export const depthTokens = [
  { id: "control", name: "Control", value: "--elevation-control", use: "Inputs, tabs, and compact actions" },
  { id: "panel", name: "Panel", value: "--elevation-panel", use: "Default cards follow theme elevation; panel variants use borders" },
  { id: "overlay", name: "Overlay", value: "--elevation-overlay", use: "Menus, dialogs, and popovers" },
] as const

export const motionTokens = [
  { id: "responsive", name: "Responsive", value: "150ms · ease-out", use: "Hover, focus, selection and small icon reactions" },
  { id: "control", name: "Control", value: "200ms · ease-out", use: "Theme changes, menus, popovers and dialogs" },
  { id: "panel", name: "Panel", value: "300ms · ease-in-out", use: "Expanding and collapsing panels" },
] as const

export const behaviorRows = [
  { state: "Missing values", rule: "Show unavailable values as —. Keep loading, empty, and error states distinct." },
  { state: "Feedback", rule: "Confirm completed actions and provide a clear recovery action when something fails." },
] as const
