import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex flex-col gap-2",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "rounded-md border border-boundary-default bg-surface-panel p-1",
        ghost: "gap-0.5",
        line: "w-full justify-start gap-4 border-b border-boundary-default px-4 bg-transparent",
      },
      size: {
        default: "h-9 w-fit",
        sm: "h-8 w-fit",
        xs: "h-7 w-fit",
      },
    },
    compoundVariants: [
      {
        variant: "line",
        className: "h-auto w-full",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap transition-all duration-[var(--motion-responsive)] outline-none focus-control focus-visible:z-10 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "flex-1 rounded-sm text-interface-muted hover:text-interface-primary data-[state=active]:bg-interaction-selected data-[state=active]:text-interface-contrast data-[state=active]:hover:text-interface-contrast",
        ghost:
          "rounded text-interface-muted hover:text-interface-secondary data-[state=active]:bg-interaction-hover-control data-[state=active]:text-interface-contrast data-[state=active]:hover:text-interface-contrast",
        line:
          "border-b-2 border-transparent text-interface-muted hover:text-interface-primary data-[state=active]:border-contrast data-[state=active]:text-interface-contrast data-[state=active]:hover:text-interface-contrast",
      },
      size: {
        default: "h-full px-2 type-label-md gap-1.5 [&_svg]:size-4",
        sm: "h-full px-1.5 type-label-sm gap-1.5 [&_svg]:size-4",
        xs: "h-full px-1.5 type-label-xs gap-1 [&_svg]:size-3.5",
      },
    },
    compoundVariants: [
      {
        variant: "line",
        className: "h-auto pb-2.5 px-0 leading-normal",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const TabsListContext = React.createContext<{
  variant?: "default" | "ghost" | "line";
  size?: "default" | "sm" | "xs";
}>({ variant: "default", size: "default" });

function TabsList({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsListContext.Provider value={{ variant: variant || "default", size: size || "default" }}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(tabsListVariants({ variant, size }), className)}
        {...props}
      />
    </TabsListContext.Provider>
  )
}

function TabsTrigger({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & VariantProps<typeof tabsTriggerVariants>) {
  const context = React.useContext(TabsListContext);
  const finalVariant = variant || context.variant;
  const finalSize = size || context.size;

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant: finalVariant, size: finalSize }), className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants }
