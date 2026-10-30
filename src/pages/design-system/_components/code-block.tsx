import { lazy, Suspense, useState } from "react"
import { Check, Copy } from "lucide-react"

const CodeHighlight = lazy(() => import("./code-highlight"))

import { Button } from "@/components/ui/button"
import styles from "../design-system.module.css"

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const source = code.trim()

  async function copy() {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={styles.codeBlock}>
      <Button
        className={styles.codeCopy /* eslint-disable-line shadcn/require-static-classes -- Static CSS module class; the plugin cannot resolve it. */}
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={copy}
        aria-label={copied ? "Code copied" : "Copy code"}
        title={copied ? "Copied" : "Copy code"}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </Button>
      <Suspense fallback={<pre tabIndex={0}><code>{source}</code></pre>}><CodeHighlight source={source} /></Suspense>
    </div>
  )
}
