import { afterEach, expect, it, vi } from "vitest";
import { createElement, useLayoutEffect, useState } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { transitionAppearance } from "./appearance-transition";

const originalTransition = document.startViewTransition;
function capture(update: () => void) {
  let finish!: () => void;
  const finished = new Promise<void>((resolve) => { finish = resolve; });
  return {
    update,
    finish,
    transition: {
      ready: Promise.resolve(),
      finished,
      updateCallbackDone: Promise.resolve(),
      skipTransition: vi.fn(finish),
      types: new Set<string>(),
    },
  };
}
function motion(reduced = false) {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: reduced })));
}
afterEach(async () => {
  motion(true);
  transitionAppearance(() => {});
  await Promise.resolve();
  cleanup();
  document.startViewTransition = originalTransition;
  vi.unstubAllGlobals();
});

it("commits immediately without View Transition support", () => {
  motion();
  document.startViewTransition = undefined!;
  let change = () => {};
  function Palette() {
    const [mode, setMode] = useState("dark");
    useLayoutEffect(() => { change = () => setMode("light"); }, []);
    return createElement("output", { "aria-label": "palette" }, mode);
  }
  render(createElement(Palette));
  act(() => {
    transitionAppearance(change);
    expect(screen.getByLabelText("palette")).toHaveTextContent("light");
  });
  expect(document.documentElement).not.toHaveAttribute("data-appearance-transition");
});

it("captures a complete palette and cleans up after the browser finishes", async () => {
  motion();
  const captures: ReturnType<typeof capture>[] = [];
  document.startViewTransition = vi.fn((update: () => void) => {
    const next = capture(update);
    captures.push(next);
    return next.transition;
  }) as unknown as Document["startViewTransition"];
  const change = vi.fn();
  transitionAppearance(change);
  expect(change).not.toHaveBeenCalled();
  expect(document.documentElement).toHaveAttribute("data-appearance-transition");
  captures[0].update();
  expect(change).toHaveBeenCalledOnce();
  expect(document.documentElement).toHaveAttribute("data-appearance-capture");
  await Promise.resolve();
  expect(document.documentElement).not.toHaveAttribute("data-appearance-capture");
  expect(document.documentElement).toHaveAttribute("data-appearance-transition");
  captures[0].finish();
  await Promise.resolve();
  expect(document.documentElement).not.toHaveAttribute("data-appearance-transition");
});

it("skips earlier captures and rejects their stale updates during rapid selections", async () => {
  motion();
  const captures: ReturnType<typeof capture>[] = [];
  document.startViewTransition = vi.fn((update: () => void) => {
    const next = capture(update);
    captures.push(next);
    return next.transition;
  }) as unknown as Document["startViewTransition"];
  const previous = vi.fn(), latest = vi.fn();
  transitionAppearance(previous);
  transitionAppearance(latest);
  expect(captures[0].transition.skipTransition).toHaveBeenCalledOnce();
  captures[0].update();
  await Promise.resolve();
  expect(previous).not.toHaveBeenCalled();
  expect(document.documentElement).toHaveAttribute("data-appearance-transition");
  captures[1].update();
  expect(latest).toHaveBeenCalledOnce();
  captures[1].finish();
  await Promise.resolve();
  expect(document.documentElement).not.toHaveAttribute("data-appearance-transition");
});

it("applies reduced motion immediately and invalidates a pending capture", async () => {
  motion();
  const pending = capture(vi.fn());
  document.startViewTransition = vi.fn((update: () => void) => {
    pending.update = update;
    return pending.transition;
  }) as unknown as Document["startViewTransition"];
  const previous = vi.fn(), latest = vi.fn();
  transitionAppearance(previous);
  motion(true);
  transitionAppearance(latest);
  pending.update();
  await Promise.resolve();
  expect(previous).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledOnce();
  expect(document.startViewTransition).toHaveBeenCalledOnce();
  expect(document.documentElement).not.toHaveAttribute("data-appearance-transition");
});
