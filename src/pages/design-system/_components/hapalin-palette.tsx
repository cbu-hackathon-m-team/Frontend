import type { CSSProperties } from "react"
import styles from "../design-system.module.css"

const blueScale = [
  [50, "#EEF4FF"], [100, "#E2ECFF"], [200, "#CBDDFF"], [300, "#B2CDFF"],
  [400, "#8FB6FF"], [500, "#79A8FF"], [600, "#5892FF"], [700, "#3B76E5"],
  [800, "#2960C4"], [900, "#224D9D"], [950, "#253D6B"],
] as const

const neutralScale = [[100,"#F7F7F8"],[200,"#EEEEEE"],[300,"#DCDCDC"],[400,"#BEBEBF"],[500,"#A0A1A5"],[600,"#84858A"],[700,"#6B6C70"],[800,"#46474C"],[900,"#323236"],[1000,"#27272A"]] as const

export function HapalinPalette() {
  return <div className={styles.hapalinShowcase}>
    <div className={styles.hapalinFeatures}>
      <article><div className={styles.hapalinSolid}><span>Hapalin<br />Blue</span><span>#79A8FF</span></div><footer><strong className="type-label-md">Solid color</strong><p className="type-code-sm">#79A8FF</p></footer></article>
      <article><div className={styles.hapalinGradient}><span aria-hidden="true">Aa</span></div><footer><strong className="type-label-md">Signature gradient</strong><p className="type-code-sm">#3444F3 → #5B8AFC</p></footer></article>
      <article><div className={styles.hapalinNight}><span aria-hidden="true" /></div><footer><strong className="type-label-md">Night gradient</strong><p className="type-code-sm">#181E4C → #2036AB</p></footer></article>
      <article><div className={styles.hapalinSoft}><span aria-hidden="true">Aa</span></div><footer><strong className="type-label-md">Soft gradient</strong><p className="type-code-sm">#AECAFE → #E1E5FC</p></footer></article>
    </div>
    <div className={styles.hapalinScale}>{blueScale.map(([step, hex]) => <div key={step}><span className={styles.hapalinChip} style={{ "--swatch": `var(--hapalin-${step})` } as CSSProperties} /><strong className="type-label-xs">{step}</strong><code className="type-body-xs">{hex}</code></div>)}</div>
    <div className={styles.hapalinNeutrals}>{neutralScale.map(([step, hex]) => <div key={step}><span className={styles.hapalinChip} style={{ "--swatch": `var(--hapalin-neutral-${step})` } as CSSProperties} /><code className="type-body-xs">{hex}</code></div>)}</div>
  </div>
}
