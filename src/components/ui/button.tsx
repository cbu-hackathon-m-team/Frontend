import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const standardButtonSize = "h-8 gap-2 px-4 has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3.5"

const buttonVariants = cva(
  "type-label-md inline-flex shrink-0 items-center justify-center gap-2 rounded-md whitespace-nowrap transition-all outline-none focus-control disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-none disabled:bg-interface-secondary disabled:opacity-80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive/60 dark:hover:bg-destructive/90",
        outline:
          "border border-boundary-default bg-transparent hover:border-boundary-strong",
        secondary:
          "bg-button-secondary border border-button-secondary-border text-interface-contrast hover:bg-button-secondary-hover shadow-control",
        ghost:
          "border border-transparent bg-transparent hover:text-interface-contrast hover:bg-interaction-button-hover data-[active=true]:bg-interaction-button-hover data-[active=true]:text-interface-contrast data-[active=true]:border-boundary-default data-[active=true]:shadow-sm data-[state=on]:bg-interaction-button-hover data-[state=on]:text-interface-contrast data-[state=on]:border-boundary-default data-[state=on]:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        lg: "h-11 gap-2 rounded-lg px-5 type-label-lg [&_svg]:size-4",
        default: standardButtonSize,
        xs: "h-6 gap-1 rounded-md px-2 type-label-sm has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: standardButtonSize,
        icon: "size-8",
        "icon-sm": "size-8 rounded-md [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-7 rounded-md type-label-xs [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
