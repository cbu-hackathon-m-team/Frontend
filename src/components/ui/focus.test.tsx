import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { Button } from './button'
import { Input } from './input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'
import { Select, SelectTrigger, SelectValue } from './select'
import { GeistDateRangePicker } from './geist-date-range-picker'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './dialog'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './sheet'

afterEach(cleanup)

it.each(['dialog', 'sheet'] as const)('uses keyboard-only control focus for the shared %s close action', async kind => {
  const user = userEvent.setup()
  const Root = kind === 'dialog' ? Dialog : Sheet
  const Content = kind === 'dialog' ? DialogContent : SheetContent
  const Title = kind === 'dialog' ? DialogTitle : SheetTitle
  const Description = kind === 'dialog' ? DialogDescription : SheetDescription
  render(<Root defaultOpen><Content><Title>Details</Title><Description>Review the details.</Description><Button>Continue</Button></Content></Root>)
  const close = screen.getByRole('button', { name: 'Close' })
  expect(close).toHaveClass('focus-control', 'outline-none')
  expect(close).not.toHaveClass('focus:ring-2', 'focus:ring-offset-2')
  await user.tab()
  expect(close).toHaveFocus()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it.each(['default', 'ghost', 'glass'] as const)('keeps the dedicated field focus on the %s select trigger before opening', async variant => {
  const user = userEvent.setup()
  render(<Select><SelectTrigger variant={variant} aria-label="Workspace"><SelectValue placeholder="All" /></SelectTrigger></Select>)
  await user.tab()
  expect(screen.getByRole('combobox')).toHaveFocus()
  expect(screen.getByRole('combobox')).toHaveAttribute('data-state', 'closed')
  expect(screen.getByRole('combobox')).not.toHaveClass('focus-control')
  expect(screen.getByRole('combobox')).toHaveClass('focus-visible:border-boundary-focus', 'focus-visible:ring-ring/50', 'focus-visible:ring-[3px]')
})

it('keeps both date picker triggers in the keyboard sequence with dedicated field focus', async () => {
  const user = userEvent.setup()
  render(<GeistDateRangePicker dateRange={undefined} setDateRange={() => {}} />)
  for (const name of ['Date range', 'Date range presets']) {
    await user.tab()
    expect(screen.getByRole('button', { name })).toHaveFocus()
    expect(screen.getByRole('button', { name })).not.toHaveClass('focus-control')
    expect(screen.getByRole('button', { name })).toHaveClass('focus-visible:border-boundary-focus', 'focus-visible:ring-ring/50', 'focus-visible:ring-[3px]')
  }
})

it.each(['default', 'ghost', 'line'] as const)('keeps %s tab focus on the inner trigger and preserves arrow navigation', async variant => {
  const user = userEvent.setup()
  render(<Tabs defaultValue="overview"><TabsList variant={variant}><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="details">Details</TabsTrigger></TabsList><TabsContent value="overview">Overview content</TabsContent><TabsContent value="details">Details content</TabsContent></Tabs>)
  await user.tab()
  expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus()
  expect(screen.getByRole('tab', { name: 'Overview' })).toHaveClass('focus-control')
  expect(screen.getByRole('tablist')).not.toHaveClass('focus-control')
  await user.keyboard('{ArrowRight}')
  expect(screen.getByRole('tab', { name: 'Details' })).toHaveFocus()
  expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true')
})

it('uses detached control focus without replacing text field focus', async () => {
  const user = userEvent.setup()
  render(<><Button>Save</Button><Button variant="destructive">Delete</Button><Input aria-label="Name" /></>)
  await user.tab()
  expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
  for (const name of ['Save', 'Delete']) {
    expect(screen.getByRole('button', { name })).toHaveClass('focus-control')
    expect(screen.getByRole('button', { name })).not.toHaveClass('focus-visible:ring-[3px]', 'focus-visible:border-ring')
  }
  await user.tab()
  await user.tab()
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus()
  expect(screen.getByRole('textbox')).not.toHaveClass('focus-control')
  expect(screen.getByRole('textbox')).toHaveClass('focus-visible:ring-[3px]')
})
