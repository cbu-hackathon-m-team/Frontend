export const purchaseDemo = {
  name: "주문·출고 호환성 검증",
  repository: "https://github.com/cbu-hackathon-m-team/OSSGuard-Purchase-Demo",
  ref: "main",
  packageName: "pydantic",
  targetVersion: "2.12.5",
  rule: "결제 완료이고 재고가 충분하면 응답 재고를 주문 수량만큼 줄이고 배송 API를 1회 호출한다. 결제 실패·재고 부족이면 배송 API를 호출하지 않는다.",
} as const;
