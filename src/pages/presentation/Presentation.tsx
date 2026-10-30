/* eslint shadcn/require-static-classes: "off" -- Static CSS module references define slide composition; shared UI keeps its component variants. */
import styles from "./presentation.module.css";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Grid2X2, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SlideContent, slides } from "./slides";
import { PresentationArtwork } from "./artwork";


type PageDirection = "forward" | "backward" | "jump";
const copyParts = [["title", ":is(h1,h2)"], ["lead", "p"]] as const;
const copyAxes = ["x", "y", "w", "h"] as const;

function measureCopy(stage: HTMLElement | null, phase: "old" | "new") {
  const message = stage?.querySelector('[data-slide]:not([hidden])')?.querySelector(`.${styles["ppt-message"]}`);
  for (const [part, selector] of copyParts) {
    const element = message?.querySelector(selector);
    if (!element) continue;
    const { left: x, top: y, width: w, height: h } = element.getBoundingClientRect();
    const bounds = { x, y, w, h };
    for (const axis of copyAxes) document.documentElement.style.setProperty(`--ppt-${phase}-${part}-${axis}`, `${bounds[axis]}px`);
  }
}

function clearCopyMetrics() {
  for (const phase of ["old", "new"]) for (const [part] of copyParts) for (const axis of copyAxes) {
    document.documentElement.style.removeProperty(`--ppt-${phase}-${part}-${axis}`);
  }
}

