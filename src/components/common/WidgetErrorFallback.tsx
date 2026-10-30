import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FallbackProps } from "react-error-boundary";

export function WidgetErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center h-full min-h-[200px] p-4 bg-surface-panel border border-signal-danger/20 rounded-xl text-center">
      <AlertCircle aria-hidden="true" className="size-8 text-signal-danger mb-2" />
      <p className="text-sm font-medium text-signal-danger mb-1">Unable to load data</p>
      <p className="text-xs text-interface-subtle mb-4 line-clamp-2">
        {error instanceof Error ? error.message : String(error)}
      </p>
      <Button
        variant="secondary"
        size="sm"
        onClick={resetErrorBoundary}
      >
        <RefreshCw aria-hidden="true" />
        Retry
      </Button>
    </div>
  );
}
