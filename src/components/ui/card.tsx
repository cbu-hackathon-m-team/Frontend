import * as React from 'react'

import { cn } from '@/lib/utils'

export const summaryHoverClasses = 'hover:bg-card-emphasis'
export const cardEmphasisClasses = 'hover:bg-card-emphasis hover:border-boundary-strong data-[state=selected]:bg-card-emphasis data-[state=selected]:border-boundary-strong'

function Card({ className, variant = 'default', ...props }: React.ComponentProps<'div'> & {
  variant?: 'default' | 'panel'
}) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(
        'min-w-0 rounded-lg border border-boundary-default bg-surface-panel',
        variant === 'default' && 'rounded-xl text-interface-contrast shadow-panel dark:shadow-control overflow-hidden transition-all duration-[var(--motion-responsive)]',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, variant = "default", ...props }: React.ComponentProps<'div'> & { variant?: "default" | "divided" }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex min-w-0 flex-col space-y-2 px-6 py-6 md:px-8',
        variant === 'divided' && 'border-b border-boundary-subtle',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('min-w-0 break-words type-label-lg text-interface-contrast', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('type-body-md text-interface-secondary', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('min-w-0 px-6 md:px-8 pb-6 md:pb-8 pt-0', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
    className={cn('flex items-center px-6 md:px-8 py-3.5 md:py-4 bg-surface-canvas border-t border-boundary-default mt-auto transition-colors duration-[var(--motion-responsive)]', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
