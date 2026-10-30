import { flushSync } from "react-dom";

let activeTransition: ViewTransition | undefined;
let transitionId = 0;

export function transitionAppearance(change: () => void) {
  const root = document.documentElement;
  const id = ++transitionId;
  activeTransition?.skipTransition();
  activeTransition = undefined;
  const commit = () => {
    // A skipped capture can still invoke its callback after a newer selection.
    if (id !== transitionId) return;
    flushSync(change);
  };
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !document.startViewTransition
  ) {
    root.removeAttribute("data-appearance-transition");
    root.removeAttribute("data-appearance-capture");
    commit();
    return;
  }

  root.setAttribute("data-appearance-transition", "");
  const transition = document.startViewTransition(() => {
    if (id !== transitionId) return;
    root.setAttribute("data-appearance-capture", "");
    commit();
  });
  activeTransition = transition;
  const cleanup = () => {
    if (id !== transitionId) return;
    activeTransition = undefined;
    root.removeAttribute("data-appearance-transition");
    root.removeAttribute("data-appearance-capture");
  };
  // A skipped/hidden-document capture still commits; its rejected ready promise is expected.
  const releaseCapture = () => {
    if (id === transitionId) root.removeAttribute("data-appearance-capture");
  };
  void transition.ready.then(releaseCapture, releaseCapture);
  void transition.finished.then(cleanup, cleanup);
}
