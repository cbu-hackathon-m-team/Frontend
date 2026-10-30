import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      viewBox="0 0 24 24"
      className={cn('size-4 shrink-0', className)}
      {...props}
    >
      {Array.from({ length: 12 }, (_, index) => (
        <line key={index} x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          transform={`rotate(${index * 30} 12 12)`} className="spinner-segment"
          style={{ "--segment-delay": `${index * 0.1 - 1.2}s`, "--segment-opacity": (index + 1) / 12 } as CSSProperties} />
      ))}
    </svg>
  )
}

function LoadingIndicator({ className, label = 'Loading…' }: { className?: string; label?: string }) {
  return <div role="status" aria-label={label.replace(/…$/, '')} aria-busy="true" className={cn('flex min-h-32 flex-col items-center justify-center gap-3 text-interface-muted', className)}>
    <Spinner aria-hidden="true" role="presentation" aria-label={undefined} className="size-5" />
    <span className="text-xs">{label}</span>
  </div>
}

function ChartLoading({ className }: { className?: string }) {
  return <LoadingIndicator label="Loading chart…" className={cn('h-92', className)} />
}

export { Spinner, LoadingIndicator, ChartLoading }
