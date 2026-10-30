import { afterEach, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CollapseSpecimen, ErrorSpecimen, FieldSpecimen, ModalSpecimen, SliderSpecimen } from "./extended-specimens"
import { Progress } from "@/components/ui/progress"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MemoryRouter } from "react-router-dom"

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it("uses the actual workspace navigation and lets the user collapse and reopen its links", async () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  const user = userEvent.setup()
  render(<MemoryRouter><SidebarProvider><CollapseSpecimen /></SidebarProvider></MemoryRouter>)
  const trigger = screen.getByRole("button", { name: "Workspace" })
  expect(screen.getByRole("link", { name: "Design" })).toHaveAttribute("href", "/design-system")
  expect(screen.getByRole("link", { name: "Engineering" })).toHaveAttribute("href", "/")
  await user.click(trigger)
  expect(trigger).toHaveAttribute("aria-expanded", "false")
  expect(screen.queryByRole("link", { name: "Design" })).not.toBeInTheDocument()
  await user.click(trigger)
  expect(trigger).toHaveAttribute("aria-expanded", "true")
  expect(screen.getByRole("link", { name: "Engineering" })).toBeVisible()
})

it("exposes the displayed progress value to assistive technology", () => {
  render(<Progress value={21.7} aria-label="Completion progress" />)
  expect(screen.getByRole("progressbar", { name: "Completion progress" })).toHaveAttribute("aria-valuenow", "21.7")
})

it("associates a required field error and clears it after valid submission", async () => {
  const user = userEvent.setup()
  render(<FieldSpecimen />)
  await user.click(screen.getByRole("button", { name: "Save" }))
  const input = screen.getByRole("textbox", { name: /Project name/ })
  expect(input).toHaveAttribute("aria-invalid", "true")
  expect(input).toHaveAccessibleDescription(/Enter a project name/)
  await user.type(input, "Website redesign")
  await user.click(screen.getByRole("button", { name: "Save" }))
  expect(input).toHaveAttribute("aria-invalid", "false")
  expect(screen.getByRole("status")).toHaveTextContent("Changes saved.")
})

it("offers recovery from a panel error", async () => {
  render(<ErrorSpecimen />)
  expect(screen.getByRole("alert")).toHaveTextContent("Unable to load data")
  await userEvent.click(screen.getByRole("button", { name: "Retry" }))
  expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  expect(screen.getByRole("status")).toHaveTextContent("Data loaded.")
})

it("gives the actual slider thumb an accessible name and supports keyboard increments", async () => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} })
  render(<SliderSpecimen />)
  const slider = screen.getByRole("slider", { name: /Allocation/ })
  slider.focus()
  await userEvent.keyboard("{ArrowRight}")
  expect(slider).toHaveAttribute("aria-valuenow", "26")
  expect(screen.getByRole("spinbutton")).toHaveValue(26)
})

it("closes a titled modal with Escape and restores focus", async () => {
  const user = userEvent.setup()
  render(<ModalSpecimen />)
  const trigger = screen.getByRole("button", { name: "View details" })
  await user.click(trigger)
  expect(screen.getByRole("dialog", { name: "Project details" })).toBeInTheDocument()
  await user.keyboard("{Escape}")
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})
