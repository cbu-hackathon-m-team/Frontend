export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const PROJECTS_STORAGE_KEY = "hapalin.projects.v1";

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const project = value as Record<string, unknown>;
  return (
    typeof project.id === "string" &&
    project.id.length > 0 &&
    typeof project.name === "string" &&
    project.name.trim().length > 0 &&
    project.name.length <= 80 &&
    typeof project.description === "string" &&
    project.description.length <= 500 &&
    typeof project.createdAt === "string" &&
    Number.isFinite(Date.parse(project.createdAt)) &&
    typeof project.updatedAt === "string" &&
    Number.isFinite(Date.parse(project.updatedAt))
  );
}

export function readProjects(): Project[] {
  const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (raw === null) return [];
  const projects: unknown = JSON.parse(raw);
  if (
    !Array.isArray(projects) ||
    !projects.every(isProject) ||
    new Set(projects.map((project) => project.id)).size !== projects.length
  ) {
    throw new Error("Invalid project data");
  }
  return projects;
}

export function writeProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}
