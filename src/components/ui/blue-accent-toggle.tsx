import { Diamond } from "lucide-react";
import { useBlueAccent } from "@/components/providers/AppearanceProvider";
import { Toggle } from "@/components/ui/toggle";

export function BlueAccentToggle() {
  const { blueAccent, setBlueAccent } = useBlueAccent();
  return <Toggle variant="glass" size="xs" pressed={blueAccent} onPressedChange={setBlueAccent} aria-label="Blue accent" title="Blue accent"><Diamond data-icon="inline-start" />Blue</Toggle>;
}
