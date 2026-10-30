import * as React from "react"
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton"
import { Spinner, ChartLoading } from "@/components/ui/spinner"
import { ProjectCardLoading } from "@/components/dashboard/page-loading"
import type { DateRange } from "react-day-picker"
import { AlertTriangle, BarChart3, ChevronLeft, ChevronRight, Eye, EyeOff, LayoutDashboard, LineChartIcon, PieChartIcon, Play, RefreshCcw, Square } from "lucide-react"

import {
  DashboardAccountIdentity,
  DashboardBrandIdentity,
  DashboardThemeToggle,
  dashboardAccountTriggerClasses,
  dashboardBrandTriggerClasses,
} from "@/components/dashboard/sidebar"
import { SettingsBreadcrumbs } from "@/components/settings/breadcrumbs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CopyField } from "@/components/ui/copy-field"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  GeistDateRangePicker,
  PRESETS,
} from "@/components/ui/geist-date-range-picker"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { SearchBar } from "@/components/ui/search-bar"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toggle } from "@/components/ui/toggle"
import { ActionButton } from "@/components/ui/action-button"
import { StatusToggle } from "@/components/ui/status-toggle"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

const chartTypes = [
  { id: "cumulative", label: "Activity over time", icon: LineChartIcon },
  { id: "daily", label: "Daily activity", icon: BarChart3 },
  { id: "distribution", label: "Distribution", icon: PieChartIcon },
] as const

export function CardSpecimen() {
  return <Card variant="panel" className="w-full max-w-md overflow-hidden">
    <CardHeader className="px-4 py-4 md:px-4">
      <CardTitle>Settings</CardTitle>
      <CardDescription>Manage your account preferences.</CardDescription>
    </CardHeader>
    <CardContent className="px-4 pb-4 md:px-4 md:pb-4">
      <p className="type-body-md-medium text-interface-secondary">Choose how your account appears in the dashboard.</p>
    </CardContent>
  </Card>
}

export function ButtonSpecimen() {
  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-5">
      {(["default", "secondary", "outline", "ghost", "destructive", "link"] as const).map(variant => (
        <div key={variant} className="flex flex-col items-center gap-3">
          <Button variant={variant}>{variant === "destructive" ? "Delete" : variant === "link" ? "Learn more" : "Save changes"}</Button>
          <span className="type-body-xs capitalize text-interface-subtle">{variant}</span>
        </div>
      ))}
    </div>
  )
}

export function ActionButtonSpecimen() {
  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-5">
      <div className="flex flex-col items-center gap-3"><ActionButton theme="zinc" icon={RefreshCcw}>Sync Data</ActionButton><span className="type-body-xs text-interface-subtle">Secondary</span></div>
      <div className="flex flex-col items-center gap-3"><ActionButton theme="white" icon={Play}>Run task</ActionButton><span className="type-body-xs text-interface-subtle">White</span></div>
      <div className="flex flex-col items-center gap-3"><ActionButton theme="rose" icon={Square}>Stop All</ActionButton><span className="type-body-xs text-interface-subtle">Rose</span></div>
      <div className="flex flex-col items-center gap-3"><ActionButton theme="orange" icon={AlertTriangle}>Archive (2)</ActionButton><span className="type-body-xs text-interface-subtle">Orange</span></div>
      <div className="flex flex-col items-center gap-3"><ActionButton theme="zinc" icon={RefreshCcw} isLoading>Sync Data</ActionButton><span className="type-body-xs text-interface-subtle">Loading</span></div>
    </div>
  )
}

