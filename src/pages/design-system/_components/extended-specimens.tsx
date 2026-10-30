import { useId, useState } from "react"
import { MoreHorizontal, Info } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { WidgetErrorFallback } from "@/components/common/WidgetErrorFallback"
import { PageError } from "@/components/common/PageError"
import { WorkspaceMenu, DashboardThemeToggle } from "@/components/dashboard/sidebar"
import { SidebarMenu } from "@/components/ui/sidebar"

export function FieldSpecimen() {
  const id = useId()
  const [name, setName] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [saved, setSaved] = useState(false)
  const invalid = submitted && !name.trim()
  return (
    <form className="max-w-md" noValidate onSubmit={(event) => {
      event.preventDefault()
      setSubmitted(true)
      setSaved(Boolean(name.trim()))
    }}>
      <FieldGroup>
        <Field data-invalid={invalid}>
          <FieldLabel htmlFor={id}>Project name <span aria-hidden="true">*</span></FieldLabel>
          <Input id={id} required value={name} aria-invalid={invalid} aria-describedby={`${id}-help${invalid ? ` ${id}-error` : ""}`} onChange={(event) => { setName(event.target.value); setSaved(false) }} />
          <FieldDescription id={`${id}-help`}>Shown in the project list.</FieldDescription>
          {invalid && <FieldError id={`${id}-error`}>Enter a project name.</FieldError>}
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-workspace`}>Workspace (read-only)</FieldLabel>
          <Input id={`${id}-workspace`} value="Engineering" readOnly />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">Save</Button>
          <Button type="button" disabled>Disabled</Button>
          <span role="status" className="text-sm text-interface-subtle">{saved ? "Changes saved." : ""}</span>
        </div>
      </FieldGroup>
    </form>
  )
}

export function SwitchSpecimen() {
  const id = useId()
  const [enabled, setEnabled] = useState(false)
  return <Field orientation="horizontal" className="max-w-sm">
    <FieldLabel htmlFor={id}>Notifications {enabled ? "on" : "off"}</FieldLabel>
    <Switch id={id} checked={enabled} onCheckedChange={setEnabled} />
  </Field>
}

export function RadioSpecimen() {
  const id = useId()
  const [frequency, setFrequency] = useState("daily")
  return <FieldSet className="max-w-sm">
    <FieldLegend id={id}>Report frequency</FieldLegend>
    <RadioGroup aria-labelledby={id} value={frequency} onValueChange={setFrequency}>
      {[['daily', 'Daily'], ['weekly', 'Weekly']].map(([value, label]) => <Field key={value} orientation="horizontal">
        <RadioGroupItem value={value} id={`${id}-${value}`} />
        <FieldLabel htmlFor={`${id}-${value}`}>{label}</FieldLabel>
      </Field>)}
    </RadioGroup>
  </FieldSet>
}

export function TextareaSpecimen() {
  const id = useId()
  const [value, setValue] = useState("")
  return <Field className="max-w-md">
    <FieldLabel htmlFor={id}>Project description</FieldLabel>
    <Textarea id={id} value={value} maxLength={200} onChange={(event) => setValue(event.target.value)} aria-describedby={`${id}-help`} placeholder="Describe what you want to create." />
    <FieldDescription id={`${id}-help`}>{value.length}/200 characters · Optional</FieldDescription>
  </Field>
}

export function SliderSpecimen() {
  const id = useId()
  const [value, setValue] = useState([25])
  return <Field className="max-w-sm">
    <FieldLabel id={id}>Allocation <span className="tabular-nums">{value[0]}%</span></FieldLabel>
    <Slider aria-labelledby={id} value={value} onValueChange={setValue} min={0} max={100} step={1} />
    <Input type="number" aria-label="Allocation percentage" min={0} max={100} value={value[0]} onChange={(event) => {
      const next = event.target.valueAsNumber
      if (Number.isFinite(next)) setValue([Math.min(100, Math.max(0, Math.round(next)))])
    }} />
  </Field>
}

export function ModalSpecimen() {
  return <Dialog>
    <DialogTrigger asChild><Button variant="secondary">View details</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader><DialogTitle>Project details</DialogTitle><DialogDescription>Design system · Team workspace · Draft</DialogDescription></DialogHeader>
      <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
    </DialogContent>
  </Dialog>
}

export function SheetSpecimen() {
  return <Sheet>
    <SheetTrigger asChild><Button variant="secondary">Project settings</Button></SheetTrigger>
    <SheetContent>
      <SheetHeader><SheetTitle>Project settings</SheetTitle><SheetDescription>Update your project preferences and notifications.</SheetDescription></SheetHeader>
      <div className="grid gap-6 p-4"><SwitchSpecimen /><SheetClose asChild><Button variant="secondary">Close</Button></SheetClose></div>
    </SheetContent>
  </Sheet>
}

export function MenuSpecimen() {
  const [selection, setSelection] = useState("")
  return <div className="flex items-center gap-3">
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="secondary" size="icon" aria-label="More actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={() => setSelection("View details selected")}>View details</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setSelection("Duplicate selected")}>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Restricted action</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <span role="status" className="text-sm text-interface-subtle">{selection}</span>
  </div>
}

export function TooltipSpecimen() {
  return <Tooltip>
    <TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Progress calculation"><Info /></Button></TooltipTrigger>
    <TooltipContent>Your progress is based on completed tasks.</TooltipContent>
  </Tooltip>
}

export function CollapseSpecimen() {
  const [open, setOpen] = useState(true)
  return <SidebarMenu className="w-56 max-w-full">
    <WorkspaceMenu open={open} onOpenChange={setOpen} pathname="/design-system" />
  </SidebarMenu>
}

export function EmptySpecimen() {
  const [filtered, setFiltered] = useState(true)
  return <Empty>
    <EmptyHeader><EmptyTitle>{filtered ? "No results found" : "No projects yet"}</EmptyTitle>
      <EmptyDescription>{filtered ? "Try a different search or reset your filters." : "Create a project to bring your ideas together."}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent><Button variant="secondary" onClick={() => setFiltered(!filtered)}>{filtered ? "Reset filters" : "Show no results"}</Button></EmptyContent>
  </Empty>
}

export function ErrorSpecimen() {
  const [failed, setFailed] = useState(true)
  return failed ? <WidgetErrorFallback error={new Error("Check your connection and try again.")} resetErrorBoundary={() => setFailed(false)} />
    : <div className="grid justify-items-start gap-3"><p role="status" className="text-sm">Data loaded.</p><Button variant="secondary" onClick={() => setFailed(true)}>Show error</Button></div>
}

export function PageErrorSpecimen() {
  const [failed, setFailed] = useState(true)
  return failed ? <PageError onRetry={() => setFailed(false)} variant="panel" className="min-h-80" />
    : <div className="grid justify-items-start gap-3"><p role="status" className="text-sm">Page loaded.</p><Button variant="secondary" onClick={() => setFailed(true)}>Show Page Error</Button></div>
}

export function ToastSpecimen() {
  return <div className="flex flex-wrap gap-3">
    <Button variant="secondary" onClick={() => toast("You’re up to date.")}>Show notification</Button>
    <Button variant="secondary" onClick={() => toast.success("Changes saved.")}>Show success</Button>
    <Button variant="secondary" onClick={() => toast.error("Unable to process this request.")}>Show error</Button>
  </div>
}

export function ThemeSpecimen() {
  const [theme, setTheme] = useState("dark")
  return <DashboardThemeToggle theme={theme} setTheme={setTheme} />
}

export function PopoverSpecimen() {
  return <Popover>
    <PopoverTrigger asChild><Button variant="secondary">Display options</Button></PopoverTrigger>
    <PopoverContent className="w-72"><SwitchSpecimen /></PopoverContent>
  </Popover>
}
