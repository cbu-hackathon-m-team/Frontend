import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SidebarMenuButton, SidebarProvider } from "./sidebar";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each(["default", "sm", "lg"] as const)("keeps product typography independent of the %s geometry", size => {
  render(<SidebarProvider><SidebarMenuButton variant="product" size={size}>Projects</SidebarMenuButton></SidebarProvider>);
  const item = screen.getByRole("button", { name: "Projects" });
  expect(item).toHaveClass("type-body-md-medium");
  expect(item).not.toHaveClass("text-sm");
  expect(item).not.toHaveClass("text-xs");
});

it.each(["default", "outline"] as const)("preserves the generic %s size typography", variant => {
  render(<SidebarProvider>
    <SidebarMenuButton variant={variant}>Default</SidebarMenuButton>
    <SidebarMenuButton variant={variant} size="sm">Small</SidebarMenuButton>
    <SidebarMenuButton variant={variant} size="lg">Large</SidebarMenuButton>
  </SidebarProvider>);
  expect(screen.getByRole("button", { name: "Default" })).toHaveClass("text-sm");
  expect(screen.getByRole("button", { name: "Small" })).toHaveClass("text-xs");
  expect(screen.getByRole("button", { name: "Large" })).toHaveClass("text-sm");
});
