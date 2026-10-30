import { projectCardClasses, memberRowClasses, activityMetricClasses, emptyPanelClasses } from "@/components/common/example-patterns"
import { useState, type ComponentProps } from "react"
import { AlertTriangle, CalendarIcon, Check, ChevronDown, ChevronRight, Circle, CornerDownLeft, Eye, EyeOff, LayoutDashboard, MoreVertical, PanelLeft, Play, Plus, RefreshCcw, Trash2, X } from "lucide-react"
import { CalendarDay } from "react-day-picker"
import { DashboardAccountIdentity, DashboardBrandIdentity, dashboardAccountTriggerClasses, dashboardBrandTriggerClasses, navItemClasses } from "@/components/dashboard/sidebar"
import { ActionButton } from "@/components/ui/action-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDayButton, calendarModifierClasses } from "@/components/ui/calendar"
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { Checkbox } from "@/components/ui/checkbox"
import { CopyField } from "@/components/ui/copy-field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SearchBar } from "@/components/ui/search-bar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, selectItemClasses } from "@/components/ui/select"
import { PaginationLink } from "@/components/ui/pagination"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Slider } from "@/components/ui/slider"
import { StatusToggle } from "@/components/ui/status-toggle"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { StatsStripItem, StatsStripLayout } from "@/components/ui/stats-strip"
import { cn } from "@/lib/utils"
import { interactionInventory, type InteractionState } from "../_data/interaction-inventory"
import { type InteractionExample } from "../_data/interaction-examples"
import { interactionPatterns } from "../_data/interaction-patterns"
import styles from "../design-system.module.css"
import { FrozenPreviewStyles, frozenStateAttributes } from "./frozen-preview"

