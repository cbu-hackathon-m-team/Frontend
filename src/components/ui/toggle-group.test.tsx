import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

afterEach(cleanup);

function Pages({ orientation }: { orientation: "horizontal" | "vertical" }) {
  const [page, setPage] = useState("Home");
  return (
    <ToggleGroup
      type="single"
      orientation={orientation}
      value={page}
      onValueChange={(value) => {
        if (value) setPage(value);
      }}
    >
      {["Home", "About", "News"].map((name) => (
        <ToggleGroupItem key={name} value={name}>
          {name}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

it("keeps every vertical item rounded while selection and arrow focus move", async () => {
  const user = userEvent.setup();
  render(<Pages orientation="vertical" />);
  expect(screen.getByRole("group")).toHaveAttribute(
    "data-orientation",
    "vertical",
  );
  await user.tab();
  expect(screen.getByRole("radio", { name: "Home" })).toHaveFocus();
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("radio", { name: "About" })).toHaveFocus();
  await user.keyboard(" ");
  expect(screen.getByRole("radio", { name: "About" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await user.click(screen.getByRole("radio", { name: "News" }));
  for (const item of screen.getAllByRole("radio")) {
    expect(item).toHaveClass("rounded-md");
    expect(item).not.toHaveClass("rounded-none");
    expect(item).not.toHaveClass("first:rounded-l-md");
    expect(item).not.toHaveClass("last:rounded-r-md");
  }
});

it("preserves joined corners and horizontal keyboard navigation", async () => {
  const user = userEvent.setup();
  render(<Pages orientation="horizontal" />);
  for (const item of screen.getAllByRole("radio"))
    expect(item).toHaveClass(
      "rounded-none",
      "first:rounded-l-md",
      "last:rounded-r-md",
    );
  await user.tab();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: "About" })).toHaveFocus();
});
