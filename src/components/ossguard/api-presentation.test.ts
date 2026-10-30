import { expect, it } from "vitest";
import { apiProject, apiRun, apiEvidence } from "./api-fixture.test-support";
import { runPresentation } from "./api-presentation";
import { assertionPass } from "./model";
import { traceDifferences } from "./trace-diff";

it("maps real checks, installed versions and a missing call while both responses are 200", () => {
  const { definition, result } = runPresentation(
    apiProject,
    apiRun,
    apiEvidence,
  );
  expect(result.cases[0].outcome).toBe("regression");
  expect(result.cases[0].baseline.values["check-0"]).toBe(200);
  expect(result.cases[0].candidate.values["check-0"]).toBe(200);
  expect(result.cases[0].candidate.values["check-2"]).toBe(0);
  expect(result.execution?.installedB).toBe("2.12.5");
  expect(traceDifferences(definition, result.cases[0])[0].key).toBe(
    "external:POST:/shipping",
  );
});
it("uses the immutable snapshot instead of later edited project configuration", () => {
  const changed = {
    ...apiProject,
    repository_url: "https://github.com/team/other",
    commit_sha: "b".repeat(40),
    test_suites: [{ ...apiRun.snapshot.suite, cases: [] }],
  };
  const { definition } = runPresentation(changed, apiRun, apiEvidence);
  expect(definition.repository?.url).toBe(apiRun.snapshot.repository_url);
  expect(definition.repository?.sha).toBe(apiRun.snapshot.commit_sha);
  expect(definition.cases[0].assertions[1].expected).toBe(8);
});
it("does not invent zero calls when a result is missing or truncated", () => {
  for (const rows of [
    apiEvidence.test_results.slice(0, 1),
    [
      apiEvidence.test_results[0],
      { case_id: "T01", environment: "candidate" as const, truncated: true },
    ],
  ]) {
    const { result } = runPresentation(
      apiProject,
      { ...apiRun, verdict: "NOT_EVALUATED" },
      { ...apiEvidence, test_results: rows },
    );
    expect(result.cases[0].candidate.values["check-2"]).toBeUndefined();
    expect(result.cases[0].candidate.steps["external:POST:/shipping"]).toBe(
      "unknown",
    );
    expect(result.cases[0].outcome).toBe("unverified");
  }
});
it("honors gte and authoritative backend checks instead of equality alone", () => {
  const assertion = {
    key: "value",
    label: "재고",
    expected: 8,
    operator: "gte" as const,
  };
  expect(assertionPass(assertion, 10)).toBe(true);
  expect(assertionPass(assertion, 10, false)).toBe(false);
  expect(assertionPass(assertion, undefined)).toBe(false);
});
it("opens actual build failures at their failed phase without a fabricated candidate version", () => {
  const evidence = {
    ...apiEvidence.evidence,
    last_execution_phase: "candidate_build",
    candidate: {},
    failure_log: {
      text: "build failed",
      truncated: true,
      retained_bytes: 12,
      original_bytes: 100,
    },
  };
  const { result } = runPresentation(
    apiProject,
    {
      ...apiRun,
      execution_status: "FAILED",
      verdict: "NOT_EVALUATED",
      error_code: "BUILD_ERROR",
      error_message: "candidate failed",
    },
    { evidence, test_results: apiEvidence.test_results.slice(0, 1) },
  );
  expect(
    result.execution?.stages.find((s) => s.id === "candidate_build")?.state,
  ).toBe("failed");
  expect(
    result.execution?.stages.find((s) => s.id === "candidate_build")?.detail,
  ).toContain("일부 보관");
  expect(result.execution?.installedB).toBeUndefined();
  expect(result.cases[0].outcome).toBe("unverified");
});
it("does not call an invalid baseline a candidate regression", () => {
  const rows = [{ ...apiEvidence.test_results[0], passed: false }];
  const { result } = runPresentation(
    apiProject,
    { ...apiRun, verdict: "BASELINE_INVALID" },
    { ...apiEvidence, test_results: rows },
  );
  expect(result.cases[0].outcome).toBe("baseline-failed");
  expect(result.cases[0].candidate.events).toBeUndefined();
});
