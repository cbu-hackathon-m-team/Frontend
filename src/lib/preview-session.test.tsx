import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { endPreviewSession, PREVIEW_SESSION_KEY, startPreviewSession, usePreviewSession } from "./preview-session";

function SessionStatus() {
  return <output>{usePreviewSession() ? "signed in" : "signed out"}</output>;
}

beforeEach(() => {
  endPreviewSession();
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  endPreviewSession();
  localStorage.clear();
});

it("shares a credential-free flag and restores it after remounting", () => {
  const view = render(<SessionStatus />);
  expect(screen.getByRole("status")).toHaveTextContent("signed out");
  act(startPreviewSession);
  expect(screen.getByRole("status")).toHaveTextContent("signed in");
  expect(localStorage.getItem(PREVIEW_SESSION_KEY)).toBe("active");
  expect(localStorage.length).toBe(1);
  view.unmount();
  render(<SessionStatus />);
  expect(screen.getByRole("status")).toHaveTextContent("signed in");
  act(endPreviewSession);
  expect(screen.getByRole("status")).toHaveTextContent("signed out");
  expect(localStorage.getItem(PREVIEW_SESSION_KEY)).toBeNull();
});

it("syncs sign-in, logout and storage clearing from other tabs", () => {
  render(<SessionStatus />);
  localStorage.setItem(PREVIEW_SESSION_KEY, "active");
  fireEvent(window, new StorageEvent("storage", { key: "theme", storageArea: localStorage }));
  expect(screen.getByRole("status")).toHaveTextContent("signed out");
  fireEvent(window, new StorageEvent("storage", { key: PREVIEW_SESSION_KEY, storageArea: localStorage }));
  expect(screen.getByRole("status")).toHaveTextContent("signed in");
  localStorage.clear();
  fireEvent(window, new StorageEvent("storage", { key: null, storageArea: localStorage }));
  expect(screen.getByRole("status")).toHaveTextContent("signed out");
});

it("keeps login and logout usable when browser storage is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("blocked"); });
  render(<SessionStatus />);
  act(startPreviewSession);
  expect(screen.getByRole("status")).toHaveTextContent("signed in");
  act(endPreviewSession);
  expect(screen.getByRole("status")).toHaveTextContent("signed out");
});
