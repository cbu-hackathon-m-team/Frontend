import styles from "./landing-ossguard.module.css";
import { ExecutionHeroArt } from "./landing-execution-visuals";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Braces,
  GitBranch,
  Layers2,
  ListChecks,
  Menu,
  Network,
  Package,
  Play,
  ShieldCheck,
} from "lucide-react";
import { HeaderAccountMenu } from "@/components/auth/header-account-menu";
import { usePreviewSession } from "@/lib/preview-session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  AnalysisPreview,
  ComparisonPreview,
  EvidencePreview,
  MockPreview,
  NotificationPreview,
  SetupPreview,
  TestsPreview,
} from "./landing-ossguard-previews";

import {
  ProductArtwork,
  type ArtworkKind,
} from "./landing-product-artwork";

const demo = "/dashboard?project=python-uv-demo&tab=results";
type MenuGroup = [string, ...[string, string][]];
const menus: Record<string, MenuGroup[]> = {
  제품: [
    [
      "OSSGuard로 할 수 있는 일",
      ["업데이트 전후 비교", "#comparison"],
      ["업무 기준과 테스트", "#agents"],
      ["변경 내역과 실행 근거", "#platform"],
    ],
  ],
  "검증 과정": [
    [
      "처음부터 결과까지",
      ["저장소와 버전 선택", "#canvas"],
      ["테스트 검토와 승인", "#agents"],
      ["실행 결과 확인", "#comparison"],
    ],
  ],
  도움말: [
    [
      "시작 전 확인하세요",
      ["현재 지원 범위", "#support"],
      ["자주 묻는 질문", "#faq"],
      ["결과 예시", demo],
    ],
  ],
};
const footerColumns = [
  {
    title: "제품",
    links: [
      ["실행 비교", "#comparison"],
      ["업무 기준과 테스트", "#agents"],
      ["변경 내역과 실행 근거", "#platform"],
    ],
  },
  {
    title: "시작하기",
    links: [
      ["대시보드", "/dashboard"],
      ["결과 예시", demo],
      ["지원 범위", "#support"],
    ],
  },
  {
    title: "도움말",
    links: [
      ["검증 과정", "#canvas"],
      ["자주 묻는 질문", "#faq"],
    ],
  },
];
const agents = [
  {
    title: "평소 지키던 업무 규칙을 테스트로",
    copy: "‘정상 주문은 배송을 한 번 요청한다’처럼 기준을 적어 주세요. AI 연동으로 만든 초안이나 직접 작성한 테스트를 검토하고, 요청과 기대값을 확인한 뒤 승인합니다.",
    preview: TestsPreview,
  },
  {
    title: "선택한 버전을 실제로 설치하고 실행",
    copy: "같은 커밋에서 라이브러리 버전을 바꿔 새로 빌드합니다. 변경 파일과 잠금 파일, 실제로 설치된 버전까지 남겨 어떤 조건에서 나온 결과인지 확인할 수 있습니다.",
    preview: EvidencePreview,
  },
  {
    title: "결과와 확인할 내용을 함께 전달",
    copy: "실행 결과는 대시보드에 남습니다. 서버의 이메일 연동과 수신 주소를 설정하면 요약과 결과 링크를 받을 수 있습니다. AI 설명에서도 확인된 사실과 원인 후보를 구분합니다.",
    preview: NotificationPreview,
  },
];
const platform: { title: string; artwork: ArtworkKind; label: string; copy: string }[] = [
  { title: "같은 조건에서 비교", artwork: "versions", label: "같은 커밋에서 두 버전을 실행하는 예시", copy: "같은 커밋과 테스트에서 버전만 바꿉니다. 별도의 검증 환경에서 실행합니다." },
  { title: "변경부터 설치까지, 실행 근거", artwork: "evidence", label: "변경 파일과 설치 버전을 연결한 증거 예시", copy: "변경 파일과 잠금 파일, 함께 바뀐 패키지와 실제 설치 버전을 남깁니다." },
  { title: "근거에 연결된 AI 설명", artwork: "analysis", label: "확인한 사실과 원인 후보를 구분한 예시", copy: "응답과 외부 호출 기록을 바탕으로, 확인된 사실과 원인 후보를 구분합니다." },
  { title: "다시 확인할 수 있는 결과", artwork: "history", label: "실행 ID로 당시 조건과 결과를 확인하는 예시", copy: "실행 ID에 당시의 조건과 결과를 보관합니다. 응답과 호출 기록, 빌드 로그를 다시 확인할 수 있습니다." },
];
const useCases: {
  title: string;
  copy: string;
  image: string;
  imageHeight: number;
  label: string;
}[] = [
  {
    title: "응답은 성공인데, 배송은?",
    copy: "정상 주문 뒤에 배송 API를 호출했는지 확인합니다.",
    image: "shipping",
    imageHeight: 1046,
    label: "배송 차량에 택배 상자를 싣는 작업자들",
  },
  {
    title: "재고 계산도 그대로일까요?",
    copy: "응답에 담긴 남은 재고를 비교합니다.",
    image: "inventory",
    imageHeight: 1067,
    label: "상품 상자가 적재된 물류 창고 선반",
  },
  {
    title: "실패한 주문은 배송하지 않도록",
    copy: "결제 실패 시 배송 요청이 없는지도 확인합니다.",
    image: "payment",
    imageHeight: 2400,
    label: "카드 결제 단말기에 카드를 대는 손",
  },
  {
    title: "데이터가 바뀌었다면",
    copy: "JSON 값이 기대한 값인지 살펴봅니다.",
    image: "data",
    imageHeight: 1067,
    label: "데이터 처리 코드와 테스트 파일이 열린 개발 화면",
  },
  {
    title: "빌드에서 멈췄다면, 멈춘 단계부터",
    copy: "실패 단계와 실행하지 못한 테스트를 구분합니다.",
    image: "build",
    imageHeight: 1067,
    label: "Python 코드와 터미널이 열린 노트북",
  },
  {
    title: "모든 차이가 실패는 아닙니다",
    copy: "시간이나 임의 ID를 제외해 응답 차이를 살펴봅니다. 판정은 승인한 기대값을 기준으로 합니다.",
    image: "review",
    imageHeight: 2400,
    label: "노트북에서 코드를 검토하며 작업하는 개발자",
  },
];
const faqs = [
  {
    question: "어떤 프로젝트를 검증할 수 있나요?",
    answer:
      "현재는 팀 워크스페이스에서 허용한 공개 GitHub 저장소를 지원합니다. Python 3.12, pyproject.toml, uv.lock, 지정 Dockerfile과 HTTP API가 필요합니다. 한 번에 프로젝트가 직접 사용하는 패키지 하나의 목표 버전을 선택합니다.",
  },
  {
    question: "저장소 주소만 넣으면 알아서 검증하나요?",
    answer:
      "실행 방법과 정상 기준이 필요합니다. 실행 포트와 준비 확인 경로, 검증용 환경변수, 테스트 요청과 기대값을 설정해 주세요. 저장소의 ossguard.json을 가져오거나 화면에서 확인할 수 있습니다.",
  },
  {
    question: "실제 배송이나 결제가 일어나나요?",
    answer:
      "외부 API는 검증용 모의 API로 연결해 응답과 호출 횟수를 확인합니다. 현재 지원하는 검증에서는 운영 DB나 실제 결제·배송 서비스를 연결하지 않습니다.",
  },
  {
    question: "AI가 테스트 결과를 결정하나요?",
    answer:
      "사용자가 승인한 기대값과 실제 실행 기록으로 결과를 판정합니다. AI 연동을 설정하면 테스트 초안과 원인 후보 설명을 돕습니다. AI 설명이 실패하더라도 저장된 실행 결과와 근거는 확인할 수 있습니다.",
  },
  {
    question: "통과하면 바로 업데이트해도 되나요?",
    answer:
      "기준 충족은 승인한 테스트 범위에서의 결과입니다. 테스트하지 않은 기능까지 보장하지는 않습니다. OSSGuard는 임시 작업본에서 검증하며 원격 저장소나 운영 서버에 변경을 적용하지 않습니다.",
  },
];

