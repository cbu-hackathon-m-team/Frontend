import { DashboardHeader } from "@/components/dashboard/header"
import { Skeleton } from "@/components/ui/skeleton"
import { PageOutlineSkeleton } from "./page-outline"
import styles from "../design-system.module.css"

export function DesignSystemPending() {
  return <div className="min-h-0 flex-1 overflow-auto scrollbar-thin bg-surface-canvas">
    <DashboardHeader title="Design System" />
    <div className={styles.page}><div className={styles.docsLayout}>
      <main className={styles.content}>
        <header className={styles.hero}>
          <div className={styles.heroIntro}><h2>Design system</h2><p className="type-body-md-medium text-interface-secondary leading-relaxed">A shared design language for thoughtful, consistent digital experiences.</p></div>
          <div className={styles.heroGallery}>{["Foundations", "Components", "Interaction"].map(title => <div key={title} className={styles.heroTile}><div className={styles.heroFoundation}><Skeleton className="h-14 w-2/3" /><Skeleton className="h-3 w-1/2" /></div><div className={styles.heroTileLabel}><span className="type-heading-xs">{title}</span></div></div>)}</div>
        </header>
        <section className={styles.section}><header className={styles.sectionHeader}><h2 className="type-heading-xl text-interface-contrast">Foundations</h2><p className="type-body-md-medium text-interface-secondary leading-relaxed">Shared visual standards for color, hierarchy, and structure.</p></header><div className={styles.exhibit}><h3 className="type-heading-lg">Color</h3><h4 className="mb-4 type-label-lg">Interface</h4><div className={styles.paletteStrip}>{[0, 1, 2].map(index => <article key={index}><div className={styles.paletteColor}><Skeleton className="h-full w-full" /></div><footer><Skeleton className="h-5 w-28" /><Skeleton className="mt-2 h-4 w-32" /></footer></article>)}</div></div></section>
      </main>
      <PageOutlineSkeleton />
    </div></div>
  </div>
}
