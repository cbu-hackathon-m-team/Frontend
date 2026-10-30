import { lazy, Suspense, useRef, type MouseEvent, type ReactNode } from "react"
import { ArrowUpRight, Check, LayoutGrid, MousePointer2 } from "lucide-react"

import { DashboardHeader } from "@/components/dashboard/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  behaviorRows,
  boundaryTokens,
  colorPalettes,
  controlTokens,
  depthTokens,
  iconTokens,
  motionTokens,
  shapeTokens,
  spacingTokens,
  surfaceTokens,
  textColorTokens,
  typeTokens,
} from "./_data/system"
import styles from "./design-system.module.css"
import { PageOutline } from "./_components/page-outline"
import { HapalinPalette } from "./_components/hapalin-palette"
import { InteractionStates } from "./_components/interaction-states"

const ComponentExamples = lazy(() => import("./_components/component-examples"))

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className={styles.sectionHeader}>
      <h2 className="type-heading-xl text-interface-contrast">{title}</h2>
      <p className="type-body-md-medium text-interface-secondary leading-relaxed">{description}</p>
    </header>
  )
}

function Exhibit({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div id={id} className={styles.exhibit}>
      <h3 className="type-heading-lg">{title}</h3>
      {children}
    </div>
  )
}

function SubExhibit({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} className={styles.subExhibit}><h4 className="type-label-lg">{title}</h4>{children}</section>
}

