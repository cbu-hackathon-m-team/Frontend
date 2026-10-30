import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { cleanup } from "@testing-library/react"
import { InteractiveExample } from "./interaction-states"
import { interactionExamples } from "../_data/interaction-examples"
import { Button } from "@/components/ui/button"
import { ActionButton } from "@/components/ui/action-button"
import { CopyField } from "@/components/ui/copy-field"
import { interactionPatterns } from "../_data/interaction-patterns"

afterEach(cleanup)

it("separates summary hover from card selection while sharing the 4% background", () => {
  const summary = interactionPatterns.find(pattern => pattern.name === "Summary hover")!
  expect(summary.rules.map(rule => rule.id)).toEqual(["stats-item"])
  expect(summary.cases.map(example => example.label)).toEqual(["Default", "Hover"])
  const pattern = interactionPatterns.find(pattern => pattern.name === "Fill + boundary")!
  expect(pattern.rules.map(rule => rule.id)).toEqual(["project-card", "workspace-empty"])
  expect(pattern.cases.map(example => example.label)).toEqual(["Default", "Hover", "Selected"])
  expect(pattern.value).toContain("4%")
})

it("groups disabled and loading states with their surface patterns", () => {
  const primary = interactionPatterns.find(pattern => pattern.name === "Primary fill")!
  const secondary = interactionPatterns.find(pattern => pattern.name === "Secondary fill")!
  expect(primary.cases.map(example => example.label)).toEqual(["Default", "Hover", "Focus", "Disabled"])
  expect(secondary.cases.map(example => example.label)).toEqual(["Default", "Hover", "Focus", "Loading"])
  expect(secondary.cases.find(example => example.state.loading)?.rule.id).toBe("action-zinc")
  expect(interactionPatterns.some(pattern => ["Disabled control", "Loading action"].includes(pattern.name))).toBe(false)
})

it("shares the primary disabled palette while preserving semantic action colors", () => {
  render(<><Button disabled>Save changes</Button><ActionButton theme="white" disabled>Resume All</ActionButton><ActionButton theme="rose" disabled>Stop All</ActionButton><ActionButton isLoading>Sync Data</ActionButton></>)
  for (const name of ["Save changes", "Resume All"]) {
    expect(screen.getByRole("button", { name })).toBeDisabled()
    expect(screen.getByRole("button", { name })).toHaveClass("disabled:bg-interface-secondary", "disabled:opacity-80")
  }
  expect(screen.getByRole("button", { name: "Stop All" })).toHaveClass("disabled:bg-interaction-hover-control", "disabled:opacity-50")
  expect(screen.getByRole("button", { name: "Sync Data" })).toBeDisabled()
  expect(screen.getByRole("button", { name: "Sync Data" })).toHaveAttribute("aria-busy", "true")
})

it("lets activity metrics use the shared row selection state", () => {
  render(<InteractiveExample rule={interactionExamples.find(rule => rule.id === "activity-metric")!} />)
  const metric = screen.getByRole("button", { name: /Completed tasks/ })
  expect(metric).not.toHaveAttribute("data-state", "selected")
  fireEvent.click(metric)
  expect(metric).toHaveAttribute("data-state", "selected")
  expect(metric).toHaveClass("hover:bg-table-row-hover", "data-[state=selected]:bg-table-row-selected", "data-[state=selected]:hover:bg-table-row-selected")
  fireEvent.click(metric)
  expect(metric).not.toHaveAttribute("data-state", "selected")
})

it.each(["table", "member-row"])("keeps %s selection on the shared table row states", id => {
  render(<InteractiveExample rule={interactionExamples.find(rule => rule.id === id)!} />)
  const row = screen.getByRole("row")
  expect(row).not.toHaveAttribute("data-state", "selected")
  fireEvent.click(row)
  expect(row).toHaveAttribute("data-state", "selected")
  expect(row).toHaveClass("hover:bg-table-row-hover", "data-[state=selected]:bg-table-row-selected", "data-[state=selected]:hover:bg-table-row-selected")
  fireEvent.click(row)
  expect(row).not.toHaveAttribute("data-state", "selected")
})

