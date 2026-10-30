import { cn } from '@/lib/utils';
import { cardEmphasisClasses } from '@/components/ui/card';
import { tableRowInteractionClasses } from '@/components/ui/table';

export function projectCardClasses() {
  return cn('group relative w-full cursor-pointer overflow-hidden rounded-lg border border-boundary-default bg-surface-chrome px-4 py-3.5 shadow-panel transition-all duration-(--motion-responsive)', cardEmphasisClasses);
}
export function memberRowClasses() {
  return 'type-body-md border-b border-boundary-subtle transition-colors duration-(--motion-responsive) ease-out group cursor-pointer';
}
export function activityMetricClasses() {
  return cn('group/stat relative flex cursor-pointer flex-col gap-0.5 overflow-hidden border border-boundary-subtle px-6 py-5 text-left transition-colors duration-(--motion-responsive) focus-control', tableRowInteractionClasses);
}
export const emptyPanelClasses = cn('group flex flex-col items-center justify-center rounded-lg border border-dashed border-boundary-default bg-surface-panel p-12 text-center transition-all duration-(--motion-responsive)', cardEmphasisClasses);
