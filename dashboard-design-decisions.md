# OSSGuard 대시보드 설계 판단

2026-10-31. 기준: `../docs/OSSGuard_MVP_구현계획_기능명세서.md`.

검증하려는 질문은 “업데이트한 프로그램이 승인된 업무를 계속 수행하는가”다. 운영 트래픽·지연시간·성공률 같은 미수집 지표를 대시보드 장식으로 만들지 않는다.

## 참고한 여러 화면과 적용

로그인된 타사 계정의 프로젝트를 조사하지 않았다. 아래 공식 설명의 화면 흐름과 공개된 제품 화면을 조사했다. Vercel의 배포 요약·빌드 로그와 Grafana Explore 분할 화면은 브라우저에서도 시각적으로 확인했다. Supabase와 OpenAI의 콘솔 전체를 직접 사용성 검증한 것은 아니다.

| 공식 자료 | 화면이 해결하는 문제 | OSSGuard 적용 |
| --- | --- | --- |
| [Vercel 프로젝트·배포 상세](https://vercel.com/docs/deployments) | 프로젝트 맥락에서 개별 실행의 소스·상태로 진입 | 개요의 최근 검증 → 검증 실행 → 실행 상세 |
| [Vercel 배포 관리](https://vercel.com/docs/deployments/managing-deployments) | 여러 실행 중 하나를 선택해 조사 | 사이드바의 검증 실행을 결과 상세에서도 활성 상태로 유지 |
| [Vercel 빌드 로그](https://vercel.com/docs/deployments/logs) | 빌드 오류를 실행 증거와 연결 | 단계 버튼 → 해당 단계의 실행·로그 탭. 빌드 실패는 이 탭으로 먼저 진입 |
| [Vercel Observability](https://vercel.com/docs/observability) | 집계에서 구체적인 요청으로 좁혀 조사 | 전체 판정 요약 → 개별 업무 테스트 → 선택 호출 증거 |
| [Supabase Logs](https://supabase.com/docs/guides/observability/logs) | 필터한 목록의 한 이벤트를 상세 패널에서 조사 | 공통 결과 필터, 테스트 목록·선택기, A/B 원본 기록. 빈 검색과 미수집을 구분 |
| [Supabase Advisors](https://supabase.com/docs/guides/observability/advisors) | 발견한 문제의 의미와 해결 경로 연결 | 확인된 사실·원인 후보·다음 확인을 분리해 설명 |
| [OpenAI Datasets](https://developers.openai.com/api/docs/guides/evaluation-getting-started) | 같은 입력과 기준으로 여러 변형을 평가 | 편집 가능한 업무 테스트와 결과의 불변 스냅샷을 분리 |
| [OpenAI agent evaluations](https://developers.openai.com/api/docs/guides/agent-evals) | 요약 판정만으로 설명되지 않는 워크플로를 조사 | 테스트 판정 → 관측 호출 순서 → 원본 증거. 내부 호출을 추정해 그리지 않음 |
| [Grafana Explore](https://grafana.com/docs/grafana/latest/visualizations/explore/get-started-with-explore/) | 같은 맥락을 유지하며 두 환경을 나란히 비교 | 기준 A/후보 B의 버전·기대값·관측값을 고정 위치에 표시 |
| [Grafana panel overview](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/panel-overview/) | 요약 패널에서 상세 탐색으로 이동 | 프로젝트 개요는 상태와 다음 행동에 집중, 상세 조사 도구는 실행 화면으로 이동 |

## 정보 구조

- 워크스페이스: 프로젝트. 서버 연결 시 로컬 초안의 ‘최근 변경’ 메뉴는 숨긴다. 로컬 초안 모드의 기존 생성·수정 기록은 검증 이력과 분리한다.
- 선택 프로젝트: 개요, 검증 실행, 업무 테스트, 실행 설정.
- 실행 상세: 업무 비교, 변경 증거, 실행·로그. 결과 상세는 검증 실행에 속한다.
- 계정·워크스페이스 설정은 기존 계정 메뉴를 사용한다. 프로젝트 실행 설정과 같은 메뉴로 섞지 않는다.

개요에서는 최근 검증 판정·업데이트할 패키지·기준/목표 버전·설정 준비도를 확인한다. 서버 프로젝트의 검증 실행은 API에서 받은 실행 ID·시각·상태를 표시하고, 각 상세는 당시 불변 스냅샷을 읽는다. 동일 버전은 대조군으로 표시한다. 화면 예시·로컬 초안은 서버 이력과 분리한다.

## 비교 전용 컴포넌트

`AssertionComparison`은 표를 대신해 기준·후보를 같은 위치에 놓고 각 기대값의 충족/위반/미수집을 표시한다. A/B 값이 달라진 항목부터 배치하여 HTTP 상태가 같아도 배송 요청 누락을 먼저 읽을 수 있게 한다. 같은 값이 양쪽에서 기대값을 위반할 때도 두 값을 각각 위반으로 표시한다.

`RequestComparison`은 수집한 호출 순서와 처음 달라진 지점을 보여주고, 호출을 선택하면 양쪽 기록이 함께 바뀐다. 좁은 화면에서는 같은 단계의 A/B 노드를 세로로 정렬하여 가로 스크롤 없이 비교한다. 넓은 화면은 원래의 수집 순서 연결선을 유지한다.

`RunSummary`는 실제 결과의 통과·확인 필요·미검증 건수와 테스트별 분포를 보여준다. 미검증을 통과나 회귀로 합치지 않는다. `OBSERVATION_ERROR`는 배송 0회와 다르며, 빌드 실패는 후보 업무 회귀로 표현하지 않는다.

## 디자인 시스템과 확인

기존 Geist/한국어 글꼴·타이포그래피 역할·semantic color·Card/Button/Badge/Select/Tabs 변형을 사용한다. 결과의 붉은 강조는 업무 차이와 기대값 위반에만 사용하고 미수집은 중립색과 텍스트로 표현한다. 아이콘·숫자·레이블을 함께 사용해 색상만으로 판정하지 않는다.

발견해 수정한 문제: 모바일 디자인 시스템 소개 타일에서 견본과 레이블의 겹침, 테스트 이름의 말줄임, 모바일에 없던 결과 필터와 빈 필터 결과, 비교 콘텐츠의 최소 너비 처리.

화면 점검 자료는 `output/design-review/`에 보관한다. 후속 통합 점검에서 실제 Runner·Docker·WireMock과 브라우저 연동을 확인했다. 소스 전달은 로컬 샘플 대역이며 유료 AI·실제 이메일·GCP 권한은 미확인이다. 연결 방법과 확인 범위는 `INTEGRATION.md`를 따른다.
