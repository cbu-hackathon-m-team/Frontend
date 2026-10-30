import { describe, expect, it } from 'vitest'
import { cn } from './utils'
import { typeTokens } from '@/pages/design-system/_data/typography.generated'

describe('typography role merging', () => {
  it.each(typeTokens)('registers the role $className for component overrides', ({ className }) => {
    const isCode = className.startsWith('type-code-')
    expect(cn('font-sans type-body-md', className)).toBe(isCode ? className : `font-sans ${className}`)
    expect(cn(className, 'type-label-md')).toBe('type-label-md')
  })

  it('lets a component caller override the default role', () => {
    expect(cn('type-body-md text-interface-secondary', 'type-label-sm text-interface-muted'))
      .toBe('type-label-sm text-interface-muted')
  })

  it('keeps responsive roles separate from the base role', () => {
    expect(cn('type-body-md-medium md:type-body-md', 'md:type-label-sm'))
      .toBe('type-body-md-medium md:type-label-sm')
  })

  it('preserves ordinary layout merging', () => {
    expect(cn('px-4 type-body-md-medium', 'px-6 type-body-md')).toBe('px-6 type-body-md')
  })

  it('merges sizes, weights, and roles as a single typography choice', () => {
    expect(cn('type-heading-xl', 'type-heading-md', 'type-heading-xs')).toBe('type-heading-xs')
    expect(cn('type-body-md', 'type-body-md-medium')).toBe('type-body-md-medium')
    expect(cn('type-label-lg', 'type-metric-sm', 'type-code-md')).toBe('type-code-md')
  })

  it('lets an explicit code role replace a default font without affecting ordinary roles', () => {
    expect(cn('font-sans', 'type-code-md')).toBe('type-code-md')
    expect(cn('font-serif type-body-md', 'type-code-md')).toBe('type-code-md')
    expect(cn('font-sans type-code-md', 'type-label-md')).toBe('font-sans type-label-md')
    expect(cn('font-sans', 'type-label-md')).toBe('font-sans type-label-md')
    expect(cn('type-code-md', 'font-sans')).toBe('type-code-md font-sans')
  })

  it('scopes font conflicts to the same responsive and interaction variants', () => {
    expect(cn('font-sans', 'md:type-code-md')).toBe('font-sans md:type-code-md')
    expect(cn('md:font-sans', 'md:type-code-md')).toBe('md:type-code-md')
    expect(cn('font-sans focus:font-sans', 'focus:type-code-md')).toBe('font-sans focus:type-code-md')
    expect(cn('type-code-md', 'type-label-md')).toBe('type-label-md')
    expect(cn('type-code-md', 'md:type-label-md')).toBe('type-code-md md:type-label-md')
  })
})
