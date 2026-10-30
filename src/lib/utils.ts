import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Keep the caller's typography role when a shared component supplies a default.
const twMerge = extendTailwindMerge<'typography' | 'code-typography'>({
  extend: {
    classGroups: {
      typography: [{ type: [
        'display-md',
        'landing-hero', 'landing-heading',
        'landing-title', 'landing-lead', 'landing-body',
        'heading-xl', 'heading-lg', 'heading-md', 'heading-sm', 'heading-xs',
        'body-md', 'body-md-medium', 'body-sm', 'body-xs', 'body-xs-medium',
        'label-xl', 'label-lg', 'label-md', 'label-sm', 'label-xs',
        'eyebrow-xs', 'caption-xs', 'metric-lg', 'metric-lg-semibold', 'metric-md', 'metric-sm', 'metric-sm-tight',
      ] }],
      'code-typography': ['type-code-md', 'type-code-sm'],
    },
    conflictingClassGroups: {
      typography: ['code-typography'],
      'code-typography': ['typography', 'font-family'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
