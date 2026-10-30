import type { ValidationCase, ValidationProject, SampleRun } from "./model";

// A transparent local authoring aid, not an AI inference or a test execution.
// Keep the user's exact expected behavior; never invent inputs or assertions.
export function draftsFromRules(project: ValidationProject): ValidationCase[] {
  const rules = project.rule
    .split(/(?:\r?\n)+|[.!?。]\s+(?=[^\s])/u)
    .map((rule) =>
      rule
        .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
        .trim()
        .replace(/[.!?。]$/, ""),
    )
    .filter(Boolean);
  return [...new Set(rules)]
    .filter((rule) => !project.cases.some((c) => c.intent === rule))
    .map((rule) => ({
      id: `T-${crypto.randomUUID().slice(0, 6)}`,
      name: rule,
      intent: rule,
      input: "",
      assertions: [],
      ...(project.repository
        ? {
            request: {
              method: project.connection?.entry.split(/\s+/)[0] || "POST",
              path: project.connection?.entry.split(/\s+/).at(-1) || "/",
              body: "{}",
            },
          }
        : {}),
    }));
}

export function unobservedRun(
  project: ValidationProject,
  reason: string,
  source: "preview" | "runner" = "preview",
): SampleRun {
  return {
    id: crypto.randomUUID(),
    label: source === "preview" ? "실행 전 미리보기" : "실행 접수 실패",
    source,
    outcome: "unverified",
    title:
      source === "preview"
        ? "실행 전 비교 미리보기"
        : "검증을 시작하지 못했습니다",
    summary: reason,
    change: "실행 기록 없음",
    diff: "실행 후 수집한 변경 기록이 여기에 표시됩니다.",
    cases: project.cases.map((c) => ({
      caseId: c.id,
      outcome: "unverified",
      baseline: {
        status: "unverified",
        values: {},
        steps: {},
        events: [],
        evidence: reason,
      },
      candidate: {
        status: "unverified",
        values: {},
        steps: {},
        events: [],
        evidence: reason,
      },
      analysis: {
        fact: reason,
        hypothesis: "실행 기록이 없어 원인을 분석할 수 없습니다.",
        next: "실행기를 연결한 뒤 동일한 테스트로 A와 B를 실행하세요.",
      },
    })),
  };
}
