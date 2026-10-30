import { componentCatalog } from "../_data/catalog"
import { specimenSource } from "../_lib/specimen-source"
import styles from "../design-system.module.css"
import * as core from "./core-specimens"
import * as extended from "./extended-specimens"
import coreSource from "./core-specimens.tsx?raw"
import extendedSource from "./extended-specimens.tsx?raw"
import { CodeDisclosure } from "./code-disclosure"

const specimens = { ...core, ...extended }
export default function ComponentExamples() {
  return <div className={styles.componentList}>
    {componentCatalog.map(([id, title, name]) => {
      const Specimen = specimens[name]
      return <article key={id} id={id} className={styles.componentExhibit}>
        <header className={styles.componentHeader}>
          <h3 className="type-heading-lg">{title}</h3>
        </header>
        <div className={styles.componentFrame}>
          <div className={styles.componentPreview}><Specimen /></div>
          <CodeDisclosure getCode={() => specimenSource(name in core ? coreSource : extendedSource, name)} />
        </div>
      </article>
    })}
  </div>
}
