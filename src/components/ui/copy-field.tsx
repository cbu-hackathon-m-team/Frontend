import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function CopyField({
  value,
  copied = false,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
  value: string
  copied?: boolean
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      className={cn(
        "group h-auto max-w-full justify-start gap-2 rounded-md px-3.5 py-2 text-left transition-all duration-[var(--motion-responsive)]",
        className,
      )}
      {...props}
    >
      <span className="max-w-50 truncate select-none font-mono text-[12.5px] tracking-tight text-interface-secondary transition-colors group-hover:text-interface-primary md:max-w-xs">
        {value}
      </span>
      {copied ? (
        <Check className="ml-1 size-3.5 shrink-0 text-signal-success" />
      ) : (
        <Copy className="ml-1 size-3.5 shrink-0 text-interface-disabled transition-colors group-hover:text-interface-contrast" />
      )}
    </Button>
  )
}

export { CopyField }