function InteractionPreview({ rule: example, state, comparison = false, interactive = false }: { rule: InteractionExample; state: InteractionState; comparison?: boolean; interactive?: boolean }) {
  const [text, setText] = useState(example.sample)
  const [sliderValue, setSliderValue] = useState([50])
  const [passwordVisible, setPasswordVisible] = useState(false)
  const source = interactionInventory.find(rule => rule.id === example.id) ?? example
  const rule: InteractionExample = comparison ? { ...source, suffix: example.suffix, usage: example.usage } : example
  if (comparison) state = source.states.find(original => original.name === state.name) ?? state
  const className = comparison ? undefined : rule.id === "button-destructive" ? "mt-1 w-auto" : rule.baseClassName
  const tabIndex = interactive ? 0 : -1
  const common = { className, tabIndex, disabled: rule.alwaysDisabled || state.disabled, "aria-invalid": state.invalid }
  const ExampleIcon = rule.icon === "refresh" ? RefreshCcw : rule.icon === "play" ? Play : rule.icon === "alert" ? AlertTriangle : rule.icon === "plus" ? Plus : rule.icon === "trash" ? Trash2 : undefined
  const buttonContent = rule.id === "search-clear" ? <X />
    : rule.id === "settings-ghost" ? <MoreVertical />
    : rule.id === "header-button" ? <PanelLeft />
    : ExampleIcon ? <><ExampleIcon data-icon="inline-start" />{rule.sample}</>
    : rule.sample
  if (rule.id === "pagination") return <PaginationLink isActive={state.checked} size="icon" className={className} tabIndex={tabIndex}>{rule.sample}</PaginationLink>
  if (rule.id === "sidebar-product") return <SidebarMenu className="w-full"><SidebarMenuItem><SidebarMenuButton isActive={state.checked} className={cn(navItemClasses, "h-auto")} tabIndex={tabIndex}><LayoutDashboard /><span>{rule.sample}</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
  if (rule.id === "sidebar-brand" || rule.id === "sidebar-account") return <Button variant="ghost" className={cn(rule.id === "sidebar-brand" ? dashboardBrandTriggerClasses : dashboardAccountTriggerClasses)} data-state={state.name === "Open" ? "open" : "closed"} tabIndex={tabIndex}>{rule.id === "sidebar-brand" ? <DashboardBrandIdentity /> : <DashboardAccountIdentity />}</Button>
  if (["table", "member-row", "project-row", "activity-row"].includes(rule.id)) return <Table><TableBody><TableRow className={rule.id === "member-row" ? memberRowClasses() : undefined} data-state={state.checked ? "selected" : undefined}><TableCell className="px-2 py-2">{rule.sample}</TableCell></TableRow></TableBody></Table>
  if (rule.id === "project-card") return <div data-state={state.checked ? "selected" : undefined} className={projectCardClasses()}><span className="type-body-md-medium text-interface-contrast">{rule.sample}</span></div>
  if (rule.id === "activity-metric") return <button type="button" data-state={state.checked ? "selected" : undefined} className={activityMetricClasses()} tabIndex={tabIndex}><span className={cn("type-label-xs relative z-10 transition-colors", state.checked ? "text-interface-secondary" : "text-interface-muted group-hover/stat:text-interface-secondary")}>{rule.sample}</span><span className="type-metric-lg text-interface-contrast">—</span></button>
  if (rule.id === "workspace-empty") return <div className={cn(emptyPanelClasses, "p-3 text-left")} tabIndex={tabIndex}>{rule.sample}</div>
  if (rule.id === "combobox-default" || rule.id === "combobox-ghost") return <Combobox items={[rule.sample, "Mobile app"]} defaultValue={rule.sample} value={interactive ? undefined : rule.sample} inputValue={interactive ? undefined : rule.sample}><ComboboxInput label={rule.prefix} variant={rule.id === "combobox-ghost" ? "ghost" : "default"} className={className} readOnly={!interactive} tabIndex={tabIndex} />{interactive && <ComboboxContent><ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent>}</Combobox>
  if (rule.id === "stats-panel" || rule.id === "stats-item") return <StatsStripLayout><StatsStripItem label="Total Value"><span className="type-metric-lg">—</span></StatsStripItem></StatsStripLayout>
  if (rule.id === "date-clock") return <input type="time" defaultValue="09:30" readOnly={!interactive} {...common} />
  if (rule.id === "select-item") return <span className={selectItemClasses} role={interactive ? "button" : undefined} tabIndex={tabIndex}>{rule.sample}{state.checked && <Check className="absolute right-2 size-4" />}</span>
  if (rule.id === "date-apply") return <button type="button" {...common}>{rule.sample}<CornerDownLeft className="size-3.5 opacity-50" /></button>
  if (rule.id === "date-range") return <button type="button" {...common}><CalendarIcon className="mr-2 size-4" />{rule.sample}</button>
  if (rule.id === "date-presets" || rule.id === "calendar-dropdown") return <button type="button" {...common}>{rule.sample}<ChevronDown className="size-4" /></button>
  if (rule.id === "calendar-day" || rule.id === "calendar-selection") return <span className={cn("group/day inline-flex size-8 [--cell-size:2rem]", state.name === "Today" && calendarModifierClasses.today, state.name === "Outside" && calendarModifierClasses.outside, state.name === "Range start" && calendarModifierClasses.range_start, state.name === "Range middle" && calendarModifierClasses.range_middle, state.name === "Range end" && calendarModifierClasses.range_end)} data-selected={state.checked || state.name.startsWith("Range")}><CalendarDayButton day={new CalendarDay(new Date(2026, 9, 14), new Date(2026, 9, 1))} modifiers={{ selected: state.checked || state.name.startsWith("Range"), range_start: state.name === "Range start", range_middle: state.name === "Range middle", range_end: state.name === "Range end" }} className="size-8 w-8 min-w-8" tabIndex={tabIndex}>{rule.sample}</CalendarDayButton></span>
  switch (rule.kind) {
    case "action":
      return <ActionButton type="button" theme={rule.theme} icon={ExampleIcon} isLoading={state.loading} {...common}>{rule.sample}</ActionButton>
    case "button":
      return <Button type="button" variant={rule.variant as ComponentProps<typeof Button>["variant"]} size={rule.size === "icon" ? "icon" : "default"} data-active={state.checked} {...common}>{buttonContent}</Button>
    case "badge":
      return <Badge variant={rule.variant as ComponentProps<typeof Badge>["variant"]} asChild className={className} aria-invalid={state.invalid}><a tabIndex={tabIndex}>{rule.sample}</a></Badge>
    case "toggle":
      return <Toggle variant={rule.variant as ComponentProps<typeof Toggle>["variant"]} pressed={state.checked ?? false} {...common}>{rule.icon === "eye" && (state.checked ? <EyeOff /> : <Eye />)}{rule.sample}</Toggle>
    case "tab":
      return <Tabs value={interactive ? undefined : state.checked ? "preview" : ""} className="w-full"><TabsList variant={rule.variant as ComponentProps<typeof TabsList>["variant"]} size={rule.size === "xs" ? "xs" : "default"}><TabsTrigger value="preview" {...common}>{rule.sample}</TabsTrigger></TabsList></Tabs>
    case "select":
      return (
        <Select defaultValue="preview" value={interactive ? undefined : "preview"}><SelectTrigger variant={rule.variant as "default" | "ghost" | "glass"} size={rule.size === "micro" ? "micro" : rule.size === "xs" ? "xs" : "default"} label={rule.prefix} data-state={interactive ? undefined : state.name === "Open" ? "open" : "closed"} {...common}><SelectValue>{interactive ? undefined : rule.sample}</SelectValue></SelectTrigger>{interactive && <SelectContent><SelectItem value="preview">{rule.sample}</SelectItem><SelectItem value="alternate">{rule.size === "micro" ? "KO" : "Design"}</SelectItem></SelectContent>}</Select>
      )
    case "input":
      return <Input value={interactive ? text : rule.sample} onChange={event => setText(event.target.value)} readOnly={!interactive} {...common} />
    case "textarea":
      return <Textarea value={interactive ? text : rule.sample} onChange={event => setText(event.target.value)} readOnly={!interactive} {...common} />
    case "input-group":
      return <InputGroup variant={rule.variant === "unit" ? "unit" : "default"} className={className} data-disabled={state.disabled}><InputGroupInput value={interactive ? text : rule.sample} onChange={event => setText(event.target.value)} type={!comparison && rule.id === "input-group" && !passwordVisible ? "password" : "text"} readOnly={!interactive} disabled={state.disabled} aria-invalid={state.invalid} tabIndex={tabIndex} /><InputGroupAddon align="inline-end" variant={rule.variant === "unit" ? "unit" : "default"}>{rule.variant === "unit" ? rule.suffix : interactive ? <InputGroupButton type="button" size="icon-xs" aria-label={passwordVisible ? "Hide password" : "Show password"} onClick={() => setPasswordVisible(visible => !visible)}>{passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</InputGroupButton> : <Eye />}</InputGroupAddon></InputGroup>
    case "search":
      return <SearchBar value={interactive ? text : rule.sample} placeholder={rule.placeholder} onValueChange={setText} containerClassName={className} disabled={state.disabled} aria-invalid={state.invalid} tabIndex={tabIndex} />
    case "checkbox":
      return <Checkbox checked={state.checked ?? false} {...common} />
    case "switch":
      return <label className="type-body-md-medium inline-flex items-center gap-2"><Switch checked={state.checked ?? false} {...common} />{rule.sample}</label>
    case "radio":
      return <RadioGroup value={state.checked ? "preview" : ""}><label className="type-body-md-medium inline-flex items-center gap-2"><RadioGroupItem value="preview" {...common} />{rule.sample}</label></RadioGroup>
    case "slider":
      return <Slider value={interactive ? sliderValue : [50]} onValueChange={setSliderValue} aria-label="Preview" {...common} />
    case "status":
      return <StatusToggle type="button" isOn={interactive ? !state.checked : rule.variant !== "zinc"} on={{ label: rule.sample, color: rule.variant === "amber" ? "amber" : "emerald" }} {...common} />
    case "copy":
      return <CopyField value={rule.sample} copied={state.checked} {...common} />
    case "generic":
      return <span className={className} role={interactive ? "button" : undefined} tabIndex={tabIndex}>{rule.variant === "checkbox" || rule.variant === "radio" ? <span className="mr-2 inline-flex size-4 items-center justify-center">{state.checked && (rule.variant === "radio" ? <Circle className="size-2 fill-current" /> : <Check className="size-4" />)}</span> : null}{rule.sample}{rule.variant === "check-end" && state.checked && <Check className="ml-auto size-4" />}{rule.variant === "sub-trigger" && <ChevronRight className="ml-auto size-4" />}{(rule.id === "accordion" || rule.id === "date-presets") && <ChevronDown className={cn("size-4", state.name === "Open" && "rotate-180")} />}</span>
  }
}

export function InteractiveExample({ rule }: { rule: InteractionExample }) {
  const [selected, setSelected] = useState(false)
  const selectable = rule.states.some(state => state.checked) || ["status", "checkbox", "switch", "radio"].includes(rule.kind) || rule.id.startsWith("calendar-")
  const state = selected ? rule.states.find(state => ["Selected", "Copied", "Open"].includes(state.name)) ?? rule.states[0] : rule.states[0]
  return (
    <div className={cn(styles.interactionSample, styles.interactionLive, selectable && "cursor-pointer")} data-example-source={rule.usage.file} title={rule.usage.label}
      onClick={() => { if (selectable) setSelected(value => !value) }}
      onKeyDown={event => { if (event.target instanceof HTMLElement && event.target.getAttribute("role") === "button" && ["Enter", " "].includes(event.key)) { event.preventDefault(); setSelected(value => !value) } }}>
      <InteractionPreview rule={rule} state={{ ...state, checked: selected }} interactive />
    </div>
  )
}

export function InteractionStates() {
  return (
    <div className={styles.interactionCatalog}>
      <FrozenPreviewStyles />
      <section className={styles.subExhibit}>
          <div className={cn(styles.depthGrid, styles.interactionGrid)}>
            {interactionPatterns.map(pattern => (
              <article key={pattern.id} aria-label={pattern.name} data-pattern-id={pattern.id}>
                <div className={styles.interactionStage} data-sidebar={pattern.preview.id.startsWith("sidebar-") || undefined}>
                  {pattern.cases.map(({ rule, state, label }, index) => (
                    <div key={index} className={styles.interactionCase} role="img" aria-label={`${pattern.name}, ${label}`}>
                      <span className={styles.interactionLabel} aria-hidden="true">{label}</span>
                      <div className={styles.interactionSample} data-preview-rule={rule.id} {...frozenStateAttributes(state)} inert aria-hidden="true"><InteractionPreview rule={rule} state={state} comparison /></div>
                    </div>
                  ))}
                  <div className={cn(styles.interactionCase, styles.interactionExample)} role="group" aria-label={`${pattern.name}, Example`}>
                    <span className={styles.interactionLabel} aria-hidden="true">Example</span>
                    <InteractiveExample rule={pattern.preview} />
                  </div>
                </div>
                <footer>
                  <strong className="type-heading-xs">{pattern.name}</strong><code className={styles.referenceValue}>{pattern.value}</code>
                </footer>
              </article>
            ))}
          </div>
      </section>
    </div>
  )
}
