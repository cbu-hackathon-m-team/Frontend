import { ArrowRight, Check, Package, Truck, X } from "lucide-react";
import styles from "./landing-ossguard.module.css";

export function ExecutionHeroArt() {
  return (
    <div className={styles["og-hero-art"]} role="img" aria-label="같은 커밋에서 두 버전을 실행한 비교 예시. HTTP 응답은 200으로 같지만 새 버전의 배송 요청이 누락됐습니다.">
      <svg viewBox="0 0 600 540" fill="none" aria-hidden="true">
        <g stroke="var(--boundary-strong)" strokeWidth="1">
          <path d="M300 120V148Q300 168 280 168H168Q148 168 148 188V214 M300 148Q300 168 320 168H432Q452 168 452 188V214" />
        </g>
        <circle cx="300" cy="151" r="2.5" fill="var(--primary)" />
        <rect x="177" y="50" width="246" height="70" rx="8" fill="var(--surface-panel)" stroke="var(--boundary-default)" />
        <path d="M202 72v19m0-12h10v-7" stroke="var(--primary)" strokeWidth="1.5" />
        <circle cx="202" cy="72" r="2" fill="var(--primary)" /><circle cx="202" cy="92" r="2" fill="var(--primary)" /><circle cx="212" cy="72" r="2" fill="var(--primary)" />
        <text x="228" y="80" className={styles["og-trace-code"]}>main</text>
        <text x="202" y="103" className={styles["og-trace-muted"]}>같은 커밋 · 같은 요청 · 같은 기대값</text>
        {[{ x: 25, version: "1.10.24", label: "기존 버전 A", count: "1", failed: false }, { x: 330, version: "2.12.5", label: "새 버전 B", count: "0", failed: true }].map(side => (
          <g key={side.label} transform={`translate(${side.x} 214)`}>
            <rect width="245" height="230" rx="8" fill="var(--surface-panel)" stroke="var(--boundary-default)" />
            <path d="M8 .5H237Q244.5 .5 244.5 8V48H.5V8Q.5 .5 8 .5Z" fill="var(--surface-chrome)" />
            <path d="M1 48H244" stroke="var(--boundary-default)" />
            <text x="20" y="29" className={styles["og-trace-label"]}>{side.label}</text>
            <text x="20" y="78" className={styles["og-trace-muted"]}>pydantic</text>
            <text x="20" y="109" className={styles["og-trace-version"]}>{side.version}</text>
            <text x="20" y="143" className={styles["og-trace-muted"]}>HTTP 응답</text>
            <text x="225" y="143" textAnchor="end" className={styles["og-trace-response"]}>200 OK</text>
            <path d="M20 158H225" stroke="var(--boundary-default)" />
            <text x="20" y="184" className={styles["og-trace-muted"]}>배송 API 호출</text>
            <text x="20" y="214" className={styles["og-trace-count"]} fill={side.failed ? "var(--signal-danger)" : "var(--status-success-foreground)"}>{side.count}<tspan fontSize="12" dx="5">회</tspan></text>
            <rect x="158" y="193" width="68" height="26" rx="4" fill={side.failed ? "var(--signal-danger)" : "var(--signal-success)"} fillOpacity=".08" />
            <text x="217" y="210" textAnchor="end" className={side.failed ? styles["og-trace-error"] : styles["og-trace-ok"]}>{side.failed ? "호출 누락" : "기준 충족"}</text>
          </g>
        ))}
        <text x="300" y="484" textAnchor="middle" className={styles["og-trace-muted"]}>정상 주문 · 배송 요청 비교 예시</text>
      </svg>
    </div>
  );
}

export function DeliveryComparisonArt() {
  return <div className={styles["og-delivery-art"]} role="img" aria-label="HTTP 200 응답은 같지만 배송 호출은 기존 1회에서 새 버전 0회로 줄어든 예시">
    <div className={styles["og-art-kicker"]}><Truck /> POST /shipping <span>정상 주문 · 예시</span></div>
    <div className={styles["og-delivery-columns"]}>
      <div><span>기존 버전 A</span><strong>1<small>회</small></strong><span><Check /> 기대한 호출 확인</span></div>
      <ArrowRight />
      <div data-failed="true"><span>새 버전 B</span><strong>0<small>회</small></strong><span><X /> 배송 호출 누락</span></div>
    </div>
    <div className={styles["og-same-response"]}><span>HTTP 응답</span><code>200 OK</code><span>→</span><code>200 OK</code><span>응답만 보면 같습니다</span></div>
  </div>;
}

export function BuildFailureArt() {
  return <div className={styles["og-build-art"]} role="img" aria-label="새 버전의 빌드 실패를 확인하고 업무 테스트는 미실행으로 구분하는 예시">
    <div className={styles["og-art-kicker"]}><Package /> 후보 버전 실행 <span>예시</span></div>
    <ol>{[{ label: "저장소 준비", state: "완료" }, { label: "의존성 변경", state: "완료" }, { label: "후보 빌드", state: "실패" }, { label: "업무 테스트", state: "미실행" }].map((step, i) => <li key={step.label} data-state={step.state}><span>{i < 2 ? <Check /> : i === 2 ? <X /> : "—"}</span><strong>{step.label}</strong><span>{step.state}</span></li>)}</ol>
    <p>실행하지 못한 테스트는 통과로 표시하지 않습니다.</p>
  </div>;
}