it("keeps destructive hover on the shared palette in both themes", () => {
  render(<Button variant="destructive">Delete</Button>)
  expect(screen.getByRole("button")).toHaveClass("hover:bg-destructive/90", "dark:hover:bg-destructive/90")
})

it("inherits secondary button surfaces and boundaries for copy fields", () => {
  render(<CopyField value="Example" />)
  expect(screen.getByRole("button")).toHaveClass("bg-button-secondary", "border-button-secondary-border", "hover:bg-button-secondary-hover")
  expect(screen.getByRole("button")).not.toHaveClass("hover:border-boundary-strong", "dark:bg-surface-chrome", "hover:bg-interaction-subtle")
  expect(interactionPatterns.flatMap(pattern => pattern.rules).some(rule => rule.id === "copy")).toBe(false)
})

it("places focus alongside each pattern instead of in a separate feedback card", () => {
  expect(interactionPatterns.some(pattern => pattern.name === "Focus ring")).toBe(false)
  const boundary = interactionPatterns.find(pattern => pattern.name === "Stronger boundary")!
  expect(boundary.cases.some(example => example.rule.id === "input" && example.label === "Focus")).toBe(true)
  expect(interactionPatterns.flatMap(pattern => pattern.cases).some(example => example.label.startsWith("Focus /"))).toBe(false)
  expect(interactionPatterns.find(pattern => pattern.name === "Raised fill")!.cases.find(example => example.label === "Focus")?.rule.id).toBe("select-glass")
  expect(interactionPatterns.flatMap(pattern => pattern.cases).some(example => example.state.name === "Focus" && ["slider", "project-card"].includes(example.rule.id))).toBe(false)
})

it("keeps status toggle styling in Components rather than shared interaction rules", () => {
  expect(interactionPatterns.some(pattern => pattern.name === "Semantic boundary")).toBe(false)
  expect(interactionPatterns.flatMap(pattern => pattern.rules).some(rule => rule.id.startsWith("status-"))).toBe(false)
  expect(interactionExamples.some(rule => rule.id === "status-emerald")).toBe(true)
})

it("does not exhibit a card focus-within state", () => {
  expect(interactionExamples.some(rule => rule.id === "card-focus")).toBe(false)
  expect(interactionPatterns.some(pattern => pattern.name === "Focus within")).toBe(false)
})

it("lets a product toggle change selection without connecting a product action", () => {
  render(<InteractiveExample rule={interactionExamples.find(rule => rule.id === "toggle-glass")!} />)
  const toggle = screen.getByRole("button", { name: "Hide small" })
  expect(toggle).toHaveAttribute("aria-pressed", "false")
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-pressed", "true")
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-pressed", "false")
})

it("lets an example field accept edits and keyboard focus", () => {
  render(<InteractiveExample rule={interactionExamples.find(rule => rule.id === "input")!} />)
  const input = screen.getByRole("textbox")
  expect(input).not.toHaveAttribute("readonly")
  expect(input).toHaveAttribute("tabindex", "0")
  fireEvent.change(input, { target: { value: "Mobile app" } })
  expect(input).toHaveValue("Mobile app")
})

it("uses the component's native hover rules without adding a forced hover color", () => {
  const { container } = render(<InteractiveExample rule={interactionExamples.find(rule => rule.id === "action-zinc")!} />)
  const wrapper = container.firstChild as HTMLElement
  const button = screen.getByRole("button", { name: "Sync Data" })
  fireEvent.pointerEnter(wrapper)
  expect(button).toHaveClass("hover:bg-button-secondary-hover")
  expect(button).not.toHaveClass("bg-button-secondary-hover")
  fireEvent.pointerLeave(wrapper)
  expect(button).not.toHaveClass("bg-button-secondary-hover")
})
