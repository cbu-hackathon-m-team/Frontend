import { useEffect, useRef, useState, type RefObject } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { componentCatalog } from "../_data/catalog"
import styles from "../design-system.module.css"

type OutlineItem = { id: string; title: string; children?: OutlineItem[] }

const outline: OutlineItem[] = [
  { id: "foundations", title: "Foundations", children: [
    { id: "hapalin-blue", title: "Hapalin Blue" },
    { id: "color", title: "Color", children: [{ id: "surface", title: "Surface" }] },
    { id: "typography", title: "Typography" },
    { id: "spacing", title: "Spacing & sizing" },
    { id: "layout", title: "Layout" },
    { id: "materials", title: "Materials", children: [
      { id: "shape", title: "Shape" },
      { id: "boundary", title: "Boundary" },
      { id: "elevation", title: "Elevation" },
    ] },
  ] },
  { id: "components", title: "Components", children: componentCatalog.map(([id, title]) => ({ id, title })) },
  { id: "behavior", title: "Behavior", children: [
    { id: "interaction", title: "Interaction state" },
    { id: "motion", title: "Motion" },
    { id: "behavior-rules", title: "Usage rules" },
  ] },
]

function flatten(items: OutlineItem[], level = 1, parentId = ""): (OutlineItem & { level: number; outlineId: string })[] {
  return items.flatMap(item => {
    const outlineId = level <= 2 ? item.id : parentId
    return [{ ...item, level, outlineId }, ...flatten(item.children ?? [], level + 1, outlineId)]
  })
}

const targets = flatten(outline)
const visibleTargets = targets.filter(item => item.level <= 2)

export function PageOutlineSkeleton() {
  return <aside className={styles.pageRail} aria-hidden="true">
    <div>
      <h2 className={`type-body-md ${styles.outlineHeading}`}>On this page</h2>
      <ul className={styles.outlineScroll}>
        {visibleTargets.map(item => <li key={item.id} data-level={item.level}>
          <span className="relative block min-w-0 max-w-full type-body-md">
            <span className="invisible block truncate">{item.title}</span>
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2"><Skeleton className="h-3 w-full" /></span>
          </span>
        </li>)}
      </ul>
    </div>
  </aside>
}

export function PageOutline({ scrollRootRef }: { scrollRootRef: RefObject<HTMLDivElement | null> }) {
  const [activeId, setActiveId] = useState("foundations")
  const railScrollRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const root = scrollRootRef.current
    const content = root?.querySelector("#system-content")
    if (!root || !content) return

    let frame = 0
    let initialTarget = window.location.hash.slice(1)
    const update = () => {
      frame = 0
      if (initialTarget) {
        const target = targets.some(item => item.id === initialTarget) ? content.querySelector(`#${initialTarget}`) : null
        if (target) {
          root.scrollTo({ top: root.scrollTop + target.getBoundingClientRect().top - root.getBoundingClientRect().top - 80, behavior: "instant" })
          initialTarget = ""
        }
      }
      const threshold = root.getBoundingClientRect().top + 128
      let current = "foundations"
      for (const item of targets) {
        const element = content.querySelector(`#${item.id}`)
        if (element && element.getBoundingClientRect().top <= threshold) current = item.outlineId
      }
      if (root.scrollTop > 0 && root.scrollTop + root.clientHeight >= root.scrollHeight - 2) current = targets.at(-1)!.id
      setActiveId(current)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const mutations = new MutationObserver(schedule)
    const resize = new ResizeObserver(schedule)
    mutations.observe(content, { childList: true, subtree: true })
    resize.observe(content)
    root.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      mutations.disconnect()
      resize.disconnect()
      root.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [scrollRootRef])

  useEffect(() => {
    const rail = railScrollRef.current
    const link = rail?.querySelector('[aria-current="location"]')
    if (!rail || !link || rail.clientHeight === 0) return
    const bounds = rail.getBoundingClientRect()
    const item = link.getBoundingClientRect()
    if (item.top < bounds.top) rail.scrollTop += item.top - bounds.top
    else if (item.bottom > bounds.bottom) rail.scrollTop += item.bottom - bounds.bottom
  }, [activeId])

  return <aside className={styles.pageRail}>
    <nav aria-labelledby="page-outline-heading">
      <h2 id="page-outline-heading" className={`type-body-md ${styles.outlineHeading}`}>On this page</h2>
      <ul ref={railScrollRef} className={styles.outlineScroll}>
        {visibleTargets.map(item => <li key={item.id} data-level={item.level}>
          <a href={`#${item.id}`} title={item.title} className={activeId === item.id ? "type-body-md-medium" : "type-body-md"} aria-current={activeId === item.id ? "location" : undefined}>{item.title}</a>
        </li>)}
      </ul>
    </nav>
  </aside>
}
