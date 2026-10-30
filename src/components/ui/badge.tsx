import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center border w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        success: 'border-signal-success/20 bg-signal-success/10 text-signal-success',
        warning: 'border-signal-warning/25 bg-signal-warning/5 text-signal-warning',
        error: 'border-signal-danger/25 bg-signal-danger/5 text-signal-danger',
        muted: 'border-boundary-subtle bg-surface-raised text-interface-secondary',
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-interface-contrast [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-interface-default [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
      size: {
        default: 'text-[11px] h-5 px-1 rounded-sm font-semibold tracking-tight',
        lg: 'text-[11px] font-semibold tabular-nums px-0.5 py-0.5 rounded-lg min-w-14.5 text-center',
        sm: 'text-[11px] h-4 px-1 rounded-sm font-medium leading-none',
        xs: 'text-[9px] h-3.5 px-0.5 rounded-sm leading-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