export function SidebarSpecimen() {
  const [theme, setTheme] = React.useState("dark")
  const [overviewActive, setOverviewActive] = React.useState(false)

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="w-60">
        <Button variant="ghost" className={dashboardBrandTriggerClasses}>
          <DashboardBrandIdentity />
        </Button>
      </div>
      <SidebarMenu className="w-60">
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={overviewActive}
            variant="product"
            className="h-auto"
            onClick={() => setOverviewActive(true)}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" /><span>Overview</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <div className="w-60">
        <Button variant="ghost" className={dashboardAccountTriggerClasses}>
          <DashboardAccountIdentity />
        </Button>
      </div>
      <DashboardThemeToggle theme={theme} setTheme={setTheme} />
      <p className="basis-full type-body-sm text-interface-secondary">Collapsed desktop navigation uses a left-edge hover rail with the same product selection and account menu. Keyboard activation and Escape are supported; mobile navigation uses the Sheet.</p>
    </div>
  )
}

export function BreadcrumbSpecimen() {
  return <SettingsBreadcrumbs segments={["settings", "members"]} className="mb-0" interactive={false} />
}

export function TabsSpecimen() {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className="w-16 type-body-xs text-interface-subtle">Default</span>
        <Tabs defaultValue="All">
          <TabsList>
            {(["All", "Design", "Engineering"] as const).map((workspace) => (
              <TabsTrigger key={workspace} value={workspace}>{workspace}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="w-16 type-body-xs text-interface-subtle">Ghost</span>
        <Tabs defaultValue="1D">
          <TabsList variant="ghost" size="xs">
            {(["1m", "5m", "15m", "1H", "4H", "1D", "1W"] as const).map((interval) => (
              <TabsTrigger key={interval} value={interval}>{interval}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex w-full flex-wrap items-center gap-4">
        <span className="w-16 type-body-xs text-interface-subtle">Line</span>
        <Tabs defaultValue="all" className="w-full max-w-72">
          <TabsList variant="line">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="w-16 type-body-xs text-interface-subtle">Icon</span>
        <Tabs defaultValue="cumulative">
          <TabsList>
            {chartTypes.map((type) => {
              const Icon = type.icon
              return (
                <TabsTrigger key={type.id} value={type.id} className="min-w-7" title={type.label}>
                  <Icon />
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}

export function InputSpecimen() {
  const id = React.useId()
  return (
    <FieldGroup className="max-w-md">
      <Field>
        <FieldLabel htmlFor={`${id}-name`}>Display name</FieldLabel>
        <Input id={`${id}-name`} defaultValue="alex_kim" maxLength={32} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-filter`}>Filter members</FieldLabel>
        <Input id={`${id}-filter`} placeholder="Filter members by name or email..." />
      </Field>
    </FieldGroup>
  )
}

export function InputGroupSpecimen() {
  return (
    <div className="grid max-w-md gap-3">
      <InputGroup variant="unit">
        <InputGroupInput aria-label="Username" defaultValue="alex_kim" maxLength={32} />
        <InputGroupAddon align="inline-start" variant="unit">
          studio.example/
        </InputGroupAddon>
      </InputGroup>
      <InputGroup variant="unit">
        <InputGroupInput aria-label="Storage limit" defaultValue="1000" inputMode="numeric" />
        <InputGroupAddon align="inline-end" variant="unit">GB</InputGroupAddon>
      </InputGroup>
    </div>
  )
}

export function CopyFieldSpecimen() {
  const [copied, setCopied] = React.useState(false)
  const value = "project_Lq9pH00hwuF1N43HZsTA_KlAhw"

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <CopyField
      value="project_Lq9pH...3HZsTA_KlAhw"
      copied={copied}
      aria-label="Copy API key identifier"
      onClick={copy}
    />
  )
}

export function SearchFieldSpecimen() {
  const [query, setQuery] = React.useState("")

  return (
    <SearchBar
      aria-label="Filter events"
      value={query}
      onValueChange={setQuery}
      placeholder="Filter through events..."
      containerClassName="max-w-72"
    />
  )
}

export function SelectSpecimen() {
  const [workspace, setWorkspace] = React.useState("All")
  const [role, setRole] = React.useState("all")
  const [language, setLanguage] = React.useState("EN")

  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-5">
      <div className="grid grid-rows-[40px_auto] items-center justify-items-center gap-3">
        <span className="order-last text-center type-body-xs text-interface-subtle">Labeled</span>
        <Select value={workspace} onValueChange={setWorkspace}>
          <SelectTrigger label="Workspace" aria-label="Workspace"><SelectValue>{workspace}</SelectValue></SelectTrigger>
          <SelectContent>
            {(["All", "Design", "Engineering"] as const).map((workspace) => (
              <SelectItem key={workspace} value={workspace}>{workspace}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-rows-[40px_auto] items-center justify-items-center gap-3">
        <span className="order-last text-center type-body-xs text-interface-subtle">Filter</span>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger aria-label="Team role" className="w-40"><SelectValue>{role === "all" ? "All Team Roles" : role === "admin" ? "Admin" : "Member"}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Team Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-rows-[40px_auto] items-center justify-items-center gap-3">
        <span className="order-last text-center type-body-xs text-interface-subtle">Micro</span>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger aria-label="Display language" variant="glass" size="micro" className="w-fit"><SelectValue>{language}</SelectValue></SelectTrigger>
          <SelectContent align="end" className="min-w-20">
            {(["EN", "KO"] as const).map((language) => (
              <SelectItem key={language} value={language} >
                {language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export function AvatarSpecimen() {
  return (
    <Avatar className="size-10">
      <AvatarFallback >TR</AvatarFallback>
    </Avatar>
  )
}

const categoryOptions = ["All", "Website", "Mobile app", "Brand kit"]

export function ComboboxSpecimen() {
  const [category, setCategory] = React.useState("All")

  return (
    <Combobox
      value={category}
      onValueChange={(next) => next && setCategory(next)}
      items={categoryOptions}
    >
      <ComboboxInput label="Project" aria-label="Project" className="w-56" />
      <ComboboxContent>
        <ComboboxEmpty>No project found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function ToggleSpecimen() {
  const [showOverlay, setShowOverlay] = React.useState(false)

  return (
    <Toggle
      variant="glass"
      pressed={showOverlay}
      onPressedChange={setShowOverlay}
    >
      {showOverlay ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
      Details
    </Toggle>
  )
}

export function StatusToggleSpecimen() {
  const [running, setRunning] = React.useState(true)

  return (
    <StatusToggle
      isOn={running}
      on={{ label: "Published", color: "emerald" }}
      off={{ label: "Draft", color: "amber" }}
      onClick={() => setRunning((current) => !current)}
      aria-pressed={running}
    />
  )
}

export function CheckboxSpecimen() {
  return (
    <div className="flex items-center gap-4">
      <Checkbox aria-label="Select all members" />
      <Checkbox aria-label="Selected member" defaultChecked />
    </div>
  )
}

export function DateRangeSpecimen() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => PRESETS[2].getRange(),
  )

  return <GeistDateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
}

export function BadgeSpecimen() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-14 type-body-xs text-interface-subtle">Status</span>
        <Badge variant="success">CONNECTED</Badge>
        <Badge variant="warning">WARN</Badge>
        <Badge variant="error">ERROR</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-14 type-body-xs text-interface-subtle">Density</span>
        <Badge variant="muted" size="xs">Perp</Badge>
        <Badge variant="outline" size="sm">INFO</Badge>
        <Badge variant="success" size="lg">Completed</Badge>
      </div>
    </div>
  )
}

export function ProgressSpecimen() {
  return (
    <div className="grid max-w-40 gap-2">
      <div className="grid gap-2">
        <div className="flex justify-between type-body-xs"><span className="text-interface-muted">Weight</span><span className="tabular-nums text-interface-primary">21.7%</span></div>
        <Progress value={21.7} aria-label="Completion progress" />
      </div>
    </div>
  )
}

export function PaginationSpecimen() {
  const [page, setPage] = React.useState(2)
  const selectPage = (event: React.MouseEvent<HTMLAnchorElement>, next: number) => {
    event.preventDefault()
    setPage(Math.min(3, Math.max(1, next)))
  }
  return (
    <Pagination className="mx-0 w-auto">
      <PaginationContent>
        <PaginationItem><PaginationLink href="#pagination" onClick={(event) => selectPage(event, page - 1)} size="icon-xs" aria-label="Previous page" aria-disabled={page === 1}><ChevronLeft /></PaginationLink></PaginationItem>
        {[1, 2, 3].map((number) => <PaginationItem key={number}><PaginationLink href="#pagination" onClick={(event) => selectPage(event, number)} size="icon-xs" isActive={page === number} aria-label={`Page ${number}`}>{number}</PaginationLink></PaginationItem>)}
        <PaginationItem><PaginationLink href="#pagination" onClick={(event) => selectPage(event, page + 1)} size="icon-xs" aria-label="Next page" aria-disabled={page === 3}><ChevronRight /></PaginationLink></PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export function SeparatorSpecimen() {
  return (
    <div className="grid max-w-xl gap-6 type-body-xs text-interface-subtle">
      <div className="grid gap-3"><span>Horizontal</span><Separator /></div>
      <div className="flex items-center gap-4">
        <span>Vertical</span>
        <div className="h-8"><Separator orientation="vertical" /></div>
      </div>
    </div>
  )
}

export function TableSpecimen() {
  const members = [
    { name: "Alex Kim", email: "alex@example.com", role: "Designer", status: "Active", projects: 4 },
    { name: "Jamie Lee", email: "jamie@example.com", role: "Developer", status: "Invited", projects: 2 },
  ]
  return <Table>
    <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Projects</TableHead></TableRow></TableHeader>
    <TableBody>{members.map(member => <TableRow key={member.email}>
      <TableCell><div className="flex flex-col gap-1"><span>{member.name}</span><span className="type-body-xs text-interface-muted">{member.email}</span></div></TableCell>
      <TableCell>{member.role}</TableCell><TableCell><Badge variant={member.status === "Active" ? "success" : "muted"}>{member.status}</Badge></TableCell><TableCell className="text-right">{member.projects}</TableCell>
    </TableRow>)}</TableBody>
  </Table>
}

export function SkeletonSpecimen() {
  return <div className="w-full space-y-8">
    <div className="flex flex-wrap items-center gap-6">
      <div className="space-y-3"><span className="text-xs text-interface-muted">Text</span><Skeleton className="h-4 w-40" /></div>
      <div className="space-y-3"><span className="text-xs text-interface-muted">Pill</span><Skeleton shape="pill" className="size-9" /></div>
      <div className="space-y-3"><span className="text-xs text-interface-muted">Square</span><Skeleton shape="square" className="size-9" /></div>
      <div className="space-y-3"><span className="text-xs text-interface-muted">No animation</span><Skeleton animated={false} className="h-4 w-32" /></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <ProjectCardLoading projectName="Design system" />
      <div className="overflow-hidden rounded-lg border border-boundary-default bg-surface-panel">
        <Table>
          <TableHeader><TableRow >
            <TableHead className="px-4">Member</TableHead><TableHead className="px-4 text-right">Role</TableHead><TableHead className="px-4 text-right">Status</TableHead>
          </TableRow></TableHeader>
          <TableBody><TableRow><TableCell colSpan={3} className="p-0"><TableSkeleton columns={3} rows={3} /></TableCell></TableRow></TableBody>
        </Table>
      </div>
    </div>
  </div>
}

export function SpinnerSpecimen() {
  return <div className="w-full space-y-6">
    <div className="flex items-center gap-8 text-interface-secondary"><Spinner /><Spinner className="size-5" /><Spinner className="size-6" /></div>
    <div className="overflow-hidden rounded-lg border border-boundary-default bg-surface-panel"><div className="border-b border-boundary-default px-4 py-3"><h3 className="type-label-lg text-interface-contrast">Performance Overview</h3><p className="type-body-xs text-interface-muted">Project activity across the selected period</p></div><ChartLoading className="h-64" /></div>
  </div>
}
