# OSSGuard Frontend

Python 의존성 업데이트 전후의 HTTP 응답과 외부 API 호출을 비교하는 OSSGuard의 웹 UI입니다. 저장소 등록, 버전 선택, 테스트 승인, 검증 실행과 결과 확인을 연결합니다. 랜딩 페이지, 디자인 시스템, 발표 화면도 포함합니다.

실제 빌드·실행·판정은 별도 백엔드가 담당합니다. 백엔드 설치와 지원 프로젝트 규격은 [백엔드 README](https://github.com/cbu-hackathon-m-team/Backend/blob/main/README.md), API 연결 상세는 [INTEGRATION.md](INTEGRATION.md)를 참고하세요.

## 주요 기능과 구현 범위

- 서버 프로젝트 등록과 소스 검사, 패키지·목표 버전 선택
- 실행 환경, 업무 규칙, HTTP 테스트와 모의 API 설정 및 테스트 승인
- 검증 접수, 진행 상태 조회, 실행 이력과 A/B 응답·외부 호출·변경 파일 확인
- 서버에서 제공하는 AI 설명과 이메일 처리 상태 표시
- 백엔드 없이 볼 수 있는 화면 예시와 브라우저에 저장하는 로컬 초안

`/login`은 프론트엔드 미리보기용입니다. 입력한 아이디·비밀번호를 인증 서버에 전송하지 않으며, 실제 사용자 인증이나 권한 검사를 제공하지 않습니다. 검증 API를 사용하려면 별도로 서버 접근 키를 연결해야 합니다. 멤버 초대·요금제·결제 기능은 화면 골격이며 실제 서비스에 연결되어 있지 않습니다. 일부 공통 UI에는 디자인 시스템의 작업명인 Hapalin이 남아 있습니다.

## 기술 구성

| 구분 | 사용 기술 |
| --- | --- |
| UI | React 19, TypeScript, React Router 7 |
| 개발·빌드 | Vite 7, pnpm |
| 스타일 | Tailwind CSS 4, CSS Modules, 공유 디자인 토큰 |
| 컴포넌트 | shadcn 기반 UI, Radix UI, Lucide, Sonner |
| 테스트 | Vitest, jsdom, React Testing Library |
| 코드 검사 | ESLint, TypeScript, 자체 디자인 린트 |

## 로컬 실행

필수 도구는 **Node.js 22.12.0 이상**, **pnpm 10.30.1**입니다. 아래 명령은 프로젝트 루트에서 시작합니다.

```powershell
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다. 포트 3000이 사용 중이면 다른 포트로 자동 전환하지 않고 종료합니다. 개발 서버 시작 시 타이포그래피 생성 스크립트가 먼저 실행됩니다.

랜딩·디자인 시스템·발표·예시 화면은 백엔드 없이 열 수 있습니다. 실제 검증에는 백엔드 API, PostgreSQL, Runner와 결과 Worker가 필요하며 실행 방법은 백엔드 README에 있습니다.

### 실제 검증 서버 연결

1. 백엔드를 `http://127.0.0.1:8000`에서 실행합니다.
2. [서버 연결 설정](http://localhost:3000/dashboard/settings#server-connection)에 접속합니다.
3. 서버의 `OSSGUARD_API_TOKEN`과 일치하는 접근 키를 입력하고 **서버 연결**을 누릅니다.
4. 대시보드에서 프로젝트 등록 → 소스 확인 → 버전·환경 설정 → 테스트 저장·승인 → 검증 시작 순서로 진행합니다.

Vite가 `/api` 요청을 기본 백엔드 주소로 프록시하므로 로컬 기본 구성에서는 프론트엔드 환경 파일이 필요하지 않습니다. 대상 저장소는 백엔드 허용 목록에 등록되어 있어야 합니다. AI 초안·분석과 이메일 발송은 백엔드의 관련 연동 설정이 필요합니다.

접근 키는 현재 탭의 `sessionStorage`에 저장되고 연결 해제 시 삭제됩니다. 로그인 미리보기 상태와 서버 접근 키는 별개입니다.

## 환경 설정

| 변수 | 용도 | 기본값 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 브라우저가 호출할 API origin. 끝에 `/api`를 붙이지 않습니다. | 빈 값: 현재 origin의 `/api` 사용 |
| `OSSGUARD_DEV_API_TARGET` | 개발 서버의 `/api` 프록시 대상. Vite 실행 프로세스의 환경변수로 지정합니다. | `http://127.0.0.1:8000` |

API origin을 지정할 때는 `.env.example`을 참고해 `.env.local`을 만듭니다. 실제 접근 키나 AI·메일 키는 `VITE_*` 변수에 넣지 않습니다. 이 변수는 브라우저 번들에 포함됩니다.

다른 개발용 백엔드를 사용할 때의 PowerShell 예시입니다.

```powershell
$env:OSSGUARD_DEV_API_TARGET = "http://127.0.0.1:8001"
pnpm dev
```

`VITE_API_BASE_URL`을 별도 origin으로 지정하면 개발 프록시를 거치지 않습니다. 이 경우 백엔드 `OSSGUARD_CORS_ORIGINS`에 프론트엔드의 정확한 origin을 허용해야 합니다. 환경변수를 바꾼 뒤 개발 서버를 재시작하세요.

## 주요 화면

| 경로 | 내용 |
| --- | --- |
| `/` | 제품 소개와 인터랙티브 비교 예시 |
| `/dashboard` | 서버 프로젝트 목록과 검증 작업 |
| `/dashboard?project=<서버 프로젝트 UUID>` | 실제 서버 프로젝트의 검증 화면 |
| `/dashboard?project=python-uv-demo&tab=results` | 고정 예시 데이터로 구성한 결과 화면 |
| `/dashboard?mode=drafts`, `/dashboard/projects` | 브라우저 로컬 초안 관리 |
| `/dashboard/activity` | 로컬 프로젝트의 최근 변경 정보 |
| `/dashboard/settings` | 서버 연결 및 워크스페이스 설정 |
| `/dashboard/settings/appearance` | 화면 모드 설정 |
| `/dashboard/settings/members`, `/dashboard/settings/plans`, `/dashboard/settings/invoices` | 멤버·구독 관련 미연동 화면 |
| `/validations/:runId` | 이메일 등의 링크로 실제 서버 실행 결과 열기 |
| `/design-system` | 색상·타이포그래피·컴포넌트와 Blue 강조색 설정 |
| `/ppt` | 웹 발표 화면. 조작법은 [발표 README](src/pages/presentation/README.md) 참고 |
| `/login` | 프론트엔드 미리보기 로그인 |

화면 예시를 조작해도 서버 검증이 실행되지는 않습니다. 실제 실행 결과는 서버 프로젝트와 실행 ID를 통해 조회합니다. 서버 실행에는 승인한 테스트가 필요합니다.

## 코드 구조와 데이터 흐름

```text
src/
  main.tsx                  앱 진입점과 공통 Provider
  App.tsx                   라우팅
  pages/                    랜딩·로그인·대시보드·설정
    design-system/          디자인 시스템 카탈로그
    presentation/           웹 발표
  components/
    ossguard/               검증 설정·테스트 편집·실행 결과
      api.ts                API 타입과 Bearer 요청 클라이언트
      backend-context.tsx   서버 연결과 프로젝트 조회 상태
      server-console.tsx    서버 프로젝트의 작업 흐름
      validation-detail.tsx 실행 상세와 관측 근거
    dashboard/              공통 레이아웃·탐색·로컬 워크스페이스
    auth/                   미리보기 로그인과 계정 메뉴
    ui/                     공유 UI 컴포넌트
    providers/              화면 모드와 강조색
  styles/                   공유 토큰·타이포그래피·전역 스타일
  lib/                      공통 유틸리티
  test/                     테스트 초기 설정
public/                     이미지·폰트 외 정적 자산
scripts/                    타이포그래피 생성과 디자인 린트
```

서버 화면은 `BackendProvider`가 관리하는 연결을 통해 `GuardApi`를 호출합니다. 개발 환경에서는 Vite 프록시를 거쳐 FastAPI에 요청하고, 실제 실행과 근거 보관은 백엔드가 담당합니다. 로컬 초안·워크스페이스와 화면 모드는 브라우저 저장소를 사용합니다. 로컬 데이터를 바꿔도 서버의 과거 실행 스냅샷은 바뀌지 않습니다.

스타일 수정 시 [DESIGN.md](DESIGN.md), `src/styles/tokens.css`, `src/styles/typography.css`와 기존 `components/ui`를 먼저 확인하세요. 최초 접속의 기본값은 다크 모드와 Blue 강조색이며 저장된 사용자 설정이 우선합니다.

## 개발 명령과 검증

명령은 `frontend` 디렉터리에서 실행합니다.

| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | 타이포그래피 생성 후 개발 서버 시작 |
| `pnpm build` | 타이포그래피 생성 → 타입 검사 → `dist/` 빌드 |
| `pnpm preview` | 빌드한 `dist/`를 포트 3000에서 확인 |
| `pnpm typecheck` | TypeScript 타입 검사 |
| `pnpm lint` | ESLint 검사 |
| `pnpm test` | `src/**/*.test.{ts,tsx}` 실행 |
| `pnpm test:design-lint` | 자체 디자인 린트 규칙 테스트 |
| `pnpm typography:check` | 생성된 타이포그래피 파일의 동기화 검사 |
| `pnpm typography:generate` | 타이포그래피 CSS·카탈로그·DESIGN.md 생성 내용 갱신 |

특정 작업 흐름만 확인할 수도 있습니다.

```powershell
pnpm test -- src/components/ossguard/backend-workflow.test.tsx
pnpm test -- src/pages/landing-language.test.tsx
```

Vitest의 API 대역 테스트와 실제 서버·Docker 통합 검증은 구분합니다. 통합 검증 범위와 기록은 [INTEGRATION.md](INTEGRATION.md)에 정리되어 있습니다.

## 빌드와 배포

```powershell
pnpm build
pnpm preview
```

배포 산출물은 `dist/`입니다. `preview`는 빌드 결과 확인용이며, `vite.config.ts`의 개발용 `/api` 프록시는 프로덕션 배포에 포함되지 않습니다.

- **별도 API origin:** 배포 빌드 환경에 `VITE_API_BASE_URL`을 설정하고 백엔드에 프론트엔드 origin을 허용합니다. 값 변경 후 다시 빌드해야 합니다.
- **같은 origin:** `VITE_API_BASE_URL`을 비우고 호스팅의 `/api` 경로를 백엔드로 프록시합니다. `/api`를 SPA 폴백보다 먼저 처리해야 합니다.
- **SPA 경로:** `/dashboard`, `/ppt`, `/validations/:runId` 직접 접속도 `index.html`로 연결해야 합니다. Vercel용 `vercel.json`에는 SPA rewrite가 포함되어 있습니다. 이 파일에는 별도 API 프록시 설정이 없습니다.

## 자주 발생하는 문제

| 증상 | 확인할 사항 |
| --- | --- |
| 개발 서버가 시작되지 않음 | Node 버전, pnpm 설치, 포트 3000 사용 여부 |
| 서버 연결 실패 또는 JSON 응답 오류 | API 실행 여부, API origin, 개발 프록시 대상. 배포 환경에서 `/api`가 `index.html`로 처리되지 않는지 확인 |
| 다른 origin의 API 요청이 차단됨 | 백엔드 CORS에 정확한 프론트엔드 origin이 있는지 확인. `localhost`와 `127.0.0.1`은 서로 다른 origin |
| 로그인했는데 실제 프로젝트를 볼 수 없음 | 미리보기 로그인과 별도로 설정 화면에서 서버 접근 키 연결 |
| 검증이 대기 상태에서 진행되지 않음 | 백엔드 Runner 실행 여부 확인 |
| AI 설명이나 이메일만 처리되지 않음 | 백엔드 연동 키와 결과 Worker 설정 확인 |
| 배포된 상세 경로를 새로고침하면 404 | 호스팅의 SPA 폴백 설정 확인 |
| 타입 검사에서 빌드가 멈춤 | 표시된 TypeScript 오류 해결. `build`는 타입 검사를 생략하지 않음 |
