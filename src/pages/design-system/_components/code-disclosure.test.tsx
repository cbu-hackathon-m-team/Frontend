import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { CodeDisclosure } from "./code-disclosure"

vi.mock("./code-block", () => ({ CodeBlock: ({ code }: { code: string }) => <pre>{code}</pre> }))
afterEach(cleanup)

it("mounts code only while its disclosure is open", () => {
  const getCode = vi.fn(() => "const example = 1")
  const { container } = render(<CodeDisclosure getCode={getCode} />)
  const details = container.querySelector("details")!
  expect(screen.queryByText("const example = 1")).not.toBeInTheDocument()
  expect(getCode).not.toHaveBeenCalled()

  details.open = true
  fireEvent(details, new Event("toggle"))
  expect(screen.getByText("const example = 1")).toBeInTheDocument()
  expect(getCode).toHaveBeenCalledTimes(1)

  details.open = false
  fireEvent(details, new Event("toggle"))
  expect(screen.queryByText("const example = 1")).not.toBeInTheDocument()
  expect(getCode).toHaveBeenCalledTimes(1)
})
