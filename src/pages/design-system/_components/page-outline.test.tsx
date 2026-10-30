import { useRef } from "react"
import { afterEach, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { PageOutline, PageOutlineSkeleton } from "./page-outline"
import { componentCatalog } from "../_data/catalog"

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); window.history.replaceState(null, "", "/") })

it("reserves the full loaded outline hierarchy during loading without interactive placeholders", () => {
  const pending = render(<PageOutlineSkeleton />)
  const rows = [...pending.container.querySelectorAll("li")]
  const placeholders = rows.map(row => ({ title: row.textContent, level: row.dataset.level }))
  for (const row of rows) expect(row.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  expect(pending.container.querySelector("a, button, [tabindex]")).toBeNull()
  pending.unmount()

  render(<PageOutline scrollRootRef={{ current: null }} />)
  const links = screen.getAllByRole("link").map(link => ({
    title: link.textContent,
    level: link.closest("li")!.dataset.level,
  }))
  expect(placeholders).toEqual(links)
  expect(links.filter(link => componentCatalog.some(([, title]) => title === link.title))).toHaveLength(componentCatalog.length)
})

it("shows two outline levels while tracking nested sections and delayed deep links", async () => {
  window.history.replaceState(null, "", "#table")
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} })
  const positions: Record<string, number> = { foundations: -1000, materials: 40, shape: 80, components: 1000, behavior: 5000 }
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return { top: positions[this.id] ?? 0, bottom: (positions[this.id] ?? 0) + 20, height: 20 } as DOMRect
  })
  function Document() {
    const ref = useRef<HTMLDivElement>(null)
    return <div ref={ref} data-testid="scroll-root">
      <main id="system-content"><section id="foundations"><div id="materials"><div id="shape" /></div></section>
        <section id="components" /><section id="behavior" /></main>
      <PageOutline scrollRootRef={ref} />
    </div>
  }
  render(<Document />)
  const scrollTo = vi.fn()
  screen.getByTestId("scroll-root").scrollTo = scrollTo
  const nav = within(screen.getByRole("navigation", { name: "On this page" }))
  const linkElements = nav.getAllByRole("link")
  const byTitle = new Map(linkElements.map(link => [link.textContent, link]))
  const links = linkElements.map(link => link.textContent)
  expect(links.indexOf("Foundations")).toBeLessThan(links.indexOf("Materials"))
  const componentLinks = links.slice(links.indexOf("Components") + 1, links.indexOf("Behavior"))
  expect(componentLinks).toEqual(componentCatalog.map(([, title]) => title))
  expect(links.indexOf("Behavior")).toBeLessThan(links.indexOf("Interaction state"))
  expect(links.indexOf("Interaction state")).toBeLessThan(links.indexOf("Motion"))
  expect(byTitle.get("Interaction state")!.closest("li")).toHaveAttribute("data-level", "2")
  expect(byTitle.get("Interaction state")!).toHaveAttribute("href", "#interaction")
  expect(links).not.toContain("Destructive Action Modal")
  expect(links.indexOf("Motion")).toBeLessThan(links.indexOf("Usage rules"))
  expect(nav.queryByRole("link", { name: "Product compositions" })).not.toBeInTheDocument()
  expect(byTitle.get("Materials")!.closest("li")).toHaveAttribute("data-level", "2")
  for (const [, title] of componentCatalog) {
    expect(byTitle.get(title)!.closest("li")).toHaveAttribute("data-level", "2")
  }
  for (const name of ["Surface", "Shape", "Boundary", "Elevation", "Actions & overlays", "Forms & selection", "Navigation", "Feedback & states", "Data & identity"]) {
    expect(byTitle.get(name) ?? null).not.toBeInTheDocument()
  }
  await waitFor(() => expect(byTitle.get("Materials")!).toHaveAttribute("aria-current", "location"), { timeout: 5000 })

  positions.shape = -1000
  positions.components = 40
  positions.table = 80
  const table = document.createElement("article")
  table.id = "table"
  document.getElementById("components")!.append(table)
  await waitFor(() => expect(byTitle.get("Table")!).toHaveAttribute("aria-current", "location"), { timeout: 5000 })
  expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" })
  expect(byTitle.get("Table")!).toHaveAttribute("href", "#table")

  positions.behavior = 80
  fireEvent.scroll(screen.getByTestId("scroll-root"))
  await waitFor(() => expect(byTitle.get("Behavior")!).toHaveAttribute("aria-current", "location"), { timeout: 5000 })
  expect(byTitle.get("Table")!).not.toHaveAttribute("aria-current")
}, 15000)
