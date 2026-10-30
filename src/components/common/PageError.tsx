import { useId } from "react"
import { OctagonAlert } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty"
import { cn } from "@/lib/utils"

export function PageError({ onRetry, autoFocus = false, className, variant = "page" }: {
  onRetry: () => void
  autoFocus?: boolean
  className?: string
  variant?: "page" | "panel"
}) {
  const titleId = useId()
  return <Empty role="alert" aria-labelledby={titleId} variant={variant} className={cn("w-full", className)}>
    <EmptyMedia variant="error">
      <OctagonAlert aria-hidden="true" className="size-8" />
    </EmptyMedia>
    <EmptyHeader className="max-w-85">
      <h1 id={titleId} className="text-base/6 font-medium">Couldn't Load Page</h1>
      <EmptyDescription>Try again to load this page, or return to the overview.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent className="max-w-85">
      <Button type="button" variant="secondary" autoFocus={autoFocus} onClick={onRetry}>Try Again</Button>
      <Link to="/" className="text-sm/5 text-interface-subtle transition-colors hover:text-interface-default focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Back to Overview</Link>
    </EmptyContent>
  </Empty>
}
