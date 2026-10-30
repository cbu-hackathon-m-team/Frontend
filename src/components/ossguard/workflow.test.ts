import { afterEach, expect, it, vi } from "vitest";
import { draftsFromRules, unobservedRun } from "./workflow";
import { demoProject } from "./demo-project";

afterEach(() => vi.unstubAllGlobals());
it("creates one draft per distinct rule, preserving user text without inventing execution inputs", () => {
  const p = {
    ...demoProject,
    rule: "検索後に文書が見つかる\n削除した文書が見つからない\n検索後に文書が見つかる",
    cases: [],
  };
  const drafts = draftsFromRules(p);
  expect(drafts).toHaveLength(2);
  expect(drafts[0].intent).toBe("検索後に文書が見つかる");
  expect(drafts.every((c) => c.input === "" && !c.assertions.length)).toBe(
    true,
  );
  expect(draftsFromRules({ ...p, cases: drafts })).toHaveLength(0);
});
it("leaves every observation unverified in a preview", () => {
  const result = unobservedRun(demoProject, "not executed");
  expect(result.source).toBe("preview");
  expect(
    result.cases.every(
      (c) =>
        c.outcome === "unverified" &&
        !c.baseline.events?.length &&
        !c.candidate.events?.length,
    ),
  ).toBe(true);
});
