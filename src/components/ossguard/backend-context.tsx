import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, GuardApi, errorText, type ApiProject } from "./api";

const tokenKey = "ossguard.api-session";
function sessionToken() {
  try {
    return sessionStorage.getItem(tokenKey) || "";
  } catch {
    return "";
  }
}
interface BackendState {
  api: GuardApi | null;
  projects: ApiProject[];
  loading: boolean;
  error: string;
  connect: (token: string) => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
}
const BackendContext = createContext<BackendState | null>(null);
export function BackendProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(sessionToken);
  const api = useMemo(() => (token ? new GuardApi(token) : null), [token]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState("");
  const disconnect = useCallback(() => {
    try {
      sessionStorage.removeItem(tokenKey);
    } catch {
      /* The in-memory session still closes. */
    }
    setToken("");
    setProjects([]);
    setError("");
    setLoading(false);
  }, []);
  const refresh = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      setProjects(await api.projects());
      setError("");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) disconnect();
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, [api, disconnect]);
  useEffect(() => {
    if (!api) return;
    const controller = new AbortController();
    api
      .projects(controller.signal)
      .then((rows) => {
        setProjects(rows);
        setError("");
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          if (e instanceof ApiError && e.status === 401) disconnect();
          setError(errorText(e));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [api, disconnect]);
  async function connect(value: string) {
    setLoading(true);
    setError("");
    try {
      const rows = await new GuardApi(value.trim()).projects();
      try {
        sessionStorage.setItem(tokenKey, value.trim());
      } catch {
        /* Remains available in memory. */
      }
      setProjects(rows);
      setToken(value.trim());
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }
  return (
    <BackendContext.Provider
      value={{ api, projects, loading, error, connect, disconnect, refresh }}
    >
      {children}
    </BackendContext.Provider>
  );
}
export function useBackend() {
  const value = useContext(BackendContext);
  if (!value) throw new Error("BackendProvider is required");
  return value;
}
