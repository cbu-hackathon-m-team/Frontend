/* eslint shadcn/require-static-classes: "off" -- Scoped slide compositions; shared UI retains its component variants. */
import { memo, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check, FileDiff, GitBranch, ListChecks, Mail, Package, Play, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from "./presentation.module.css";

export const slides = [
  { id: "intro", title: "업데이트 후에도,\n하던 일 그대로", summary: "OSSGuard는 오픈소스 라이브러리를 업데이트한 뒤에도 프로그램이 해야 할 일을 제대로 하는지 확인하는 웹 서비스입니다." },
  { id: "problem", title: "에러 없이도\n업무가 멈춥니다", summary: "오픈소스 라이브러리는 계속 업데이트됩니다. 버전을 바꾸면 기존 기능이 제대로 작동하지 않을 수 있습니다. 에러나 경고가 없어서 문제를 놓치기도 합니다." },
  { id: "example", title: "주문은 성공했는데,\n배송 요청이 없다면?", summary: "두 버전 모두 HTTP 200을 반환했고, 남은 재고도 8개로 같았습니다. 하지만 업데이트한 버전은 배송을 요청하지 않았습니다." },
  { id: "case", title: "Pydantic 버전만\n바꿨을 때", summary: "Pydantic의 비교 방식이 바뀌면서 같은 코드의 결과가 True에서 False로 달라졌습니다. 그 결과, 업데이트한 버전에서만 배송 요청이 빠졌습니다." },
  { id: "register", title: "프로젝트 등록과\n업데이트 버전 선택", summary: "GitHub 프로젝트를 등록하면 라이브러리와 버전을 읽어옵니다. 사용자는 업데이트할 라이브러리 하나와 목표 버전을 고릅니다." },
  { id: "tests", title: "검사 기준은 사용자가 정합니다", summary: "지켜야 할 동작을 입력과 기대값으로 정합니다. 테스트를 직접 작성하거나 불러오고, AI 초안도 사용자가 확인해 승인합니다." },
  { id: "isolation", title: "원본은 그대로,\n두 환경에서 비교", summary: "원본과 운영 중인 프로그램은 그대로 둡니다. 임시 복사본을 별도의 Docker 환경에서 빌드·실행하고, 설치된 버전도 확인합니다." },
  { id: "mock", title: "실제 배송 없이,\n배송 요청을 확인", summary: "WireMock이라는 모의 서버가 배송 업체 대신 응답하고 요청을 기록합니다. 실제 배송 없이, 두 버전이 보낸 요청의 내용과 횟수를 비교합니다." },
  { id: "verdict", title: "어디까지 확인했는지 구분합니다", summary: "기존 버전도 함께 실행합니다. 기존부터 실패한 테스트는 업데이트 때문에 생긴 문제로 단정하지 않습니다." },
  { id: "evidence", title: "근거를 보관하고,\n결과를 설명합니다", summary: "검사 조건과 실행 기록을 함께 보관합니다. 사용자가 승인한 기준으로 판정하고, AI는 확인된 결과를 설명합니다." },
  { id: "scope", title: "버전 선택부터 업무 확인까지", summary: "Dependabot·Renovate의 검증 범위는 프로젝트의 테스트에 달려 있습니다. OSSGuard는 버전 변경·실행·외부 요청 비교를 한 흐름으로 연결합니다." },
  { id: "closing", title: "업데이트해도 괜찮은지,\n감이 아닌 근거로", summary: "업무에 미치는 영향을 먼저 확인하고, 그 근거를 보고 업데이트 여부를 결정하세요." },
] as const;

type Slide = typeof slides[number];

function Message({ slide, children }: { slide: Slide; children?: ReactNode }) {
  return <div className={styles["ppt-message"]}><h2>{slide.title}</h2><p>{slide.summary}</p>{children}</div>;
}

function Feature({ slide, children }: { slide: Slide; children: ReactNode }) {
  return <div className={styles["ppt-feature"]}><Message slide={slide} /><div className={styles["ppt-feature-visual"]}>{children}</div></div>;
}

function Brand({ name, label }: { name: string; label: string }) {
  return <span className={styles["ppt-brand"]}><img src={`/images/ossguard/${name}.svg`} alt="" width="32" height="32" />{label}</span>;
}

function VersionPair() {
  return <div className={styles["ppt-version-pair"]} aria-label="기존 버전과 업데이트 버전">
    <div><span>기존 버전</span><strong>1.10.24</strong></div>
    <ArrowRight aria-hidden="true" />
    <div><span>업데이트 버전</span><strong>2.12.5</strong></div>
  </div>;
}

const cases = [
  { id: "paid", label: "결제 완료", stock: 8, before: 1, after: 0, expected: 1 },
  { id: "unpaid", label: "결제 실패", stock: 10, before: 0, after: 0, expected: 0 },
];

function CaseComparison() {
  return <div className={styles["ppt-case"]} data-ppt-interactive="" aria-label="Pydantic 업데이트 결과 예시">
    <div className={styles["ppt-case-header"]}><span>같은 코드와 주문으로 비교 · 재현 사례</span><code>Pydantic 1.10.24 → 2.12.5</code></div>
    <Tabs defaultValue="paid">
      <TabsList aria-label="비교할 주문 조건">{cases.map(item => <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>)}</TabsList>
      {cases.map(item => <TabsContent key={item.id} value={item.id}>
        <table className={styles["ppt-comparison-table"]}>
          <caption>입력: {item.label} · 재고 10개 · 주문 2개</caption>
          <thead><tr><th scope="col">확인 항목</th><th scope="col">기존 <small>1.10.24</small></th><th scope="col">업데이트 <small>2.12.5</small></th></tr></thead>
          <tbody><tr><th scope="row">HTTP 응답</th><td>200</td><td>200</td></tr>
            <tr><th scope="row">응답의 남은 재고</th><td>{item.stock}개</td><td>{item.stock}개</td></tr>
            <tr className={styles["ppt-shipping-row"]} data-different={item.before !== item.after}><th scope="row">배송 요청 <small>기대 {item.expected}회</small></th><td><div className={styles["ppt-shipping-value"]}><strong>{item.before}</strong><span>회</span></div><small>기준 충족</small></td><td><div className={styles["ppt-shipping-value"]}><strong>{item.after}</strong><span>회</span></div><small>{item.after !== item.expected ? "요청 누락" : "기준 충족"}</small></td></tr>
          </tbody>
        </table>
        <p className={styles["ppt-case-result"]} data-different={item.before !== item.after}>{item.before !== item.after ? "회귀 의심 · 응답은 같지만 배송 요청 1회가 누락됐습니다" : "기준 충족 · 결제 실패 주문은 두 버전 모두 배송하지 않습니다"}</p>
      </TabsContent>)}
    </Tabs>

  </div>;
}

// Keep unchanged scenes memoized while the existing navigation captures a transition.
export const SlideContent = memo(function SlideContent({ id }: { id: Slide["id"] }) {
  const slide = slides.find(item => item.id === id)!;
  switch (id) {
    case "intro": return <div className={styles["ppt-hero"]}>
      <div className={styles["ppt-message"]}><h1>업데이트 후에도,<br /><em>하던 일 그대로</em></h1><p>{slide.summary}</p><strong className={styles["ppt-wordmark"]}>OSSGuard</strong></div>
      <div className={styles["ppt-feature-visual"]}><div className={styles["ppt-hero-comparison"]}>
        <div className={styles["ppt-version-pair"]} data-concept="true" aria-label="업데이트 전후 프로그램 비교"><div><span>업데이트 전</span><strong>기존 버전</strong></div><ArrowRight aria-hidden="true" /><div><span>업데이트 후</span><strong>업데이트 버전</strong></div></div><div className={styles["ppt-shared-test"]}><ListChecks /><span>같은 테스트로 업무 결과 비교</span></div>
        <div className={styles["ppt-hero-outcome"]}><span>응답 값</span><span>외부 요청</span><span>실행 기록</span></div>
      </div></div>
    </div>;
    case "problem": return <Feature slide={slide}><figure className={styles["ppt-photo"]}>
      <img src="/images/presentation/developer.jpg" alt="두 모니터에서 소스 코드를 확인하는 개발자" width="1920" height="1280" />
    </figure></Feature>;
    case "example": return <div className={styles["ppt-example"]}><Message slide={slide} />
      <div className={styles["ppt-order-story"]}><figure className={styles["ppt-photo"]}><img src="/images/presentation/warehouse.jpg" alt="배송할 상품이 보관된 물류 창고" width="1920" height="1280" /></figure>
        <ol className={styles["ppt-business-flow"]}><li><Check /><span>결제 확인</span><small>완료</small></li><li><Check /><span>재고 응답</span><small>10 − 2 = 8</small></li><li data-missing="true"><Truck /><span>배송 요청</span><small>누락</small></li></ol>
        <p className={styles["ppt-story-conclusion"]}>응답 코드만 확인하면, 배송 요청 누락을 놓칠 수 있습니다</p>
      </div>
    </div>;
    case "register": return <Feature slide={slide}><div className={styles["ppt-setup"]}>
      <Brand name="github" label="GitHub 프로젝트 등록" />
      <dl className={styles["ppt-settings"]}><div><dt>지원 프로젝트</dt><dd>실행 설정이 준비된<br />Python 공개 프로젝트</dd></div><div><dt>읽어온 정보</dt><dd>라이브러리 목록 · 현재 버전</dd></div></dl>
      <div className={styles["ppt-update-selection"]}><span>업데이트할 라이브러리</span><strong>Pydantic</strong><VersionPair /></div>
    </div></Feature>;
    case "tests": return <div className={styles["ppt-centered"]}><Message slide={slide} />
      <div className={styles["ppt-expectations"]}><div className={styles["ppt-test-input"]}><h3>테스트 입력</h3><dl><div><dt>결제 상태</dt><dd>완료</dd></div><div><dt>현재 재고</dt><dd>10개</dd></div><div><dt>주문 수량</dt><dd>2개</dd></div></dl></div><ArrowRight aria-hidden="true" /><div className={styles["ppt-test-expected"]}><h3>기대 결과</h3><div className={styles["ppt-expectation-values"]}><div><span>응답의 남은 재고</span><strong>8<small>개</small></strong></div><div><span>배송 API 요청</span><strong>1<small>회</small></strong></div></div></div></div>
    </div>;
    case "isolation": return <Feature slide={slide}><div className={styles["ppt-isolation"]}>
      <div className={styles["ppt-source"]}><GitBranch /><strong>GitHub 원본</strong><span>같은 소스 코드에서 복사</span></div>
      <div className={styles["ppt-environment-branches"]} aria-label="같은 원본에서 만든 별도의 Docker 실행 환경"><article><h3>기존 버전</h3><span>Docker 환경 A · Pydantic</span><code>1.10.24</code></article><article><h3>업데이트 버전</h3><span>Docker 환경 B · Pydantic</span><code>2.12.5</code></article></div>
      <div className={styles["ppt-request"]}><div><code>POST /orders</code><span>두 환경에 같은 요청</span></div><p>결제 완료 · 재고 10개 · 주문 2개</p></div>
    </div></Feature>;
    case "mock": return <Feature slide={slide}><div className={styles["ppt-mock"]}>
      <div className={styles["ppt-mock-route"]}><div><Package /><strong>주문 프로그램</strong><span>기존 / 업데이트</span></div><ArrowRight aria-hidden="true" /><div><Truck /><strong>WireMock</strong><span>배송 업체 대신 응답</span></div></div>
      <div className={styles["ppt-journal"]}><span>WireMock에 남은 요청 기록</span><code>POST /shipping</code><div><div><span>기존 버전</span><strong>1<small>회</small></strong></div><div data-missing="true"><span>업데이트 버전</span><strong>0<small>회</small></strong></div></div></div>

    </div></Feature>;
    case "verdict": return <div className={styles["ppt-centered"]}><Message slide={slide} />
      <dl className={styles["ppt-verdicts"]}>
        <div data-outcome="regression"><dt>회귀 의심</dt><dd>기존 버전은 통과했지만 업데이트한 버전은 실패</dd></div>
        <div data-outcome="execution"><dt>실행 단계 실패</dt><dd>설치·빌드·실행 중 어느 단계에서 멈췄는지 표시</dd></div>
        <div data-outcome="baseline"><dt>기준 확인 필요</dt><dd>기존 버전부터 테스트에 실패한 경우</dd></div>
        <div data-outcome="unverified"><dt>미검증</dt><dd>실행이나 기록 부족으로 끝까지 확인하지 못한 항목</dd></div>
      </dl>
    </div>;
    case "evidence": return <div className={styles["ppt-feature"]}><Message slide={slide}><ol className={styles["ppt-evidence-followup"]}><li><FileDiff /><span>AI가 기록을 바탕으로 원인 후보 설명</span></li><li><Mail /><span>이메일로 결과 요약 전달</span></li></ol></Message><div className={styles["ppt-feature-visual"]}><div className={styles["ppt-evidence"]}>
      <div className={styles["ppt-evidence-heading"]}><FileDiff /><strong>의존성 변경 예시</strong><code>pyproject.toml</code></div>
      <div className={styles["ppt-package-diff"]} aria-label="Pydantic 의존성 변경 예시"><code data-change="removed">− &quot;pydantic==1.10.24&quot;</code><code data-change="added">+ &quot;pydantic==2.12.5&quot;</code></div>
      <dl className={styles["ppt-settings"]}><div><dt>함께 보관</dt><dd><code>uv.lock</code> · 함께 바뀐 패키지</dd></div><div><dt>실행 조건</dt><dd>기준 커밋 · 실제 설치 버전 · 승인한 테스트</dd></div><div><dt>관측 기록</dt><dd>HTTP 응답 · 외부 요청 기록 · 실행 로그</dd></div></dl>
    </div></div></div>;
    case "case": return <div className={styles["ppt-feature"]}><Message slide={slide}><div className={styles["ppt-code-example"]}><span>배송 요청을 보내는 조건</span><pre><code>{'(Decision(approved=True)\n  == {"approved": True})'}</code></pre><div className={styles["ppt-condition-results"]}><div><span>기존 버전</span><strong>True</strong></div><ArrowRight aria-hidden="true" /><div><span>업데이트 버전</span><strong>False</strong></div></div></div></Message><div className={styles["ppt-feature-visual"]}><CaseComparison /></div></div>;
    case "scope": return <div className={styles["ppt-next"]}><Message slide={slide} />
      <ol className={styles["ppt-scope-flow"]} aria-label="OSSGuard의 검증 흐름">{["버전 선택", "라이브러리 변경", "빌드·실행", "업무 결과 확인"].map((label, index) => <li key={label}><div><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong></div>{index < 3 && <ArrowRight aria-hidden="true" />}</li>)}</ol>
      <div className={styles["ppt-scope-columns"]}><div><h3>첫 MVP</h3><ul><li>설정이 준비된 Python 공개 프로젝트</li><li>직접 사용하는 라이브러리 하나를 업데이트</li><li>같은 요청으로 응답·외부 호출 비교</li></ul></div><div><h3>이후 확장</h3><ul><li>다른 언어와 패키지 관리 환경</li><li>실행 방식과 검사 항목 확대</li></ul></div></div>
    </div>;
    case "closing": return <div className={styles["ppt-closing"]}><div className={styles["ppt-message"]}><h2>업데이트해도 괜찮은지,<br />감이 아닌 근거로<br /><em>OSSGuard</em></h2><p>{slide.summary}</p><div className={styles["ppt-demo-actions"]}><Button variant="secondary" size="lg" asChild><a href="/" target="_blank" rel="noopener noreferrer">서비스 소개 <ArrowUpRight data-icon="inline-end" /></a></Button><Button variant="secondary" size="lg" asChild><a href="/dashboard?project=python-uv-demo&tab=results" target="_blank" rel="noopener noreferrer">결과 화면 예시 <ArrowRight data-icon="inline-end" /></a></Button><Button variant="secondary" size="lg" asChild><a href="https://youtu.be/A65hVv9CT7o" target="_blank" rel="noopener noreferrer"><Play data-icon="inline-start" /> 시연 영상</a></Button></div></div></div>;
  }
});
