import {
  ArrowDown,
  ArrowRight,
  Check,
  FileDiff,
  GitBranch,
  Mail,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from "./landing-ossguard.module.css";

// Illustrations follow examples/purchase-app; they never submit validation jobs.
const examples = [
  {
    id: "order",
    label: "정상 주문",
    stock: 8,
    before: 1,
    after: 0,
    expected: 1,
  },
  {
    id: "unpaid",
    label: "결제 실패",
    stock: 10,
    before: 0,
    after: 0,
    expected: 0,
  },
];

export function ComparisonPreview() {
  return (
    <div
      className={styles["og-preview"]}
      aria-label="업데이트 전후 실행 비교 예시"
    >
      <div className={styles["og-toolbar"]}>
        <span>
          <ShieldCheck /> 주문 서비스{" "}
          <span className={styles["og-muted"]}>/ 실행 비교</span>
        </span>
        <Badge variant="muted">예시 데이터</Badge>
      </div>
      <div className={styles["og-comparison-body"]}>
        <div className={styles["og-preview-heading"]}>
          <div>
            <span className={styles["og-eyebrow"]}>업데이트 전후 비교</span>
            <h3>같은 요청. 달라진 결과.</h3>
          </div>
          <span className={styles["og-package"]}>
            <Package /> pydantic <code>1.10.24 → 2.12.5</code>
          </span>
        </div>
        <Tabs defaultValue="order">
          <TabsList size="sm" aria-label="비교할 테스트 예시">
            {examples.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {examples.map((item) => (
            <TabsContent value={item.id} key={item.id}>
              <div className={styles["og-request"]}>
                <code>POST /orders</code>
                <span>동일한 입력과 기대값으로 실행</span>
              </div>
              <div className={styles["og-ab-grid"]}>
                {[
                  {
                    label: "업데이트 전",
                    version: "1.10.24",
                    count: item.before,
                  },
                  {
                    label: "업데이트 후",
                    version: "2.12.5",
                    count: item.after,
                  },
                ].map((side) => {
                  const missing = side.count !== item.expected;
                  return (
                    <article
                      className={styles["og-environment"]}
                      key={side.label}
                      aria-label={`${item.label} ${side.label}`}
                    >
                      <div className={styles["og-environment-header"]}>
                        <span>{side.label}</span>
                        <code>pydantic {side.version}</code>
                      </div>
                      <div className={styles["og-response"]}>
                        <span>HTTP 응답</span>
                        <strong>
                          200 <Check />
                        </strong>
                      </div>
                      <div className={styles["og-response"]}>
                        <span>응답의 남은 재고</span>
                        <strong>{item.stock}</strong>
                      </div>
                      <div className={styles["og-call"]} data-missing={missing}>
                        <div>
                          <Truck />
                          <code>POST /shipping</code>
                        </div>
                        <strong>
                          {side.count}
                          <span>회</span>
                        </strong>
                        <span>
                          {missing
                            ? "기대한 배송 요청이 없습니다"
                            : item.expected === 0
                              ? "배송하지 않아야 하는 주문입니다"
                              : "기대한 배송 요청을 확인했습니다"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className={styles["og-verdict"]} role="status">
                <Badge
                  variant={item.before === item.after ? "success" : "error"}
                >
                  {item.before === item.after ? "기준 충족" : "업무 기준 위반"}
                </Badge>
                <p>
                  {item.before === item.after
                    ? "결제에 실패한 주문은 두 버전 모두 배송을 요청하지 않았습니다."
                    : "응답은 둘 다 200이지만, 업데이트 후 배송 요청 1회가 누락됐습니다."}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export function SetupPreview() {
  return (
    <div
      className={`${styles["og-mini"]} ${styles["og-setup"]}`}
      aria-label="업데이트 설정 예시"
    >
      <div className={styles["og-mini-label"]}>
        <GitBranch /> 업데이트 설정 <Badge variant="muted">예시</Badge>
      </div>
      <dl className={styles["og-settings"]}>
        <div>
          <dt>저장소</dt>
          <dd>OSSGuard-Purchase-Demo</dd>
        </div>
        <div>
          <dt>실행 환경</dt>
          <dd>Python 3.12 · uv</dd>
        </div>
        <div>
          <dt>변경할 패키지</dt>
          <dd>pydantic</dd>
        </div>
      </dl>
      <div className={styles["og-version-change"]}>
        <div>
          <span>현재 버전</span>
          <code>1.10.24</code>
        </div>
        <ArrowRight />
        <div>
          <span>목표 버전</span>
          <code>2.12.5</code>
        </div>
      </div>
      <p className={styles["og-muted"]}>
        같은 커밋에서 의존성을 바꿔 비교합니다.
      </p>
    </div>
  );
}

export function TestsPreview() {
  return (
    <div className={styles["og-mini"]} aria-label="업무 기준과 테스트 예시">
      <div className={styles["og-mini-label"]}>
        <ShieldCheck /> 테스트 초안{" "}
        <Badge variant="warning">검토 후 승인</Badge>
      </div>
      <blockquote>
        결제가 끝나고 재고가 충분한 주문은
        <br />
        배송을 한 번 요청해야 한다.
      </blockquote>
      <ArrowDown className={styles["og-draft-arrow"]} />
      <div className={styles["og-test-lines"]}>
        <div>
          <Check />
          <span>주문 응답</span>
          <code>HTTP 200</code>
        </div>
        <div>
          <Check />
          <span>남은 재고</span>
          <code>8개</code>
        </div>
        <div>
          <Check />
          <span>배송 요청</span>
          <code>1회</code>
        </div>
      </div>
    </div>
  );
}

export function EvidencePreview() {
  return (
    <div className={styles["og-mini"]} aria-label="의존성 변경 내역 예시">
      <div className={styles["og-mini-label"]}>
        <FileDiff /> pyproject.toml <Badge variant="muted">변경 예시</Badge>
      </div>
      <pre className={styles["og-diff"]}>
        <code>
          <span>- pydantic==1.10.24</span>
          {"\n"}
          <span>+ pydantic==2.12.5</span>
        </code>
      </pre>
      <div className={styles["og-artifacts"]}>
        <span>
          <Check /> 잠금 파일 변경
        </span>
        <span>
          <Check /> 실제 설치 버전 확인
        </span>
      </div>
      <div className={styles["og-evidence-row"]}>
        <Package />
        <span>함께 바뀐 하위 의존성도 기록</span>
      </div>
    </div>
  );
}

export function AnalysisPreview() {
  return (
    <aside className={styles["og-analysis"]} aria-label="분석 설명 예시">
      <Badge variant="muted">결과 설명 예시</Badge>
      <h3>차이부터, 근거까지.</h3>
      <span className={styles["og-eyebrow"]}>확인된 결과</span>
      <p>업데이트 후 정상 주문의 배송 요청이 1회에서 0회로 줄었습니다.</p>
      <span className={styles["og-eyebrow"]}>살펴볼 부분</span>
      <p>
        의존성의 동작 변화가 배송 요청 조건에 영향을 주었는지 확인해 보세요.
      </p>
      <div className={styles["og-evidence-row"]}>
        <FileDiff />
        <span>응답 · 외부 호출 · 변경 파일</span>
      </div>
      <p className={styles["og-muted"]}>
        AI 설명은 확인된 기록을 바탕으로 원인 후보를 제시합니다.
      </p>
    </aside>
  );
}

export function MockPreview() {
  return (
    <div
      className={`${styles["og-mini"]} ${styles["og-mock"]}`}
      aria-label="외부 API 모의 실행 예시"
    >
      <div className={styles["og-mini-label"]}>
        <Truck /> 배송 API 모의 실행
      </div>
      <div className={styles["og-mock-route"]}>
        <span>검증 앱</span>
        <ArrowRight />
        <span>모의 배송 API</span>
      </div>
      <div className={styles["og-test-lines"]}>
        <div>
          <code>POST /shipping</code>
          <Badge variant="success">응답 200</Badge>
        </div>
        <div>
          <span>호출 기록</span>
          <code>주문별 요청 횟수</code>
        </div>
      </div>
    </div>
  );
}

export function NotificationPreview() {
  return (
    <div
      className={`${styles["og-mini"]} ${styles["og-mail"]}`}
      aria-label="결과 알림 예시"
    >
      <div className={styles["og-mini-label"]}>
        <Mail /> 검증 결과 알림 <Badge variant="muted">예시</Badge>
      </div>
      <h3>주문 서비스 검증이 끝났습니다.</h3>
      <p className={styles["og-muted"]}>pydantic 1.10.24 → 2.12.5</p>
      <div className={styles["og-mail-summary"]}>
        <Badge variant="error">업무 기준 위반</Badge>
        <p>정상 주문의 배송 요청을 확인해 주세요.</p>
      </div>
      <span className={styles["og-mail-link"]}>
        결과에서 근거 확인 <ArrowRight />
      </span>
    </div>
  );
}
