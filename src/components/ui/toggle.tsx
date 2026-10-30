import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-control outline-none transition-colors duration-[var(--motion-responsive)] motion-reduce:transition-none whitespace-nowrap cursor-pointer",
  {
    variants: {
      variant: {
        default:
          'bg-transparent hover:bg-muted hover:text-interface-contrast data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:hover:bg-accent data-[state=on]:hover:text-accent-foreground',
        outline:
          'border border-input bg-transparent shadow-xs hover:bg-interaction-button-hover hover:text-interface-contrast data-[state=on]:bg-interaction-selected data-[state=on]:text-interface-contrast data-[state=on]:hover:bg-interaction-selected data-[state=on]:hover:text-interface-contrast',
        glass:
          'border border-transparent bg-transparent text-interface-muted hover:text-interface-contrast hover:bg-interaction-button-hover data-[state=on]:bg-interaction-button-hover data-[state=on]:text-interface-contrast data-[state=on]:border-boundary-default data-[state=on]:hover:bg-interaction-button-hover data-[state=on]:hover:text-interface-contrast',
      },
      size: {
        default: 'h-9 px-2 min-w-9 type-label-sm',
        xs: 'h-7 px-2 min-w-6 type-label-xs rounded',
        sm: 'h-8 px-1.5 min-w-8 type-label-lg leading-5',
        lg: 'h-10 px-2.5 min-w-10 type-label-lg leading-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
