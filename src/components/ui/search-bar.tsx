import * as React from "react";
import { Search, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

interface SearchBarProps extends Omit<
  React.ComponentProps<"input">,
  "onChange"
> {
  value: string;
  onValueChange: (value: string) => void;
  containerClassName?: string;
  onClear?: () => void;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    { value, onValueChange, className, containerClassName, onClear, ...props },
    ref,
  ) => {
    return (
      <InputGroup className={containerClassName}>
        <InputGroupInput
          ref={ref}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={className}
          {...props}
        />

        {/* 검색 아이콘 — inline-start 위치 */}
        <InputGroupAddon align="inline-start">
          <Search className="text-interface-muted group-focus-within/input-group:text-interface-contrast transition-colors" />
        </InputGroupAddon>

        {/* Clear 버튼 — 값이 있을 때만 표시 */}
        {value && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              variant="ghost"
              onClick={() => {
                onValueChange("");
                onClear?.();
              }}
              aria-label="Clear filter"
              className="text-interface-muted hover:text-interface-contrast hover:bg-transparent"
            >
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    );
  },
);

SearchBar.displayName = "SearchBar";
