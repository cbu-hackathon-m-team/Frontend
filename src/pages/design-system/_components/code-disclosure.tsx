import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { CodeBlock } from "./code-block"
import styles from "../design-system.module.css"

export function CodeDisclosure({ getCode }: { getCode: () => string }) {
  const [open, setOpen] = useState(false)

  return <details className={styles.codeDisclosure} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className="type-label-md"><ChevronRight aria-hidden="true" /><span className={styles.codeLabel}>Show code</span><span className={styles.codeLabelOpen}>Hide code</span></summary>
    {open && <CodeBlock code={getCode()} />}
  </details>
}
