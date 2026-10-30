export interface DiffLine {
  kind: "context" | "added" | "removed" | "hunk" | "meta";
  text: string;
  before?: number;
  after?: number;
}

export function parseUnifiedDiff(source: string) {
  const lines: DiffLine[] = [];
  let before = 0, after = 0, additions = 0, deletions = 0, hasHunks = false;
  const raw = source.split(/\r?\n/);
  if (raw[raw.length - 1] === "") raw.pop();
  for (const text of raw) {
    const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(text);
    if (hunk) {
      before = Number(hunk[1]);
      after = Number(hunk[2]);
      hasHunks = true;
      lines.push({ kind: "hunk", text });
    } else if (hasHunks && text.startsWith("+")) {
      additions++;
      lines.push({ kind: "added", text: text.slice(1), after: after++ });
    } else if (hasHunks && text.startsWith("-")) {
      deletions++;
      lines.push({ kind: "removed", text: text.slice(1), before: before++ });
    } else if (hasHunks && text.startsWith(" ")) {
      lines.push({ kind: "context", text: text.slice(1), before: before++, after: after++ });
    } else if (!hasHunks && /^(diff --git |index |--- |\+\+\+ )/.test(text)) {
      continue;
    } else {
      lines.push({ kind: "meta", text });
    }
  }
  return { lines, additions, deletions, hasHunks };
}
