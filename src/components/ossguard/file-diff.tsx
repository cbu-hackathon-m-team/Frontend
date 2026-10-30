import { useMemo, useState } from "react";
import { ChevronRight, FileCode2 } from "lucide-react";
import { parseUnifiedDiff } from "./unified-diff";
import styles from "./file-diff.module.css";

export function FileDiff({ path, diff, defaultOpen = false }: {
  path: string;
  diff: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const parsed = useMemo(() => parseUnifiedDiff(diff), [diff]);
  return (
    <details className={styles.file} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className={styles.header}>
        <ChevronRight aria-hidden="true" className={styles.chevron} />
        <FileCode2 aria-hidden="true" className={styles.fileIcon} />
        <span className={styles.path}>{path}</span>
        {parsed.hasHunks && (
          <span className={styles.stats} aria-label={`${parsed.additions}줄 추가, ${parsed.deletions}줄 삭제`}>
            <span className={styles.additionCount}>+{parsed.additions}</span>
            <span className={styles.deletionCount}>−{parsed.deletions}</span>
          </span>
        )}
      </summary>
      {parsed.lines.length ? (
        <div className={styles.scroll} role="region" aria-label={`${path} diff`} tabIndex={0}>
          <table className={styles.code} aria-label={`${path} 변경 내용`}>
            <thead className="sr-only">
              <tr><th>이전 줄</th><th>이후 줄</th><th>변경</th><th>코드</th></tr>
            </thead>
            <tbody>
              {parsed.lines.map((line, index) => (
                <tr key={index} data-kind={line.kind}>
                  {line.kind === "hunk" || line.kind === "meta" ? (
                    <td className={styles.metadata} colSpan={4}>{line.text || "\u00a0"}</td>
                  ) : (
                    <>
                      <td className={styles.lineNumber}>{line.before}</td>
                      <td className={styles.lineNumber}>{line.after}</td>
                      <td className={styles.sign} aria-label={line.kind === "added" ? "추가" : line.kind === "removed" ? "삭제" : undefined}>
                        {line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "}
                      </td>
                      <td className={styles.content}>{line.text || "\u00a0"}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className={styles.empty}>수집된 파일 diff가 없습니다.</p>}
    </details>
  );
}
