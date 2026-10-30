import { expect, it } from "vitest";
import { parseUnifiedDiff } from "./unified-diff";

it("tracks the old and new line numbers independently across replacements and hunks", () => {
  const parsed = parseUnifiedDiff("--- a/app.py\n+++ b/app.py\n@@ -10,3 +10,4 @@\n same\n-old\n+new\n+extra\n end\n@@ -50 +51 @@\n-before\n+after\n");
  expect(parsed.additions).toBe(3);
  expect(parsed.deletions).toBe(2);
  expect(parsed.lines.filter((line) => line.kind !== "hunk")).toEqual([
    { kind: "context", text: "same", before: 10, after: 10 },
    { kind: "removed", text: "old", before: 11 },
    { kind: "added", text: "new", after: 11 },
    { kind: "added", text: "extra", after: 12 },
    { kind: "context", text: "end", before: 12, after: 13 },
    { kind: "removed", text: "before", before: 50 },
    { kind: "added", text: "after", after: 51 },
  ]);
});

it("handles new files, CRLF, blank added lines and the missing-newline marker", () => {
  const parsed = parseUnifiedDiff("--- /dev/null\r\n+++ b/new.py\r\n@@ -0,0 +1,3 @@\r\n+first\r\n+\r\n+++content\r\n\\ No newline at end of file\r\n");
  expect(parsed.additions).toBe(3);
  expect(parsed.deletions).toBe(0);
  expect(parsed.lines.slice(1)).toEqual([
    { kind: "added", text: "first", after: 1 },
    { kind: "added", text: "", after: 2 },
    { kind: "added", text: "++content", after: 3 },
    { kind: "meta", text: "\\ No newline at end of file" },
  ]);
});

it("preserves unstructured evidence without inventing line numbers or change counts", () => {
  const parsed = parseUnifiedDiff("Binary files a/a and b/a differ\n@@ invalid @@\n+unknown");
  expect(parsed.hasHunks).toBe(false);
  expect(parsed.additions).toBe(0);
  expect(parsed.lines.every((line) => line.before === undefined && line.after === undefined)).toBe(true);
  expect(parsed.lines.map((line) => line.text).join("\n")).toBe("Binary files a/a and b/a differ\n@@ invalid @@\n+unknown");
  expect(parseUnifiedDiff("").lines).toEqual([]);
});
