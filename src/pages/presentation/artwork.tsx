/* eslint shadcn/require-static-classes: "off" -- Decorative SVG geometry uses scoped CSS and existing palette tokens. */
import { useId } from "react";
import styles from "./presentation.module.css";

/** Vector scenery, separate from the working product components in front of it. */
export function PresentationArtwork({ kind }: { kind: "layers" | "horizon" | "flow" }) {
  const id = useId().replace(/:/g, "");
  const edge = `ppt-edge-${id}`;
  const surface = `ppt-surface-${id}`;
  const horizonSurface = `ppt-horizon-surface-${id}`;
  const horizonRim = `ppt-horizon-rim-${id}`;
  const sheet = "M110 195Q85 182 110 167L365 42Q380 35 398 44L645 174Q670 187 646 199L390 331Q377 338 360 329Z";
  const horizon = "M-150 650C35 290 575 145 1110 450";
  return <svg className={styles["ppt-scene-art"]} data-art={kind} viewBox={kind === "horizon" ? "0 0 1000 700" : "0 0 720 560"} preserveAspectRatio={kind === "horizon" ? "none" : "xMidYMid meet"} fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={edge} x1="0%" y1="100%" x2="85%" y2="0%"><stop stopColor="var(--hapalin-800)" stopOpacity=".2" /><stop offset=".48" stopColor="var(--hapalin-400)" /><stop offset=".7" stopColor="var(--hapalin-50)" /><stop offset="1" stopColor="var(--hapalin-600)" stopOpacity=".15" /></linearGradient>
      <linearGradient id={surface} x1="15%" y1="0%" x2="80%" y2="100%"><stop stopColor="var(--hapalin-400)" stopOpacity=".3" /><stop offset=".42" stopColor="var(--hapalin-700)" stopOpacity=".2" /><stop offset="1" stopColor="var(--hapalin-950)" stopOpacity=".65" /></linearGradient>
      {kind === "horizon" && <>
        <radialGradient id={horizonSurface} cx="55%" cy="0%" r="95%"><stop stopColor="var(--hapalin-300)" stopOpacity=".3" /><stop offset=".25" stopColor="var(--hapalin-700)" stopOpacity=".3" /><stop offset=".7" stopColor="var(--hapalin-950)" stopOpacity=".75" /><stop offset="1" stopColor="var(--hapalin-neutral-1000)" stopOpacity=".8" /></radialGradient>
        <linearGradient id={horizonRim} x1="0%" y1="0%" x2="100%" y2="0%"><stop stopColor="var(--hapalin-700)" stopOpacity="0" /><stop offset=".24" stopColor="var(--hapalin-400)" stopOpacity=".25" /><stop offset=".5" stopColor="var(--hapalin-50)" stopOpacity=".9" /><stop offset=".68" stopColor="var(--hapalin-300)" stopOpacity=".5" /><stop offset="1" stopColor="var(--hapalin-700)" stopOpacity=".05" /></linearGradient>
      </>}
    </defs>
    {kind === "layers" && <g className={styles["ppt-sheet-scene"]}>
      {[154, 78, 0].map((y, index) => <g key={y} transform={`translate(0 ${y})`}>
        <path d={sheet} fill={`url(#${surface})`} stroke={`url(#${edge})`} strokeOpacity={index === 2 ? ".9" : ".4"} vectorEffect="non-scaling-stroke" />
        {index === 2 && <><path d={sheet} stroke={`url(#${edge})`} strokeWidth="12" strokeOpacity=".04" /><path className={styles["ppt-vector-trace"]} d={sheet} pathLength="1" stroke="var(--hapalin-100)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" /></>}
      </g>)}
      <path d="M380 338V470M110 195V350M646 199V354" stroke={`url(#${edge})`} strokeOpacity=".35" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
      <circle cx="380" cy="470" r="4" fill="var(--hapalin-300)" />
    </g>}
    {kind === "horizon" && <g className={styles["ppt-horizon-scene"]}>
      <path d={`${horizon}L1110 850H-150Z`} fill={`url(#${horizonSurface})`} />
      <path d={horizon} stroke={`url(#${horizonRim})`} strokeWidth="64" strokeOpacity=".025" />
      <path d={horizon} stroke={`url(#${horizonRim})`} strokeWidth="24" strokeOpacity=".06" />
      <path d={horizon} stroke={`url(#${horizonRim})`} strokeWidth="8" strokeOpacity=".14" />
      <path d={horizon} stroke={`url(#${horizonRim})`} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      <path d="M-100 765C230 390 740 340 1180 615" stroke={`url(#${horizonRim})`} strokeOpacity=".18" vectorEffect="non-scaling-stroke" />
    </g>}
    {kind === "flow" && <g className={styles["ppt-flow-scene"]}>
      {[0, 60, 120].map((y, index) => <g key={y} transform={`translate(0 ${y})`}>
        <path d="M30 180C210 180 210 45 375 45S530 210 700 210" stroke={`url(#${edge})`} strokeOpacity=".3" vectorEffect="non-scaling-stroke" />
        <path className={styles["ppt-vector-trace"]} data-line={index} d="M30 180C210 180 210 45 375 45S530 210 700 210" pathLength="1" stroke="var(--hapalin-400)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
        <circle cx="30" cy="180" r="4" fill="var(--hapalin-400)" /><circle cx="700" cy="210" r="4" fill="var(--hapalin-300)" />
      </g>)}
    </g>}
  </svg>;
}
