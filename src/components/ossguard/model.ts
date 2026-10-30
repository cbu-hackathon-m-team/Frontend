// Presentation contract for normalized validation data. Tool-specific execution
// belongs to backend adapters; this model does not claim to implement a runner.
export type Outcome =
  | "passed"
  | "regression"
  | "baseline-failed"
  | "unverified";
export type StepState = "completed" | "missing" | "skipped" | "unknown";
export type Value = string | number | boolean | null;
export interface TraceEvent {
  stepKey: string;
  sequence: number;
  operation: string;
  data: Record<string, Value>;
}
export interface Observation {
  status: "passed" | "failed" | "unverified";
  values: Record<string, Value>;
  steps: Record<string, StepState>;
  evidence: string;
  events?: TraceEvent[];
  checks?: Record<string, boolean>;
}
export interface ValidationCase {
  id: string;
  name: string;
  input: string;
  intent?: string;
  request?: { method: string; path: string; body: string };
  assertions: {
    key: string;
    label: string;
    expected: Value;
    unit?: string;
    editable?: boolean;
    stepKey?: string;
    operator?: "eq" | "gte";
  }[];
}
export interface CaseComparison {
  caseId: string;
  outcome: Outcome;
  baseline: Observation;
  candidate: Observation;
  analysis: { fact: string; hypothesis: string; next: string };
}
export interface SampleRun {
  id: string;
  label: string;
  title: string;
  summary: string;
  outcome: Outcome;
  change: string;
  diff: string;
  cases: CaseComparison[];
  source?: "preview" | "runner";
  awaitingResults?: boolean;
  status?: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "INTERRUPTED";
  createdAt?: string;
  control?: boolean;
  execution?: {
    kind: "example" | "observed";
    stages: {
      id: string;
      label: string;
      state: "done" | "failed" | "pending" | "running";
      detail: string;
    }[];
    installedA?: string;
    installedB?: string;
    files: { path: string; diff: string }[];
    packages: {
      name: string;
      before: string;
      after: string;
      direct: boolean;
    }[];
    cleanup: string;
    ai: string;
    email: string;
  };
}
export function assertionPass(
  assertion: ValidationCase["assertions"][number],
  value: Value | undefined,
  recorded?: boolean,
) {
  if (recorded !== undefined) return recorded;
  if (value === undefined) return false;
  return assertion.operator === "gte"
    ? typeof value === "number" &&
        typeof assertion.expected === "number" &&
        value >= assertion.expected
    : value === assertion.expected;
}
export interface ValidationProject {
  id: string;
  name: string;
  description: string;
  target: { id: string; name: string; source: string; adapter: string };
  baseline: { label: string; artifact: string };
  candidate: { label: string; artifact: string };
  rule: string;
  steps: { key: string; label: string }[];
  cases: ValidationCase[];
  samples: SampleRun[];
  defaultSample: string;
  repository?: {
    url: string;
    ref: string;
    sha?: string;
    inspection?: "unchecked" | "verified" | "unavailable";
  };
  update?: {
    ecosystem: string;
    packageName: string;
    declared: string;
    locked: string;
    targetVersion: string;
  };
  executionProfile?: {
    dockerfile: string;
    port: number;
    healthPath: string;
    variables: {
      name: string;
      kind: "plain" | "secret-ref" | "mock";
      value: string;
      required: boolean;
    }[];
  };
  recordedInputs?: Record<string, string>;
  recordedRequests?: Record<string, string>;
  recordingContext?: string;
  connection?: {
    entry: string;
    dependencies: { name: string; endpoint: string }[];
  };
}
export function executionContext(project: ValidationProject) {
  return JSON.stringify({
    target: project.target.name,
    baseline: project.baseline,
    candidate: project.candidate,
    connection: project.connection,
    repository: project.repository,
    update: project.update,
    executionProfile: project.executionProfile,
  });
}
export const outcomeLabel: Record<Outcome, string> = {
  passed: "전체 통과",
  regression: "회귀 의심",
  "baseline-failed": "기준 확인 필요",
  unverified: "미검증",
};
export function runCounts(run: SampleRun) {
  return {
    passed: run.cases.filter((c) => c.outcome === "passed").length,
    attention: run.cases.filter(
      (c) => c.outcome === "regression" || c.outcome === "baseline-failed",
    ).length,
    unverified: run.cases.filter((c) => c.outcome === "unverified").length,
  };
}
export function displayValue(value: Value | undefined, unit = "") {
  return value === undefined
    ? "—"
    : value === null
      ? "null"
      : `${String(value)}${unit}`;
}
export function projectHref(projectId: string, tab = "overview") {
  return `/dashboard?${new URLSearchParams({ project: projectId, tab })}`;
}
