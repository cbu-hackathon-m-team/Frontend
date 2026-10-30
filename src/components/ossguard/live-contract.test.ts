import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { runPresentation } from "./api-presentation";
import type { ApiProject, ApiRun, RunEvidence } from "./api";

// Opt-in: use a locally captured API response, never a fabricated successful run.
const file = process.env.OSSGUARD_CONTRACT_FILE;
it.skipIf(!file)("maps captured backend execution evidence through the production frontend adapter", () => {
  const { project, run, evidence } = JSON.parse(readFileSync(file!, "utf8")) as {
    project: ApiProject; run: ApiRun; evidence: RunEvidence;
  };
  const { definition, result } = runPresentation(project, run, evidence);
  expect(result.id).toBe(run.id);
  expect(result.source).toBe("runner");
  expect(definition.repository?.sha).toBe(run.snapshot.commit_sha);
  expect(result.cases).toHaveLength(run.snapshot.suite.cases.length);
  for (const pair of result.cases) {
    for (const environment of ["baseline", "candidate"] as const) {
      const actual = evidence.test_results.find(row => row.case_id === pair.caseId && row.environment === environment);
      if (actual && !actual.truncated && !actual.request_error) {
        expect(pair[environment].status).toBe(actual.passed ? "passed" : "failed");
        expect(pair[environment].values["check-0"]).toBe(actual.status_code);
      }
    }
  }
  if (run.verdict === "REGRESSION_SUSPECTED") expect(result.cases.some(c => c.outcome === "regression")).toBe(true);
});
