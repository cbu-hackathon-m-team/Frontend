import type { SampleRun, ValidationProject } from "./model";
export interface GuardDraft {
  version: 1;
  definition: ValidationProject;
  confirmed: boolean;
  email: string;
  scenario: string;
  run: number;
  latest?: { definition: ValidationProject; result: SampleRun };
}
export const draftKey = (id: string) => `ossguard.validation-draft.v1.${id}`;
export function initialDraft(project: ValidationProject): GuardDraft {
  return {
    version: 1,
    definition: project,
    confirmed: project.cases.length > 0,
    email: "",
    scenario: project.defaultSample,
    run: project.samples.length ? 1 : 0,
    latest: project.samples.length
      ? {
          definition: project,
          result: project.samples.find((s) => s.id === project.defaultSample)!,
        }
      : undefined,
  };
}
export function readDraft(project: ValidationProject): GuardDraft {
  const raw = localStorage.getItem(draftKey(project.id));
  if (!raw) return initialDraft(project);
  const draft = JSON.parse(raw) as GuardDraft;
  if (
    draft.version !== 1 ||
    draft.definition?.id !== project.id ||
    !Array.isArray(draft.definition.cases) ||
    !Array.isArray(draft.definition.steps) ||
    !Array.isArray(draft.definition.samples) ||
    !draft.definition.target ||
    !draft.definition.baseline ||
    !draft.definition.candidate ||
    typeof draft.definition.rule !== "string" ||
    typeof draft.confirmed !== "boolean" ||
    typeof draft.email !== "string" ||
    typeof draft.scenario !== "string"
  )
    throw new Error("Invalid saved validation draft");
  return {
    ...draft,
    definition: {
      ...draft.definition,
      repository: draft.definition.repository ?? project.repository,
      update: draft.definition.update ?? project.update,
      executionProfile:
        draft.definition.executionProfile ?? project.executionProfile,
    },
  };
}
export function writeDraft(draft: GuardDraft) {
  localStorage.setItem(draftKey(draft.definition.id), JSON.stringify(draft));
}