function LandingHeader() {
  const [open, setOpen] = useState("");
  const signedIn = usePreviewSession();
  return (
    <header className="fr-header">
      <div className="fr-header-inner fr-container">
        <Link to="/" className="fr-brand" aria-label="OSSGuard 홈">
          <Layers2 aria-hidden="true" />
          OSSGuard
        </Link>
        <div className="fr-desktop-nav">
          <NavigationMenu
            value={open}
            onValueChange={setOpen}
            aria-label="주 메뉴"
          >
            <NavigationMenuList>
              {Object.keys(menus).map((name) => (
                <NavigationMenuItem key={name} value={name}>
                  <NavigationMenuTrigger variant="text">
                    {name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="fr-system-mega">
                      {menus[name].map(([title, ...items]) => (
                        <div key={title}>
                          <p>{title}</p>
                          {items.map(([label, href]) => (
                            <NavigationMenuLink key={label} asChild>
                              <a href={href} onClick={() => setOpen("")}>
                                {label}
                              </a>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <a href="#support">지원 범위</a>
        </div>
        <div className="fr-header-actions">
          {signedIn ? (
            <HeaderAccountMenu />
          ) : (
            <>
              <Link to="/login" className="fr-login">
                로그인
              </Link>
              <Button asChild>
                <a href="#start">시작하기</a>
              </Button>
            </>
          )}
          <div className="fr-mobile-toggle">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon-sm" variant="ghost" aria-label="메뉴 열기">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" closeLabel="닫기">
                <SheetHeader>
                  <SheetTitle>OSSGuard</SheetTitle>
                </SheetHeader>
                <div className={`fr-mobile-nav ${styles["og-mobile-nav"]}`}>
                  {Object.entries(menus).map(([name, groups]) => (
                    <div key={name}>
                      <p>{name}</p>
                      {groups
                        .flatMap(([, ...items]) => items)
                        .map(([label, href]) => (
                          <SheetClose key={label} asChild>
                            <a href={href}>{label}</a>
                          </SheetClose>
                        ))}
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Landing() {
  useEffect(() => {
    const title = document.title;
    document.title = "OSSGuard — 업데이트 전후, 업무 결과까지 확인하세요";
    return () => {
      document.title = title;
    };
  }, []);
  return (
    <div className={`fr-page ${styles["og-landing"]}`}>
      <a href="#main-content" className="fr-skip">
        본문으로 건너뛰기
      </a>
      <LandingHeader />
      <main id="main-content">
        <section className="fr-hero fr-container" aria-labelledby="fr-title">
          <div className={styles["og-hero-stage"]}>
            <ExecutionHeroArt />
            <div className={styles["og-hero-copy"]}>
              <h1 id="fr-title">업데이트 전후,<br />업무 결과까지 확인하세요.</h1>
              <p>라이브러리를 바꾼 뒤에도 주문과 배송이 제대로 이어질까요? OSSGuard가 기존 버전과 새 버전을 실행해 응답과 외부 API 호출을 비교합니다.</p>
              <div className={styles["og-hero-buttons"]}>
                <Button asChild><Link to="/dashboard">검증 시작하기 <ArrowRight data-icon="inline-end" /></Link></Button>
                <Button variant="outline" asChild><Link to={demo}>결과 예시 보기</Link></Button>
              </div>
            </div>
          </div>
          <div id="comparison">
            <ComparisonPreview />
          </div>
        </section>
        <div
          className={`fr-customer-logos fr-container ${styles["og-stack"]}`}
          aria-label="현재 지원 환경"
        >
          {[
            { name: "Python 3.12", icon: "python" },
            { name: "uv", icon: "uv" },
            { name: "GitHub", icon: "github" },
            { name: "Docker", icon: "docker" },
          ].map((item) => (
            <span key={item.icon}>
              <span
                className={styles["og-stack-mark"]}
                data-logo={item.icon}
                aria-hidden="true"
              />
              {item.name}
            </span>
          ))}
          <span>
            <Braces aria-hidden="true" />
            HTTP API
          </span>
          <span>
            <Network aria-hidden="true" />
            WireMock
          </span>
        </div>
        <section className="fr-section fr-container" id="canvas">
          <h2>
            바꿀 버전을 고르고,
            <br />
            확인할 기준을 정하세요.
          </h2>
          <div className={styles["og-preparation"]}>
            <SetupPreview />
            <div className={styles["og-preparation-copy"]}>
              <Badge variant="muted">검증 준비</Badge>
              <h3>
                무엇을 바꿨는지,
                <br />
                무엇을 확인했는지 분명하게.
              </h3>
              <p>
                저장소와 목표 버전을 선택하고 실행 방법과 테스트를 확인하세요.
                같은 커밋의 기존 버전과 새 버전을 각각 실행해 결과를 비교합니다.
              </p>
              <a href="#support">
                내 프로젝트의 지원 조건 확인 <ArrowRight />
              </a>
            </div>
          </div>
          <div className="fr-principles">
            <article>
              <GitBranch />
              <h3>저장소와 버전 선택</h3>
              <p>
                공개 GitHub 저장소에서 변경할 Python 패키지와 목표 버전을
                선택합니다.
              </p>
            </article>
            <article>
              <ListChecks />
              <h3>업무 기준 확인</h3>
              <p>
                요청과 기대값을 검토하고 승인합니다. 직접 작성한 테스트도 사용할
                수 있습니다.
              </p>
            </article>
            <article>
              <Play />
              <h3>실행하고 결과 비교</h3>
              <p>
                응답과 외부 호출을 비교해 통과한 기준과 어긋난 부분을
                확인합니다.
              </p>
            </article>
          </div>
        </section>
        <section className="fr-section fr-container" id="agents">
          <div className="fr-section-heading">
            <h2>
              지켜야 할 업무 규칙을
              <br />
              테스트로 남기세요.
            </h2>
            <Button variant="secondary" asChild>
              <Link to={demo}>테스트 예시 살펴보기</Link>
            </Button>
          </div>
          <div className="fr-agent-layout">
            <div className="fr-agent-cards">
              {agents.map((item) => (
                <article className="fr-agent-card" key={item.title}>
                  <div className={`fr-agent-image ${styles["og-artboard"]}`}>
                    <item.preview />
                  </div>
                  <div className="fr-agent-description">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.copy}</p>
                    </div>
                    <Link to="/dashboard">
                      대시보드 열기 <ArrowRight />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="fr-agent-aside">
              <AnalysisPreview />
            </div>
          </div>
          <article className="fr-connect" id="connect">
            <div>
              <MockPreview />
              <div className="fr-connect-copy">
                <h3>외부 호출도 테스트의 일부로.</h3>
                <p>
                  배송 API 같은 외부 서비스는 모의 API로 연결합니다. 응답뿐
                  아니라 실제로 보낸 요청과 횟수까지 확인합니다.
                </p>
              </div>
            </div>
            <div className={styles["og-connect-note"]}>
              <ShieldCheck />
              <h3>검증을 위한 실행 환경.</h3>
              <p>
                검증용 설정과 환경변수를 사용해 별도의 컨테이너에서 실행합니다.
                외부 API의 응답도 두 버전에서 같은 조건으로 맞춥니다.
              </p>
              <a href="#faq">
                검증 환경 자세히 알아보기 <ArrowRight />
              </a>
            </div>
          </article>
        </section>
        <section className="fr-section fr-container" id="platform">
          <div className="fr-section-heading">
            <div>
              <h2>
                무엇이 달라졌는지,
                <br />
                근거를 따라 확인하세요.
              </h2>
              <p className="fr-section-intro">
                변경한 파일, 실제 설치 버전, 테스트 결과를 함께 남깁니다. 어떤
                조건에서 어디까지 확인했는지 살펴보세요.
              </p>
            </div>
          </div>
          <div className={styles["og-platform-grid"]}>
            {platform.map((item) => (
              <article
                key={item.title}
                className="fr-feature"
              >
                <div className={`fr-feature-image ${styles["og-feature"]}`}>
                  <ProductArtwork kind={item.artwork} label={item.label} />
                </div>
                <div className={styles["og-feature-caption"]}>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="fr-section fr-container" id="showcase">
          <div className="fr-section-heading">
            <h2>
              성공 응답만으로는
              <br />알 수 없던 것들.
            </h2>
            <Button variant="secondary" asChild>
              <Link to={demo}>실행 비교 예시 보기</Link>
            </Button>
          </div>
          <div className="fr-showcase">
            {useCases.map((item, i) => (
              <article
                className={`fr-site fr-site-${i + 1} ${styles["og-use-case"]}`}
                key={item.title}
              >
                <div className={styles["og-case-photo"]} data-subject={item.image}>
                  <img
                    src={`/images/ossguard/showcase/${item.image}.jpg`}
                    alt={item.label}
                    width={1600}
                    height={item.imageHeight}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className={styles["og-case-caption"]}>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
          <p className={styles["og-section-note"]}>
            주문·배송 시연 앱과 설정 가능한 테스트 기준을 설명한 예시입니다.
          </p>
        </section>
        <section className="fr-section fr-container" id="support">
          <div className="fr-section-heading">
            <h2>
              내 프로젝트는
              <br />
              어디까지 검증할 수 있나요?
            </h2>
          </div>
          <div className={`fr-principles ${styles["og-support"]}`}>
            <article>
              <GitBranch />
              <h3>허용된 공개 저장소</h3>
              <p>
                팀 워크스페이스에 등록된 GitHub 공개 저장소와 고정한 커밋을
                사용합니다.
              </p>
            </article>
            <article>
              <Package />
              <h3>Python 3.12 · uv</h3>
              <p>
                pyproject.toml, uv.lock, 지정 Dockerfile이 있는 프로젝트를
                지원합니다.
              </p>
            </article>
            <article>
              <ListChecks />
              <h3>HTTP API와 기대값</h3>
              <p>
                실행 설정과 검증용 환경변수, HTTP 요청·응답·외부 호출 기준을
                준비해 주세요.
              </p>
            </article>
          </div>
        </section>
        <section className="fr-section fr-container" id="faq">
          <div className="fr-section-heading">
            <h2>
              시작하기 전에
              <br />
              궁금한 점을 확인하세요.
            </h2>
          </div>
          <Accordion type="single" collapsible>
            {faqs.map((item, i) => (
              <AccordionItem key={item.question} value={`question-${i}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className={styles["og-faq-answer"]}>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <section className="fr-start fr-container" id="start">
          <h2>
            다음 업데이트,
            <br />
            업무 결과까지 확인하고 결정하세요.
          </h2>
          <div className={`fr-prompt ${styles["og-start-panel"]}`}>
            <ShieldCheck />
            <p>
              저장소와 목표 버전을 고르면
              <br />
              검증 준비부터 결과 확인까지 이어집니다.
            </p>
            <Button asChild>
              <Link to="/dashboard">
                대시보드 열기 <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <p className="fr-prompt-note">
            현재는 팀 워크스페이스에서 허용된 Python/uv 프로젝트를 검증할 수
            있습니다.
          </p>
        </section>
      </main>
      <footer className="fr-footer fr-container">
        <div className={`fr-footer-columns ${styles["og-footer-columns"]}`}>
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map(([label, href]) => (
                <a key={label} href={href}>
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="fr-footer-bottom">
          <Link to="/" className="fr-brand" aria-label="OSSGuard 홈">
            <Layers2 aria-hidden="true" />
            OSSGuard
          </Link>
          <span>OSSGuard © 2026</span>
        </div>
      </footer>
    </div>
  );
}
