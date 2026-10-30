import type * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";
import { navItemClasses } from "@/components/ui/sidebar";

// Geometry from trading-dashboard; state colors follow the shared navigation tokens.
export function SidebarHoverButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      data-slot="sidebar-hover-button"
      className={cn(
        navItemClasses,
        "size-10 justify-center gap-0 rounded-xl border-0 p-0 data-[active=true]:shadow-none [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHoverAccountContent(props: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      side="right"
      align="start"
      alignOffset={-48}
      sideOffset={16}
      variant="menu"
      className="data-[state=closed]:animate-none!"
      {...props}
    />
  );
}

export function SidebarHoverEdge({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="sidebar-hover-edge"
      className={cn(
        "fixed bottom-0 left-0 top-13 z-40 w-3 bg-transparent focus-control outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHoverPanel({
  open,
  children,
  className,
  ...props
}: React.ComponentProps<"nav"> & { open: boolean }) {
  return (
    <nav
      data-slot="sidebar-hover-panel"
      data-state={open ? "open" : "closed"}
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "fixed left-0 top-13 z-50 py-4 pr-4 pl-0 transition-transform duration-250 ease-[cubic-bezier(0.25,0.1,0.25,1)] data-[state=closed]:-translate-x-[150%] data-[state=closed]:pointer-events-none motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <ul className="relative flex flex-col items-center gap-2 rounded-r-2xl border border-l-0 border-boundary-default bg-surface-overlay/80 p-2 shadow-overlay dark:shadow-2xl backdrop-blur-xl">
        <li aria-hidden="true" className="absolute -top-4 left-0 h-4 w-full bg-transparent" />
        {children}
      </ul>
    </nav>
  );
}
