import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { Card } from './card'
import { StatsStripItem, StatsStripLayout } from './stats-strip'
import { projectCardClasses } from '@/components/common/example-patterns'

afterEach(cleanup)

it('shares card emphasis with summaries without adding selection to them', () => {
  const { container } = render(<>
    <StatsStripLayout><StatsStripItem label="Total Value">100</StatsStripItem></StatsStripLayout>
    <div data-state="selected" className={projectCardClasses()}>Project</div>
  </>)
  const summary = screen.getByRole('heading', { name: 'Total Value' }).parentElement!.parentElement!
  const selected = container.querySelector('[data-state="selected"]')!
  for (const card of [summary, selected]) expect(card).toHaveClass('hover:bg-card-emphasis')
  expect(summary).not.toHaveClass('data-[state=selected]:bg-card-emphasis')
  expect(selected).toHaveClass('data-[state=selected]:bg-card-emphasis')
  expect(summary).not.toHaveClass('hover:border-boundary-strong', 'data-[state=selected]:border-boundary-strong')
  expect(selected).toHaveClass('hover:border-boundary-strong')
  summary.click()
  expect(summary).not.toHaveAttribute('data-state')
  expect(selected).toHaveAttribute('data-state', 'selected')
})

it('keeps a plain panel passive without changing its contents or events', () => {
  let clicks = 0
  render(<Card variant="panel" aria-label="Settings panel"><button onClick={() => clicks++}>Save</button></Card>)
  const card = screen.getByLabelText('Settings panel')
  expect(card).toHaveClass('rounded-lg', 'border', 'border-boundary-default', 'bg-surface-panel')
  expect(card.className).not.toMatch(/focus|hover|shadow|text-|p[xy]?-/)
  screen.getByRole('button', { name: 'Save' }).click()
  expect(clicks).toBe(1)
})

it('preserves existing card defaults and explicit panel differences without a focus-within effect', () => {
  render(<><Card aria-label="Login" /><Card variant="panel" className="rounded-xl bg-surface-chrome shadow-panel hover:border-boundary-strong" aria-label="History" /></>)
  expect(screen.getByLabelText('Login')).toHaveClass('rounded-xl', 'shadow-panel', 'dark:shadow-control')
  expect(screen.getByLabelText('Login').className).not.toContain('focus-within')
  expect(screen.getByLabelText('History')).toHaveClass('rounded-xl', 'bg-surface-chrome', 'shadow-panel', 'hover:border-boundary-strong')
  expect(screen.getByLabelText('History')).not.toHaveClass('rounded-lg', 'bg-surface-panel')
})
