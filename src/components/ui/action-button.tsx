import * as React from "react";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  theme?: "rose" | "orange" | "white" | "zinc";
  icon?: LucideIcon | React.ElementType;
  isLoading?: boolean;
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      theme = "zinc",
      icon: Icon,
      onClick,
      disabled,
      isLoading,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyle =
      "transition-all duration-[var(--motion-responsive)] active:scale-95 cursor-pointer outline-none";

    const themes = {
      rose: "bg-interaction-hover-control border border-boundary-subtle text-interface-secondary hover:bg-signal-danger/10 hover:text-signal-danger hover:border-signal-danger/30 disabled:bg-interaction-hover-control disabled:opacity-50",
      orange:
        "bg-interaction-hover-control border border-boundary-subtle text-interface-secondary hover:bg-signal-attention/10 hover:text-signal-attention hover:border-signal-attention/30 disabled:bg-interaction-hover-control disabled:opacity-50",
      white:
        "bg-contrast border-0 text-on-contrast hover:bg-interface-primary disabled:cursor-not-allowed dark:shadow-action-highlight",
      zinc: "",
    };

    const iconColors = {
      rose: "text-signal-danger",
      orange: "text-signal-attention",
      white: "text-on-contrast",
      zinc: "text-interface-secondary",
    };

    return (
      <Button
        ref={ref}
        size="sm"
        variant={theme === "zinc" ? "secondary" : "default"}
        onClick={onClick}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseStyle, themes[theme], className)}
        {...props}
      >
        {isLoading ? (
          <Spinner className="size-3.5" aria-hidden="true" role="presentation" aria-label={undefined} />
        ) : Icon ? (
          <Icon className={cn("size-3.5 shrink-0", iconColors[theme])} />
        ) : null}
        {children}
      </Button>
    );
  }
);
ActionButton.displayName = "ActionButton";
