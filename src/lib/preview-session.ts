import { useSyncExternalStore } from "react";

// UI state only until real authentication is connected. Never store credentials.
export const PREVIEW_SESSION_KEY = "hapalin.preview-session.v1";
const changeEvent = "hapalin:preview-session-change";
let memorySession: boolean | null = null;

function readSession() {
  if (memorySession !== null) return memorySession;
  try {
    return window.localStorage.getItem(PREVIEW_SESSION_KEY) === "active";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.storageArea === window.localStorage &&
        (event.key === PREVIEW_SESSION_KEY || event.key === null)) {
      memorySession = null;
      onChange();
    }
  };
  window.addEventListener(changeEvent, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function setSession(signedIn: boolean) {
  try {
    if (signedIn) window.localStorage.setItem(PREVIEW_SESSION_KEY, "active");
    else window.localStorage.removeItem(PREVIEW_SESSION_KEY);
    memorySession = null;
  } catch {
    memorySession = signedIn;
  }
  window.dispatchEvent(new Event(changeEvent));
}

export const startPreviewSession = () => setSession(true);
export const endPreviewSession = () => setSession(false);

export function usePreviewSession() {
  return useSyncExternalStore(subscribe, readSession, () => false);
}
