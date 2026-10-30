import { expect, it } from "vitest";
import { demoProject } from "./demo-project";
import { compareRecordedSample } from "./comparison";
import { traceDifferences } from "./trace-diff";
it("identifies shipping as the first difference while both HTTP responses remain successful", () => {
  const result = demoProject.samples[0].cases[0];
  expect(traceDifferences(demoProject, result)).toEqual([
    { key: "shipping", reason: "호출 누락" },
  ]);
  expect(result.baseline.values.response).toBe(200);
  expect(result.candidate.values.response).toBe(200);
});
it("does not call unknown observations a missing business step", () => {
  const run = demoProject.samples.find((s) => s.id === "error")!;
  expect(traceDifferences(demoProject, run.cases[0])).toEqual([]);
});
it("honors changed expectations but never reuses recordings for changed input or environment", () => {
  const tests = structuredClone(demoProject.cases);
  tests[0].assertions[2].expected = 0;
  expect(
    compareRecordedSample(demoProject, demoProject.samples[0], tests).cases[0]
      .outcome,
  ).toBe("baseline-failed");
  tests[0].input = "different request";
  expect(
    compareRecordedSample(demoProject, demoProject.samples[0], tests).cases[0]
      .outcome,
  ).toBe("unverified");
  const changed = {
    ...demoProject,
    candidate: { label: "unrecorded version", artifact: "another.json" },
  };
  expect(
    compareRecordedSample(
      changed,
      changed.samples[0],
      changed.cases,
    ).cases.every((c) => c.outcome === "unverified"),
  ).toBe(true);
});
it("detects reordered shared calls without mistaking an omitted call for a reorder", () => {
  const comparison = structuredClone(
    demoProject.samples.find((s) => s.id === "fixed")!.cases[0],
  );
  const events = comparison.candidate.events!;
  [events[1].sequence, events[2].sequence] = [
    events[2].sequence,
    events[1].sequence,
  ];
  expect(
    traceDifferences(demoProject, comparison).map((d) => d.reason),
  ).toContain("호출 순서 변경");
});
