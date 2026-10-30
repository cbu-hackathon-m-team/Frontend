import { useTheme } from "next-themes"
import { Highlight, themes } from "prism-react-renderer"
import styles from "../design-system.module.css"

export default function CodeHighlight({ source }: { source: string }) {
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme !== "dark"
  return (<Highlight theme={isLight ? themes.github : themes.vsDark} code={source} language="tsx">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          // eslint-disable-next-line shadcn/no-inline-styles -- Prism supplies the syntax theme; the code box owns its background.
          <pre className={className} style={{ ...style, backgroundColor: "transparent" }} tabIndex={0}>
            <code>
              {tokens.map((line, index) => (
                <span key={index} {...getLineProps({ line })} className={styles.codeLine}>
                  <span className={styles.lineNumber} aria-hidden="true">{index + 1}</span>
                  <span className={styles.lineContent}>
                    {line.map((token, tokenIndex) => (
                      <span key={tokenIndex} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>);
}
