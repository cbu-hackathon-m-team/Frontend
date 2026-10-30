import * as React from "react";
import {
  CalendarIcon,
  ChevronDown,
  CornerDownLeft,
  Clock,
} from "lucide-react";
import {
  format,
  startOfDay,
  subDays,
  subMonths,
  endOfDay,
  subHours,
} from "date-fns";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export const PRESETS = [
  {
    label: "Last 24 Hours",
    getRange: () => ({ from: subHours(new Date(), 24), to: new Date() }),
  },
  {
    label: "Last 7 Days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 7)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Last Month",
    getRange: () => ({
      from: startOfDay(subMonths(new Date(), 1)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Last 3 Months",
    getRange: () => ({
      from: startOfDay(subMonths(new Date(), 3)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Last 1 Year",
    getRange: () => ({
      from: startOfDay(subMonths(new Date(), 12)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "All Time",
    getRange: () => ({
      from: new Date("2021-01-01T00:00:00Z"),
      to: endOfDay(new Date()),
    }),
  },
];

export interface GeistDateRangePreset {
  label: string;
  getRange: () => DateRange;
}

export function GeistDateRangePicker({
  dateRange,
  setDateRange,
  className,
  presets = PRESETS,
  minDate,
  maxDate,
  ariaLabel = "Date range",
  presetAriaLabel = "Date range presets",
}: {
  dateRange: DateRange | undefined;
  setDateRange: (val: DateRange | undefined) => void;
  className?: string;
  presets?: readonly GeistDateRangePreset[];
  minDate?: Date;
  maxDate?: Date;
  ariaLabel?: string;
  presetAriaLabel?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPresetOpen, setIsPresetOpen] = React.useState(false);
  const [activePreset, setActivePreset] = React.useState<string | null>(null);

  const [localRange, setLocalRange] = React.useState<DateRange | undefined>(
    dateRange,
  );

  const [startTime, setStartTime] = React.useState(() => {
    if (dateRange?.from) return format(dateRange.from, "HH:mm");
    return "00:00";
  });

  const [endTime, setEndTime] = React.useState(() => {
    if (dateRange?.to) return format(dateRange.to, "HH:mm");
    return "23:59";
  });

  const startInputRef = React.useRef<HTMLInputElement>(null);
  const endInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setLocalRange(dateRange);
      if (dateRange?.from) setStartTime(format(dateRange.from, "HH:mm"));
      if (dateRange?.to) setEndTime(format(dateRange.to, "HH:mm"));
    }
  }, [isOpen, dateRange]);

  const handleApply = () => {
    if (!localRange?.from) {
      setDateRange(undefined);
      setActivePreset(null);
      setIsOpen(false);
      return;
    }

    const newFrom = new Date(localRange.from);
    const [h, m] = startTime.split(":");
    newFrom.setHours(parseInt(h || "0", 10), parseInt(m || "0", 10), 0, 0);

    let newTo = undefined;
    if (localRange.to) {
      newTo = new Date(localRange.to);
      const [th, tm] = endTime.split(":");
      newTo.setHours(parseInt(th || "23", 10), parseInt(tm || "59", 10), 59, 999);
    }

    setDateRange({ from: newFrom, to: newTo });
    setActivePreset(null);
    setIsOpen(false);
  };

  const handlePreset = (preset: GeistDateRangePreset) => {
    const nextRange = preset.getRange();
    const nextFrom = nextRange.from && minDate && nextRange.from < minDate ? minDate : nextRange.from;
    const nextTo = nextRange.to && maxDate && nextRange.to > maxDate ? maxDate : nextRange.to;
    setDateRange({ from: nextFrom, to: nextTo });
    setActivePreset(preset.label);
    setIsPresetOpen(false);
  };

  const getFormattedDateRange = (from: Date, to: Date) => {
    const currentYear = new Date().getFullYear();
    const fromYear = from.getFullYear();
    const toYear = to.getFullYear();

    if (fromYear !== toYear) {
      // 서로 다른 연도인 경우 둘 다 연도 표시
      return `${format(from, "MMM d ''yy")} - ${format(to, "MMM d ''yy")}`;
    } else if (fromYear !== currentYear) {
      // 같은 연도지만 현재 연도가 아닌 경우 뒤에만 연도 표시
      return `${format(from, "MMM d")} - ${format(to, "MMM d ''yy")}`;
    } else {
      // 완벽히 같은 현재 연도인 경우 연도 생략
      return `${format(from, "MMM d")} - ${format(to, "MMM d")}`;
    }
  };

  const displayText = activePreset
    ? activePreset
    : dateRange?.from
      ? dateRange.to
        ? getFormattedDateRange(dateRange.from, dateRange.to)
        : format(
            dateRange.from,
            "MMM d" +
              (dateRange.from.getFullYear() !== new Date().getFullYear()
                ? " ''yy"
                : ""),
          )
      : "Select Period";

  return (
    <div
      data-state={isOpen || isPresetOpen ? "open" : "closed"}
      className={cn(
        "flex h-9 rounded-md bg-surface-panel transition-all duration-(--motion-responsive) w-fit min-w-50 items-stretch group shrink-0",
        className,
      )}
    >
      <Popover
        modal={false}
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) setIsPresetOpen(false);
        }}
      >
        <PopoverTrigger asChild>
          <button type="button" aria-label={ariaLabel} className="flex flex-1 items-center gap-2 px-2 hover:bg-interaction-subtle transition-all duration-(--motion-responsive) text-left cursor-pointer outline-none focus-visible:border-boundary-focus focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-l-[5px] border border-boundary-default border-r-transparent data-[state=open]:border-boundary-focus data-[state=open]:border-r-contrast/40 data-[state=open]:ring-ring/50 data-[state=open]:ring-[3px] relative z-0 data-[state=open]:z-10">
            <CalendarIcon className="size-4 shrink-0" />
            <span className="type-body-md text-interface-primary line-clamp-1 flex-1">
              {displayText}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-surface-panel text-interface-contrast border-boundary-default shadow-overlay dark:shadow-md rounded-md overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 z-50 border relative"
          align="start"
        >
          <div className="bg-transparent">
            {/* The calendar component styling uses standard shadcn and lets it inherit. */}
            <Calendar
              mode="range"
              selected={localRange}
              onSelect={setLocalRange}
              className="bg-transparent text-tone-100 p-2 sm:p-2"
              numberOfMonths={1}
              captionLayout="dropdown"
              fromYear={minDate?.getFullYear() ?? 2020}
              toYear={maxDate?.getFullYear() ?? 2030}
              disabled={[
                ...(minDate ? [{ before: minDate }] : []),
                ...(maxDate ? [{ after: maxDate }] : []),
              ]}
            />
          </div>

          <div className="border-t border-boundary-default p-3 px-2 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-1.5 flex-1 w-0">
                <div className="flex items-center gap-1.5 px-0.5">
                  <Clock className="size-3.5 text-interface-muted" />
                  <Label className="text-xs text-interface-muted">Start</Label>
                </div>
                <div
                  onClick={() => startInputRef.current?.showPicker()}
                  className="relative h-9 w-full bg-surface-panel border border-boundary-default rounded-md focus-within:border-boundary-focus focus-within:ring-ring/50 focus-within:ring-[3px] transition-all duration-(--motion-responsive) overflow-hidden flex items-center group/clock cursor-pointer"
                >
                  <input
                    ref={startInputRef}
                    type="time"
                    aria-label="Start time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-full w-full bg-transparent border-0 text-sm text-tone-100 px-2.5 focus:outline-none select-none [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-1.5 flex-1 w-0">
                <div className="flex items-center gap-1.5 px-0.5">
                  <Clock className="size-3.5 text-interface-muted" />
                  <Label className="text-xs text-interface-muted">End</Label>
                </div>
                <div
                  onClick={() => endInputRef.current?.showPicker()}
                  className="relative h-9 w-full bg-surface-panel border border-boundary-default rounded-md focus-within:border-boundary-focus focus-within:ring-ring/50 focus-within:ring-[3px] transition-all duration-(--motion-responsive) overflow-hidden flex items-center group/clock cursor-pointer"
                >
                  <input
                    ref={endInputRef}
                    type="time"
                    aria-label="End time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-full w-full bg-transparent border-0 text-sm text-tone-100 px-2.5 focus:outline-none select-none [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                className="h-9 flex w-full items-center justify-center bg-interaction-subtle hover:bg-interaction-raised border border-boundary-default rounded-md type-label-lg leading-5 text-interface-contrast transition-all duration-(--motion-responsive) shadow-sm outline-none focus-visible:border-boundary-focus focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer gap-1.5"
                onClick={handleApply}
              >
                Apply <CornerDownLeft className="size-3.5 opacity-50" />
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px bg-interaction-raised shrink-0 relative z-0 -ml-px" />

      <DropdownMenu
        modal={false}
        open={isPresetOpen}
        onOpenChange={(open) => {
          setIsPresetOpen(open);
          if (open) setIsOpen(false);
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={presetAriaLabel}
            className="group/trigger px-2.5 flex items-center justify-center hover:bg-interaction-subtle transition-all duration-(--motion-responsive) cursor-pointer outline-none focus-visible:border-boundary-focus focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-r-[5px] border border-boundary-default border-l-transparent data-[state=open]:border-boundary-focus data-[state=open]:border-l-contrast/40 data-[state=open]:ring-ring/50 data-[state=open]:ring-[3px] relative z-0 data-[state=open]:z-10 -ml-px"
          >
            <ChevronDown className="pointer-events-none shrink-0 size-4 transition-all duration-(--motion-responsive) opacity-50 group-hover/trigger:opacity-100 group-hover/trigger:text-interface-contrast/80 group-data-[state=open]/trigger:opacity-100 group-data-[state=open]/trigger:text-interface-contrast/80 group-data-[state=open]/trigger:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-36 bg-surface-panel text-interface-contrast border-boundary-default shadow-overlay dark:shadow-md rounded-md p-1 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 border relative"
        >
          {presets.map((preset) => (
            <DropdownMenuItem
              key={preset.label}
              onClick={() => handlePreset(preset)}
              className="text-interface-primary focus:bg-contrast/8 focus:text-interface-contrast relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 px-2 type-body-md leading-normal outline-hidden select-none transition-colors"
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
