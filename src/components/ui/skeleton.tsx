import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

function Skeleton({ className, animated = true, shape = "default", ...props }: React.ComponentProps<'span'> & { animated?: boolean; shape?: "default" | "pill" | "square" }) {
  return (
    <span
      data-slot="skeleton"
      aria-hidden="true"
      data-animated={animated}
      className={cn('skeleton block rounded-[5px]', shape === 'pill' && 'rounded-full', shape === 'square' && 'rounded-none', className)}
      {...props}
    />
  )
}

function TableSkeleton({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) {
  return <div role="status" aria-label="Loading table" aria-busy="true" className="relative divide-y divide-boundary-subtle">
    <span className="sr-only">Loading table…</span>
    {Array.from({ length: rows }, (_, row) => <div key={row} className="grid h-12 grid-cols-(--skeleton-columns) items-center gap-6 px-4" style={{ "--skeleton-columns": `repeat(${columns}, minmax(0, 1fr))` } as CSSProperties}>
      {Array.from({ length: columns }, (_, column) => <Skeleton key={column} className={cn('h-3.5 w-full max-w-24', column > 0 && 'justify-self-end')} />)}
    </div>)}
  </div>
}

export { Skeleton, TableSkeleton }