function TokenGroup({
  tokens,
}: {
  tokens: readonly { name: string; value: string; use: string }[]
}) {
  return (
    <section className={styles.tokenGroup}>
      <div className={styles.layoutMetrics}>
        <Table className={styles.referenceTable}>
          <TableHeader><TableRow><TableHead>Role</TableHead><TableHead>Value</TableHead><TableHead>Preview</TableHead><TableHead>Use</TableHead></TableRow></TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.name}>
                <TableCell className={styles.referenceRole}>{token.name}</TableCell>
                <TableCell><code className={styles.referenceValue}>{token.value}</code></TableCell>
                <TableCell><span className={styles.boundaryPreview} aria-hidden="true" style={{ borderColor: `var(--${token.value.split(" · ")[1]})` }} /></TableCell>
                <TableCell>{token.use}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

export default function DesignSystemPage() {
  const scrollRootRef = useRef<HTMLDivElement>(null)
  function navigateHero(event: MouseEvent<HTMLAnchorElement>) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    const target = scrollRootRef.current?.querySelector<HTMLElement>(event.currentTarget.hash)
    if (!target) return
    event.preventDefault()
    target.scrollIntoView({ block: "start" })
  }
  return (
    <>
      <div ref={scrollRootRef} className="min-h-0 flex-1 overflow-auto [contain:layout] scrollbar-thin scroll-smooth bg-surface-canvas">
        <DashboardHeader title="Design System" />
        <div className={styles.page}>
          <a className={styles.skipLink} href="#system-content">Skip to content</a>

          <div className={styles.docsLayout}>
            <main id="system-content" tabIndex={-1} className={styles.content}>
              <header className={styles.hero}>
                <div className={styles.heroIntro}>
                  <h2>Design system</h2>
                  <p className="type-body-md-medium text-interface-secondary leading-relaxed">A shared design language for thoughtful, consistent digital experiences.</p>
                </div>
                <nav className={styles.heroGallery} aria-label="Explore the design system">
                  <a className={`focus-control ${styles.heroTile}`} href="#foundations" onClick={navigateHero}>
                    <div className={styles.heroFoundation} aria-hidden="true">
                      <span className={styles.heroLetters}>Aa<span>012</span></span>
                      <div className={styles.heroSwatches}>
                        {["--foreground", "--interface-secondary", "--keyboard-focus", "--signal-success", "--plot-gold"].map(color => <span key={color} style={{ background: `var(${color})` }} />)}
                      </div>
                    </div>
                    <span className={styles.heroTileLabel}><span className="type-heading-xs">Foundations</span><ArrowUpRight aria-hidden="true" /></span>
                  </a>
                  <a className={`focus-control ${styles.heroTile}`} href="#components" onClick={navigateHero}>
                    <div className={styles.heroComponents} aria-hidden="true">
                      <div className={styles.heroComponentRow}><Badge variant="secondary">Preview</Badge><span className={styles.heroAvatar}>T</span></div>
                      <div className={styles.heroComponentRow}><Button asChild size="sm"><span><Check />Continue</span></Button><span className={styles.heroMiniInput}>Workspace</span></div>
                      <div className={styles.heroComponentRow}><span className={styles.heroMiniChart}>{[32, 55, 40, 75, 60, 90, 72].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</span></div>
                    </div>
                    <span className={styles.heroTileLabel}><span className="type-heading-xs">Components</span><ArrowUpRight aria-hidden="true" /></span>
                  </a>
                  <a className={`focus-control ${styles.heroTile}`} href="#interaction" onClick={navigateHero}>
                    <div className={styles.heroInteraction} aria-hidden="true">
                      <span className={styles.heroStateBack} />
                      <span className={styles.heroStateFront}><LayoutGrid /><span /><Check /></span>
                      <MousePointer2 className={styles.heroPointer} />
                    </div>
                    <span className={styles.heroTileLabel}><span className="type-heading-xs">Interaction</span><ArrowUpRight aria-hidden="true" /></span>
                  </a>
                </nav>
              </header>

              <section id="foundations" className={styles.section}>
                <SectionHeader title="Foundations" description="Shared visual standards for color, hierarchy, and structure." />
                <Exhibit id="hapalin-blue" title="Hapalin Blue"><HapalinPalette /></Exhibit>
                <Exhibit id="color" title="Color">
                  <div className={styles.paletteFamilies}>
                    {colorPalettes.map((palette) => (
                      <section key={palette.name} className={styles.paletteFamily}>
                        <h4 className="type-label-lg">{palette.name}</h4>
                        <div className={styles.paletteStrip}>
                          {palette.colors.map((color) => (
                            <article key={`${palette.name}-${color.name}`}>
                              <div aria-hidden="true" className={styles.paletteColor} style={{ background: color.color }} />
                              <footer><strong className="type-heading-xs">{color.name}</strong><code className={styles.referenceValue}>{color.value}</code></footer>
                            </article>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                  <SubExhibit id="surface" title="Surface">
                    <div className={styles.surfaceGrid}>
                      {surfaceTokens.map((token) => (
                        <article key={token.name} className={styles.surfaceCard}>
                          <div aria-hidden="true" style={{ background: token.color }} />
                          <footer>
                            <strong className="type-heading-xs">{token.name}</strong>
                            <code className={styles.referenceValue}>{token.value.split(" · ")[0]}</code>
                            <small className={styles.referenceValue}>{token.value.split(" · ")[1]}</small>
                          </footer>
                        </article>
                      ))}
                    </div>
                  </SubExhibit>
                </Exhibit>
                <Exhibit id="typography" title="Typography">
                  <div className={styles.typeList}>
                    <Table className={`${styles.referenceTable} ${styles.typeTable}`}>
                      <TableHeader><TableRow><TableHead>Style</TableHead><TableHead>Token</TableHead><TableHead>Value</TableHead><TableHead>Preview</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {typeTokens.map((token) => (
                          <TableRow key={token.name}>
                            <TableCell className={styles.referenceRole} title={token.className}>{token.name}</TableCell>
                            <TableCell><code className={styles.referenceValue}>{token.className}</code></TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <code className={styles.referenceValue}>{token.value}</code>
                                {token.responsive.map((item) => <code key={item.query} className={styles.referenceValue}>{item.query}: {item.value}</code>)}
                              </div>
                            </TableCell>
                            <TableCell><span className={token.previewClassName}>{token.sample}</span></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <SubExhibit id="text-color" title="Text color">
                    <div className={styles.typeList}>
                      <Table className={styles.referenceTable}>
                        <TableHeader><TableRow><TableHead>Color</TableHead><TableHead>Token</TableHead><TableHead>Light / Dark / Blue light / Blue dark</TableHead><TableHead>Preview</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {textColorTokens.map((token) => (
                            <TableRow key={token.className}>
                              <TableCell className={styles.referenceRole}>{token.name}</TableCell>
                              <TableCell><code className={styles.referenceValue}>{token.className}</code></TableCell>
                              <TableCell><div><code className={styles.referenceValue}>{token.light}</code></div><div><code className={styles.referenceValue}>{token.dark}</code></div><div><code className={styles.referenceValue}>{token.blueLight}</code></div><div><code className={styles.referenceValue}>{token.blueDark}</code></div></TableCell>
                              <TableCell><span className={`type-body-md-medium ${token.className}`}>Hapalin Studio</span></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </SubExhibit>
                </Exhibit>
                <Exhibit id="spacing" title="Spacing & sizing">
                  <div className={styles.referenceGrid}>
                    <section className={styles.spacingScale}>
                      <h4 className="type-label-lg">Spacing scale</h4>
                      <div className={styles.spacingTableWrap} role="region" tabIndex={0} aria-label="Spacing scale">
                        <Table className={styles.referenceTable}>
                          <TableHeader><TableRow><TableHead>Role</TableHead><TableHead>Value</TableHead><TableHead>Preview</TableHead><TableHead>Use</TableHead></TableRow></TableHeader>
                          <TableBody>
                            {spacingTokens.map((token) => (
                              <TableRow key={token.name}>
                                <TableCell className={styles.referenceRole}>{token.name}</TableCell>
                                <TableCell><code className={styles.referenceValue}>{token.value.split(" · ")[0]}</code></TableCell>
                                <TableCell><span className={styles.spacingBar} style={{ width: `${Number.parseFloat(token.value)}px` }} /></TableCell>
                                <TableCell>{token.use}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </section>
                    <div className={styles.measureReferenceGrid}>
                      <section>
                        <h4 className="type-label-lg">Control height</h4>
                        <div className={styles.controlScale}>
                          {controlTokens.map((token) => (
                            <article key={token.name}>
                              <div className={styles.controlStage}>
                                <span style={{ height: `${Number.parseFloat(token.value)}px` }}>{token.name}</span>
                              </div>
                              <footer><code className={styles.referenceValue}>{token.value}</code></footer>
                            </article>
                          ))}
                        </div>
                      </section>
                      <section>
                        <h4 className="type-label-lg">Icon size</h4>
                        <div className={styles.iconScale}>
                          {iconTokens.map((token) => (
                            <article key={token.name}>
                              <LayoutGrid aria-hidden="true" style={{ width: `${Number.parseFloat(token.value)}px`, height: `${Number.parseFloat(token.value)}px` }} />
                              <strong className="type-heading-xs">{token.name}</strong>
                              <code className={styles.referenceValue}>{token.value}</code>
                            </article>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </Exhibit>
                <Exhibit id="layout" title="Layout">
                  <div className={styles.layoutReference}>
                    <div className={styles.layoutMetrics}>
                      <Table className={styles.referenceTable}>
                        <TableHeader><TableRow><TableHead>Region</TableHead><TableHead>Size</TableHead></TableRow></TableHeader>
                        <TableBody>
                          <TableRow><TableCell className={styles.referenceRole}>Sidebar</TableCell><TableCell><code className={styles.referenceValue}>240px</code></TableCell></TableRow>
                          <TableRow><TableCell className={styles.referenceRole}>Header</TableCell><TableCell><code className={styles.referenceValue}>52px</code></TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className={styles.layoutMeasureGrid}>
                      <article>
                        <h4 className="type-heading-xs">Content width</h4>
                        <div className={styles.widthScale}>
                          <div><span className="w-full" /><strong>Dashboard</strong><code className={styles.referenceValue}>Full width</code></div>
                          <div><span className="w-[66%]" /><strong>Settings</strong><code className={styles.referenceValue}>896 max</code></div>
                        </div>
                      </article>
                      <article>
                        <h4 className="type-heading-xs">Responsive gutter</h4>
                        <div className={styles.gutterScale}>
                          <div className="px-5"><span className={styles.referenceValue}>20</span></div>
                          <div className="px-8"><span className={styles.referenceValue}>32</span></div>
                        </div>
                      </article>
                      <article>
                        <h4 className="type-heading-xs">Section rhythm</h4>
                        <div className={styles.rhythmScale}>
                          <div><div className={`${styles.rhythmPair} gap-4`}><span /><span /></div><code className={styles.referenceValue}>16 · panel</code></div>
                          <div><div className={`${styles.rhythmPair} gap-8`}><span /><span /></div><code className={styles.referenceValue}>32 · section</code></div>
                        </div>
                      </article>
                    </div>
                  </div>
                </Exhibit>
                <Exhibit id="materials" title="Materials">
                  <SubExhibit id="shape" title="Shape">
                    <div className={styles.shapeGrid}>
                      {shapeTokens.map((token) => (
                        <article key={token.name}>
                          <span aria-hidden="true" style={{ borderRadius: token.radius }} />
                          <div><strong className="type-heading-xs">{token.name}</strong><code className={styles.referenceValue}>{token.value}</code></div>
                        </article>
                      ))}
                    </div>
                  </SubExhibit>
                  <SubExhibit id="boundary" title="Boundary">
                    <div className={styles.boundaryReference}>
                      <TokenGroup tokens={boundaryTokens} />
                    </div>
                  </SubExhibit>
                  <SubExhibit id="elevation" title="Elevation">
                    <div className={styles.depthGrid}>
                      {depthTokens.map((token) => (
                        <article key={token.id}>
                          <div className={styles.depthStage} aria-hidden="true"><span data-depth={token.id} /></div>
                          <footer><strong className="type-heading-xs">{token.name}</strong><code className={styles.referenceValue}>{token.value}</code><small>{token.use}</small></footer>
                        </article>
                      ))}
                    </div>
                  </SubExhibit>
                </Exhibit>
              </section>

              <section id="components" className={styles.section}>
                <SectionHeader title="Components" description="Reusable interface elements, with variants and examples for building consistent screens." />
                <Suspense fallback={null}><ComponentExamples /></Suspense>
              </section>

              <section id="behavior" className={styles.section}>
                <SectionHeader title="Behavior" description="Interaction and motion rules that make controls predictable and feedback clear." />
                <Exhibit id="interaction" title="Interaction state">
                  <InteractionStates />
                </Exhibit>
                <Exhibit id="motion" title="Motion">
                  <div className={styles.motionGrid}>
                    {motionTokens.map((token) => (
                      <article key={token.id} data-motion={token.id}>
                        <div className={styles.motionTrack} aria-hidden="true"><span /></div>
                        <footer><strong className="type-heading-xs">{token.name}</strong><code className={styles.referenceValue}>{token.value}</code><p className="type-body-xs text-interface-secondary">{token.use}</p></footer>
                      </article>
                    ))}
                  </div>
                </Exhibit>
                <Exhibit id="behavior-rules" title="Usage rules">
                  <div className={styles.behaviorTable}>
                    <Table className={styles.referenceTable}>
                      <TableHeader><TableRow><TableHead>State</TableHead><TableHead>Rule</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {behaviorRows.map((row) => (
                          <TableRow key={row.state}><TableCell className={styles.referenceRole}>{row.state}</TableCell><TableCell>{row.rule}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Exhibit>
              </section>
            </main>
            <PageOutline scrollRootRef={scrollRootRef} />
          </div>
        </div>
      </div>
    </>
  )
}
