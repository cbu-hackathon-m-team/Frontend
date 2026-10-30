import * as React from "react";
import { cn } from "@/lib/utils";

type StatusColor = "emerald" | "amber" | "zinc";

interface StatusState {
  label: string;
  color: StatusColor;
}

interface StatusToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 현재 토글 상태 (true = on, false = off) */
  isOn: boolean;
  /** on 상태일 때의 라벨과 색상 */
  on?: StatusState;
  /** off 상태일 때의 라벨과 색상 */
  off?: StatusState;
}

const COLOR_VARIANTS: Record<
  StatusColor,
  { button: string; dot: string; ping: string }
> = {
  emerald: {
    button:
      "bg-status-success-surface border-status-success-border/40 hover:border-status-success-border/80 text-status-success dark:shadow-status-success",
    dot: "bg-status-success-indicator dark:shadow-status-success-indicator",
    ping: "bg-status-success-indicator",
  },
  amber: {
    button:
      "bg-status-warning-surface border-status-warning-border/40 hover:border-status-warning-border/80 text-status-warning dark:shadow-status-warning",
    dot: "bg-status-warning-indicator dark:shadow-status-warning-indicator",
    ping: "bg-status-warning-indicator",
  },
  zinc: {
    button:
      "bg-tone-900/60 border-contrast/15 text-interface-muted hover:border-contrast/30",
    dot: "bg-tone-700",
    ping: "",
  },
};

const DEFAULT_ON: StatusState = { label: "Running", color: "emerald" };
const DEFAULT_OFF: StatusState = { label: "Standby", color: "zinc" };

export function StatusToggle({
  isOn,
  on = DEFAULT_ON,
  off = DEFAULT_OFF,
  className,
  ...props
}: StatusToggleProps) {
  const current = isOn ? on : off;
  const styles = COLOR_VARIANTS[current.color];
  const showPing = current.color !== "zinc";

  return (
    <button
      type="button"
      className={cn(
        "group relative flex items-center justify-center h-8 w-25 rounded-md border transition-all duration-(--motion-responsive) active:scale-95 overflow-hidden shadow-panel dark:shadow-2xl cursor-pointer focus-control outline-none disabled:pointer-events-none disabled:opacity-50",
        styles.button,
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3 relative z-10 transition-all">
        <div className="relative flex items-center justify-center">
          <div
            className={cn(
              "size-2 rounded-full transition-all duration-(--motion-responsive)",
              styles.dot,
            )}
          />
          {showPing && (
            <div
              className={cn(
                "absolute inset-0 size-2 rounded-full animate-ping opacity-40",
                styles.ping,
              )}
            />
          )}
        </div>
        <span className="text-[11px] font-bold uppercase">{current.label}</span>
      </div>

      {/* Sophisticated Glass/Shine Layer */}
      <div className="absolute inset-0 bg-linear-to-b from-contrast/8 to-transparent pointer-events-none opacity-50" />
    </button>
  );
}
