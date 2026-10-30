export type Scenario = "defect" | "fixed" | "baseline" | "error";
export const scenarios: Record<Scenario, string> = {
  defect: "배송 누락 · 결함 후보",
  fixed: "배송 복구 · 수정 후보",
  baseline: "기존 환경도 위반",
  error: "후보 실행 오류",
};
export const cases = [
  {
    id: "T01",
    name: "정상 주문",
    input: "결제 완료 · 재고 10 · 주문 2",
    stock: 8,
    delivery: 1,
  },
  {
    id: "T02",
    name: "재고 경계값",
    input: "결제 완료 · 재고 2 · 주문 2",
    stock: 0,
    delivery: 1,
  },
  {
    id: "T03",
    name: "결제 실패",
    input: "결제 실패 · 재고 10 · 주문 2",
    stock: 10,
    delivery: 0,
  },
  {
    id: "T04",
    name: "재고 부족",
    input: "결제 완료 · 재고 1 · 주문 2",
    stock: 1,
    delivery: 0,
  },
];
export const stages = [
  "설정 확인",
  "기준 실행",
  "후보 업데이트",
  "비교·분석",
  "자원 정리",
  "알림",
];
export function caseResult(scenario: Scenario, index: number) {
  if (scenario === "error") return "미검증";
  if (index > 1 || scenario === "fixed") return "통과";
  return scenario === "baseline" ? "기준 확인 필요" : "규칙 위반";
}
export function verdict(scenario: Scenario) {
  return {
    defect: "회귀 의심",
    fixed: "전체 통과",
    baseline: "기준 확인 필요",
    error: "실행 오류 · 미검증",
  }[scenario];
}
