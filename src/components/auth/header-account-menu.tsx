import { useState } from "react";
import { User } from "lucide-react";
import { WorkspaceAccountMenu } from "@/components/dashboard/workspace-account-menu";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function HeaderAccountMenu({ context = "landing" }: { context?: "landing" | "design-system" }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="계정 메뉴" data-active={open}>
          <User />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" variant="menu" aria-label="계정 설정">
        <WorkspaceAccountMenu context={context} onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