export function slideIndex(hash: string) {
  const value = Number(hash.replace(/^#/, ""));
  return Number.isInteger(value) && value >= 1 && value <= slides.length ? value - 1 : 0;
}

export default function Presentation() {
  const { hash, pathname, search } = useLocation();
  const navigate = useNavigate();
  const index = slideIndex(hash);
  const [overview, setOverview] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState("");
  const [fallbackEntry, setFallbackEntry] = useState<{ target: number; direction: PageDirection }>();
  const requestedIndex = useRef(index);
  const committedIndex = useRef(index);
  const requestedDirection = useRef<PageDirection>("jump");
  const stageRef = useRef<HTMLElement>(null);
  const transitionRef = useRef<ViewTransition | null>(null);
  const transitionId = useRef(0);
  const pendingCapture = useRef<{ id: number; target: number; resolve: () => void } | null>(null);
  const animateToRequested = useCallback(function animate() {
    if (requestedIndex.current === committedIndex.current) return;
    const id = ++transitionId.current;
    const root = document.documentElement;
    let capturing = false;
    const commit = () => {
      if (id !== transitionId.current) return;
      // Inputs received before capture are folded into this same destination.
      const target = requestedIndex.current;
      if (target === committedIndex.current) {
        transitionRef.current?.skipTransition();
        return;
      }
      if (capturing) root.dataset.pptDirection = requestedDirection.current;
      // Declarative routers may schedule navigation in a concurrent React lane.
      const rendered = capturing ? new Promise<void>(resolve => { pendingCapture.current = { id, target, resolve }; }) : undefined;
      committedIndex.current = target;
      flushSync(() => navigate({ pathname, search, hash: `#${target + 1}` }, { replace: true }));
      return rendered;
    };
    const finish = () => {
      if (id !== transitionId.current) return;
      transitionRef.current = null;
      delete root.dataset.pptDirection;
      clearCopyMetrics();
      // Complete the current visual pose before beginning the latest queued step.
      if (requestedIndex.current !== committedIndex.current) animate();
    };
    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFallbackEntry(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? undefined : { target: requestedIndex.current, direction: requestedDirection.current });
      commit();
      finish();
      return;
    }
    setFallbackEntry(undefined);
    capturing = true;
    measureCopy(stageRef.current, "old");
    root.dataset.pptDirection = requestedDirection.current;
    try {
      const transition = document.startViewTransition(commit);
      transitionRef.current = transition;
      void transition.ready.catch(() => {});
      void transition.finished.then(finish, finish);
    } catch {
      capturing = false;
      delete root.dataset.pptDirection;
      setFallbackEntry({ target: requestedIndex.current, direction: requestedDirection.current });
      commit();
      finish();
    }
  }, [navigate, pathname, search]);
  const go = useCallback((next: number) => {
    const bounded = Math.max(0, Math.min(slides.length - 1, next));
    if (bounded === requestedIndex.current) return;
    const previous = requestedIndex.current;
    requestedIndex.current = bounded;
    requestedDirection.current = Math.abs(bounded - previous) > 1 ? "jump" : bounded > previous ? "forward" : "backward";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && transitionRef.current) {
      transitionId.current += 1;
      transitionRef.current.skipTransition();
      transitionRef.current = null;
      pendingCapture.current?.resolve();
      pendingCapture.current = null;
      delete document.documentElement.dataset.pptDirection;
      clearCopyMetrics();
    }
    if (!transitionRef.current) animateToRequested();
  }, [animateToRequested]);

  useLayoutEffect(() => {
    const pending = pendingCapture.current;
    if (!pending || pending.id !== transitionId.current || pending.target !== index) return;
    measureCopy(stageRef.current, "new");
    pendingCapture.current = null;
    pending.resolve();
  }, [index]);

  useEffect(() => {
    if (committedIndex.current !== index) {
      transitionId.current += 1;
      transitionRef.current?.skipTransition();
      transitionRef.current = null;
      pendingCapture.current?.resolve();
      pendingCapture.current = null;
      requestedIndex.current = index;
      committedIndex.current = index;
      delete document.documentElement.dataset.pptDirection;
      clearCopyMetrics();
    }
  }, [index]);

  useEffect(() => () => {
    transitionId.current += 1;
    transitionRef.current?.skipTransition();
    pendingCapture.current?.resolve();
    pendingCapture.current = null;
    delete document.documentElement.dataset.pptDirection;
    clearCopyMetrics();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const enabled = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      stage!.style.setProperty("--ppt-pointer-x", "0");
      stage!.style.setProperty("--ppt-pointer-y", "0");
    }
    function move(event: PointerEvent) {
      if (!enabled.matches || event.pointerType === "touch" || document.documentElement.hasAttribute("data-ppt-direction")) return;
      const bounds = stage!.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - .5;
      pointerY = (event.clientY - bounds.top) / bounds.height - .5;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        stage!.style.setProperty("--ppt-pointer-x", String(pointerX));
        stage!.style.setProperty("--ppt-pointer-y", String(pointerY));
        frame = 0;
      });
    }
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", reset);
    enabled.addEventListener("change", reset);
    return () => {
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", reset);
      enabled.removeEventListener("change", reset);
      reset();
    };
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = `${index + 1}. ${slides[index].title} | Hapalin`;
    return () => { document.title = previous; };
  }, [index]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (overview || document.querySelector('[role="dialog"][data-state="open"]') || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target instanceof Element && target.closest("input, textarea, select, [contenteditable=true], [data-ppt-interactive]")) return;
      const forward = ["ArrowRight", "ArrowDown", "PageDown"].includes(event.key);
      const backward = ["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key);
      if (forward || backward || event.key === "Home" || event.key === "End") {
        event.preventDefault();
        go(event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1 : requestedIndex.current + (forward ? 1 : -1));
      } else if (event.code === "Space" && !(target instanceof Element && target.closest("button,a,[role=button]"))) {
        event.preventDefault();
        go(requestedIndex.current + (event.shiftKey ? -1 : 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, overview]);
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === document.documentElement);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      // Document fullscreen includes Radix portals for the outline and demo dialogs.
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else throw new Error("Unsupported fullscreen");
      setNotice("");
    } catch {
      setNotice("전체 화면을 열지 못했습니다. 브라우저의 전체 화면 기능(F11)을 사용해 주세요.");
    }
  }

  return <main ref={stageRef} className={styles["ppt"]} data-enter-direction={fallbackEntry?.target === index ? fallbackEntry.direction : undefined} aria-label="Hapalin 프로젝트 발표">
    <div className={styles["ppt-viewport"]}>
      {slides.map((slide, i) => <section key={slide.id} className={styles["ppt-slide"]} hidden={i !== index} aria-hidden={i !== index} aria-label={`${i + 1}. ${slide.title}`} data-slide={i + 1} data-kind={slide.id}>
        {["intro", "views", "workspace", "continue", "closing"].includes(slide.id) && <div className={styles["ppt-atmosphere"]} aria-hidden="true"><span /><span /><span /><PresentationArtwork kind={slide.id === "intro" || slide.id === "workspace" ? "layers" : slide.id === "closing" ? "horizon" : "flow"} /></div>}
        <div className={styles["ppt-content"]}><div className={styles["ppt-body"]}><SlideContent id={slide.id} /></div></div>
      </section>)}
    </div>
    <div className={styles["ppt-controls-zone"]}>
    <nav className={styles["ppt-controls"]} aria-label="발표 제어">
      <div className={styles["ppt-controls-group"]}><Button variant="ghost" size="icon" aria-label="이전 슬라이드" disabled={index === 0} onClick={() => go(requestedIndex.current - 1)}><ArrowLeft /></Button><span className={cn(styles["ppt-page-count"], "type-code-sm")} role="status" aria-live="polite">{String(index + 1).padStart(2, "0")} / {slides.length}</span><Button variant="ghost" size="icon" aria-label="다음 슬라이드" disabled={index === slides.length - 1} onClick={() => go(requestedIndex.current + 1)}><ArrowRight /></Button></div>
      <div className={styles["ppt-controls-group"]}><Button variant="ghost" size="icon" aria-label="슬라이드 목차" title="목차" onClick={() => setOverview(true)}><Grid2X2 /></Button><Button variant="ghost" size="icon" aria-label={fullscreen ? "전체 화면 종료" : "전체 화면"} title={fullscreen ? "전체 화면 종료" : "전체 화면"} onClick={toggleFullscreen}>{fullscreen ? <Minimize /> : <Maximize />}</Button></div>
    </nav>
    </div>
    {notice && <div className={styles["ppt-notice"]}><Alert><AlertDescription>{notice}</AlertDescription></Alert></div>}
    <Dialog open={overview} onOpenChange={setOverview}><DialogContent className="max-h-96 overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>발표 목차</DialogTitle><DialogDescription>이동할 슬라이드를 선택하세요.</DialogDescription></DialogHeader><div className={styles["ppt-overview-grid"]}>{slides.map((slide, i) => <Button key={slide.id} variant={i === index ? "secondary" : "ghost"} size="lg" className="justify-start" onClick={() => { go(i); setOverview(false); }}><span>{String(i + 1).padStart(2, "0")}</span><span className="truncate">{slide.title}</span></Button>)}</div></DialogContent></Dialog>
  </main>;
}
