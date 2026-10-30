import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { ThemeProvider } from "next-themes";
import { transitionAppearance } from "@/lib/appearance-transition";

const BlueAccentContext = createContext<{
  blueAccent: boolean;
  setBlueAccent: (enabled: boolean) => void;
} | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [blueAccent, setBlueAccentState] = useState(() => {
    try {
      // Convert the earlier standalone blue theme into dark mode plus the blue accent.
      if (localStorage.getItem("theme") === "hapalin") {
        localStorage.setItem("theme", "dark");
        localStorage.setItem("blue-accent", "true");
      }
      return localStorage.getItem("blue-accent") !== "false";
    } catch {
      return true;
    }
  });
  const setBlueAccent = useCallback((enabled: boolean) => {
    try {
      localStorage.setItem("blue-accent", String(enabled));
    } catch {
      /* Storage can be unavailable. */
    }
    transitionAppearance(() => setBlueAccentState(enabled));
  }, []);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("hapalin");
    if (blueAccent) root.dataset.accent = "blue";
    else delete root.dataset.accent;
  }, [blueAccent]);
  useEffect(() => {
    const syncAccent = (event: StorageEvent) => {
      if (event.key === "blue-accent" || event.key === null)
        transitionAppearance(() => setBlueAccentState(event.newValue !== "false"));
    };
    window.addEventListener("storage", syncAccent);
    return () => window.removeEventListener("storage", syncAccent);
  }, []);
  return (
    <BlueAccentContext.Provider value={{ blueAccent, setBlueAccent }}>
      <ThemeProvider
        attribute="class"
        themes={["light", "dark"]}
        defaultTheme="dark"
        enableColorScheme={false}
        enableSystem
      >
        {children}
      </ThemeProvider>
    </BlueAccentContext.Provider>
  );
}

export function useBlueAccent() {
  const context = useContext(BlueAccentContext);
  if (!context)
    throw new Error("useBlueAccent must be used within AppearanceProvider");
  return context;
}
