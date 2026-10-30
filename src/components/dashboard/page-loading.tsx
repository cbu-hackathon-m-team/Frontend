import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden rounded-lg border border-boundary-default bg-surface-panel", className)}>{children}</div>;
}
export function ProjectCardLoading({ projectName }: { projectName: string }) {
  return <Panel className="flex flex-col">
    <div className="flex h-11 items-center gap-2 border-b border-boundary-default bg-surface-chrome px-4"><span className="size-2 rounded-full bg-interface-disabled" /><h3 className="type-eyebrow-xs text-interface-primary">{projectName}</h3></div>
    <div aria-busy="true" className="flex h-35 flex-1 flex-col justify-between px-4 py-3">
      <div className="mb-2 flex flex-col"><span className="type-label-xs text-interface-muted">Completed tasks</span><span className="relative inline-block w-28 type-metric-lg"><span className="invisible" aria-hidden="true">—</span><span className="absolute inset-x-0 top-1/2 h-5 -translate-y-1/2"><Skeleton className="h-full w-full" /></span></span></div>
      <div className="mt-1 flex items-center justify-between border-t border-boundary-subtle pt-2">{["Progress", "Tasks", "Members"].map(label => <div key={label} className="flex flex-col gap-0.5"><span className="type-label-xs text-interface-muted">{label}</span><span className="relative inline-block w-8 type-metric-sm"><span className="invisible" aria-hidden="true">—</span><span className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2"><Skeleton className="h-full w-full" /></span></span></div>)}</div>
    </div>
  </Panel>
}

