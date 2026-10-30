export interface Workspace {
  name: string;
  description: string;
}
export const WORKSPACE_STORAGE_KEY = "hapalin.workspace.v1";
export const defaultWorkspace: Workspace = {
  name: "Hapalin Studio",
  description: "",
};
export function readWorkspace(): Workspace {
  const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (raw === null) return defaultWorkspace;
  const value: unknown = JSON.parse(raw);
  if (
    !value ||
    typeof value !== "object" ||
    !("name" in value) ||
    !("description" in value) ||
    typeof value.name !== "string" ||
    !value.name.trim() ||
    value.name.length > 80 ||
    typeof value.description !== "string" ||
    value.description.length > 500
  )
    throw new Error("Invalid workspace data");
  return { name: value.name, description: value.description };
}
export function writeWorkspace(workspace: Workspace) {
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
}
