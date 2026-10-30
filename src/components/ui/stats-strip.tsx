import { Card, summaryHoverClasses } from "@/components/ui/card";
import * as React from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

export function StatsStripLayout({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="panel"
      className={cn(
        "overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-boundary-default w-full shadow-panel dark:shadow-xl hover:border-boundary-strong transition-all duration-(--motion-responsive)",
        className,
      )}
    >
      {children}
    </Card>
  );
}

export interface StatsStripItemProps {
  label: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  alwaysColoredIcon?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function StatsStripItem({
  label,
  icon: Icon,
  iconColor = "var(--interface-secondary)",
  alwaysColoredIcon = false,
  className,
  children,
}: StatsStripItemProps) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col transition-colors group",
        summaryHoverClasses,
        className,
      )}
    >
      {/* 상단 헤더 바 */}
      <div className="flex items-center gap-2 px-4 h-11 relative z-10">
        {Icon && (
          <Icon
            className={cn(
              "size-3 transition-all duration-(--motion-responsive) group-hover:scale-110",
              alwaysColoredIcon
                ? "text-(--hover-color) dark:[filter:brightness(1.2)_drop-shadow(0px_0px_6px_currentColor)]"
                : "text-interface-muted group-hover:text-[var(--hover-color)] dark:group-hover:[filter:brightness(1.2)_drop-shadow(0px_0px_6px_var(--hover-color))]"
            )}
            style={{ "--hover-color": iconColor } as React.CSSProperties}
          />
        )}
        <h3 className="text-[11px] font-bold uppercase text-interface-secondary group-hover:text-interface-primary transition-colors">
          {label}
        </h3>
      </div>

      {/* 본문 및 하단 영역 */}
      <div className="px-4 pb-3 flex flex-col justify-between flex-1 relative z-10">
        {children}
      </div>
    </div>
  );
}
