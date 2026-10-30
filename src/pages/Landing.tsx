import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { DashboardThemeToggle } from "@/components/dashboard/sidebar";
import { HeaderAccountMenu } from "@/components/auth/header-account-menu";
import { usePreviewSession } from "@/lib/preview-session";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Download,
  Globe,
  Layers2,
  Menu,
  MousePointer2,
  Play,
  Pause,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  CanvasPreview,
  CmsPreview,
  DesignPreview,
  CodePreview,
  McpPreview,
  FeaturePreview,
  CommunityPreview,
  AgentPanel,
} from "./landing-previews";
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

import sourceLinks from "./landing-links.json";

const sourceLink = (label: string) =>
  sourceLinks[label as keyof typeof sourceLinks] ?? original;
const asset = (name: string) => `/images/framer/${name}`;
const original = "https://www.framer.com";
type MenuGroup = [string, ...[string, string][]];
const menus: Record<"Platform" | "Solutions" | "Resources", MenuGroup[]> = {
  Platform: [
    [
      "만들기",
      ["디자인", "#canvas"],
      ["에이전트", "#agents"],
      ["컴포넌트", "/design-system"],
      ["MCP", "#connect"],
    ],
    [
      "구현하기",
      ["CMS", "#platform"],
      ["호스팅", "#platform"],
      ["성능", "#platform"],
      ["협업", "#platform"],
    ],
    [
      "운영과 성장",
      ["SEO", "#platform"],
      ["분석", "#platform"],
      ["게시", "#start"],
      ["사이트 사례", "#showcase"],
    ],
  ],
  Solutions: [
    [
      "함께 만드는 사람들",
      ["디자이너", "#canvas"],
      ["에이전시", "#showcase"],
      ["마케터", "#platform"],
      ["개발자", "/design-system"],
    ],
    [
      "만들고 싶은 웹사이트",
      ["포트폴리오", "#showcase"],
      ["랜딩 페이지", "#showcase"],
      ["기업 웹사이트", "#showcase"],
      ["매거진", "#community"],
    ],
  ],
  Resources: [
    [
      "둘러보기",
      ["디자인 시스템", "/design-system"],
      ["갤러리", "#showcase"],
      ["커뮤니티", "#community"],
      ["시작하기", "#start"],
    ],
    [
      "Framer 배우기",
      ["아카데미", `${original}/academy/`],
      ["개발자", `${original}/developers/`],
      ["블로그", `${original}/blog/`],
      ["도움말", `${original}/help/`],
    ],
  ],
};
type MenuName = keyof typeof menus;
// Keep source-link keys and preview identifiers stable while translating their labels.
const koreanLabels: Record<string, string> = {
  "Platform": "플랫폼",
  "Solutions": "활용 사례",
  "Resources": "자료실",
  "Product": "제품",
  "Marketplace": "마켓플레이스",
  "Business": "비즈니스",
  "Compare": "비교",
  "Company": "회사",
  "Explore Framer": "Framer 둘러보기",
  "Agents": "에이전트",
  "Design": "디자인",
  "Collaborate": "협업",
  "Collaboration": "협업",
  "Hosting": "호스팅",
  "Performance": "성능",
  "Analytics": "분석",
  "Publish": "게시",
  "Publishing": "게시",
  "Updates": "업데이트",
  "Templates": "템플릿",
  "Components": "컴포넌트",
  "Vectors": "벡터",
  "Plugins": "플러그인",
  "Gallery": "갤러리",
  "Hire Experts": "전문가 찾기",
  "Enterprise": "기업용",
  "Agencies": "에이전시",
  "Startups": "스타트업",
  "Pricing": "요금제",
  "Academy": "아카데미",
  "Desktop App": "데스크톱 앱",
  "Developers": "개발자",
  "Guides": "가이드",
  "Blog": "블로그",
  "Newsletter": "뉴스레터",
  "Stories": "고객 사례",
  "Students": "학생",
  "Help Articles": "도움말",
  "Meetups": "모임",
  "Contact": "문의하기",
  "Designers": "디자이너",
  "Marketers": "마케터",
  "Growth": "성장팀",
  "Builders": "제작자",
  "Engineers": "엔지니어",
  "Site Teams": "웹사이트 운영팀",
  "Founders": "창업자",
  "Website builder": "웹사이트 빌더",
  "Landing pages": "랜딩 페이지",
  "Portfolio maker": "포트폴리오 제작",
  "UI/UX design": "UI/UX 디자인",
  "No-code": "노코드",
  "About": "소개",
  "Careers": "채용",
  "Security": "보안",
  "Brand": "브랜드",
  "Legal": "법적 고지",
  "Trust": "신뢰 센터",
  "Merch": "굿즈",
  "Keyboard": "키보드",
  "Free domains": "무료 도메인",
  "AEO scanner": "AEO 진단",
  "Localization": "다국어 지원",
  "A/B Testing": "A/B 테스트"
};
const displayLabel = (key: string) => koreanLabels[key] ?? key;

const footerColumns = [
  {
    title: "Product",
    links: [
      "AI",
      "Agents",
      "MCP",
      "Design",
      "Collaborate",
      "CMS",
      "Hosting",
      "Performance",
      "SEO",
      "Analytics",
      "Publish",
      "Updates",
    ],
  },
  {
    title: "Marketplace",
    links: [
      "Templates",
      "Components",
      "Vectors",
      "Plugins",
      "Gallery",
      "Hire Experts",
    ],
    second: "Business",
    extra: ["Enterprise", "Agencies", "Startups", "Pricing"],
  },
  {
    title: "Resources",
    links: [
      "Academy",
      "Desktop App",
      "Developers",
      "Guides",
      "Blog",
      "Newsletter",
      "Stories",
      "Students",
      "Help Articles",
      "Meetups",
      "Contact",
    ],
  },
  {
    title: "Solutions",
    links: [
      "Designers",
      "Agencies",
      "Marketers",
      "Growth",
      "Builders",
      "Engineers",
      "Site Teams",
      "Founders",
      "Website builder",
      "Landing pages",
      "Portfolio maker",
      "UI/UX design",
      "No-code",
    ],
  },
  {
    title: "Compare",
    links: [
      "Webflow",
      "Figma",
      "Wix",
      "Squarespace",
      "WordPress",
      "Readymag",
      "Lovable",
      "Claude Code",
      "ChatGPT",
      "Codex",
      "Contentful",
      "Sanity",
      "v0",
    ],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Security", "Brand", "Legal", "Trust"],
    second: "Explore Framer",
    extra: [
      "Merch",
      "Keyboard",
      "Free domains",
      "CanvasBench",
      "State of Sites",
      "AEO scanner",
    ],
  },
];
const platform = [
  {
    title: "Performance",
    className: "fr-feature fr-performance",
    url: "/performance/",
  },
  {
    title: "CMS",
    className: "fr-feature fr-cms",
    url: "/cms/",
  },
  {
    title: "SEO",
    className: "fr-feature fr-seo",
    url: "/seo/",
  },
  {
    title: "Collaboration",
    className: "fr-feature fr-collaboration",
    url: "/collaboration/",
  },
  {
    title: "Hosting",
    className: "fr-feature fr-hosting",
    url: "/hosting/",
  },
  {
    title: "Localization",
    className: "fr-feature fr-localization",
    url: "/academy/lessons/localization",
  },
  {
    title: "Security",
    className: "fr-feature fr-security",
    url: "/legal/security",
  },
  {
    title: "Analytics",
    className: "fr-feature fr-analytics",
    url: "/analytics/",
  },
  {
    title: "A/B Testing",
    className: "fr-feature fr-testing",
    url: "/analytics/",
  },
];
const agents = [
  {
    title: "함께 구상하고, 직접 다듬는 디자인",
    copy: "다양한 시안을 살펴보고 마음에 드는 방향을 골라 보세요. 레이아웃부터 작은 디테일까지 직접 조정할 수 있습니다.",
    label: "Design",
  },
  {
    title: "콘텐츠 관리도 한곳에서",
    copy: "글과 이미지를 정리하고 페이지에 연결하세요. 콘텐츠가 늘어나도 일관된 디자인으로 관리할 수 있습니다.",
    label: "Content",
  },
  {
    title: "필요한 기능은 직접 만들어서",
    copy: "나만의 컴포넌트와 인터랙션을 더해 보세요. 기본 기능만으로 아쉬웠던 부분까지 원하는 대로 구현할 수 있습니다.",
    label: "Code",
  },
];
const stories = [
  { name: "Miro", logo: "miro.svg", url: "miro/" },
  { name: "Perplexity", logo: "perplexity.png", url: "perplexity/" },
  {
    name: "Legora",
    logo: "legora.svg",
    url: "legora/",
    photo: "legora-story.webp",
  },
  { name: "Mixpanel", logo: "mixpanel.png", url: "mixpanel/" },
];

function LandingHeader() {
  const [open, setOpen] = useState("");
  const signedIn = usePreviewSession();
  return (
    <header className="fr-header">
      <div className="fr-header-inner fr-container">
        <Link to="/" className="fr-brand" aria-label="Hapalin 홈">
          <Layers2 aria-hidden="true" />
          Hapalin
        </Link>
        <div className="fr-desktop-nav">
          <NavigationMenu
            value={open}
            onValueChange={setOpen}
            aria-label="주 메뉴"
          >
            <NavigationMenuList>
              {(Object.keys(menus) as MenuName[]).map((name) => (
                <NavigationMenuItem key={name} value={name}>
                  <NavigationMenuTrigger variant="text">
                    {displayLabel(name)}
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
          <a href={`${original}/enterprise/`} target="_blank" rel="noreferrer">
            기업용
          </a>
          <a href={`${original}/pricing/`} target="_blank" rel="noreferrer">
            요금제
          </a>
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
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="메뉴 열기"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" closeLabel="닫기">
                <SheetHeader>
                  <SheetTitle>Hapalin</SheetTitle>
                </SheetHeader>
                <div className="fr-system-mobile">
                  <Accordion type="single" collapsible>
                    {Object.entries(menus).map(([name, groups]) => (
                      <AccordionItem key={name} value={name}>
                        <AccordionTrigger>{displayLabel(name)}</AccordionTrigger>
                        <AccordionContent>
                          <div className="fr-mobile-links">
                            {groups
                              .flatMap(([, ...items]) => items)
                              .map(([label, href], i) => (
                                <SheetClose key={`${label}-${i}`} asChild>
                                  <a href={href}>{label}</a>
                                </SheetClose>
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <SheetClose asChild>
                    <a href={`${original}/pricing/`}>요금제</a>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/design-system">디자인 시스템</Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <div className="fr-hero-video">
      <video
        ref={video}
        src={asset("hero.mp4")}
        poster={asset("hero-poster.jpg")}
        preload="metadata"
        muted
        playsInline
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label="Framer 웹사이트 제작 시연"
      />
      <div className="fr-video-control">
        <Button
          size="xs"
          variant="secondary"
          aria-label={playing ? "소개 영상 일시 정지" : "소개 영상 재생"}
          onClick={() => {
            if (playing) video.current?.pause();
            else void video.current?.play();
          }}
        >
          {playing ? <Pause /> : <Play />}
          <span>{playing ? "일시 정지" : "영상 보기"} · 0:36</span>
        </Button>
      </div>
    </div>
  );
}

export default function Landing() {
  const { theme, setTheme } = useTheme();
  const [preview, setPreview] = useState<{
    title: string;
    file: string;
  } | null>(null);
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    const title = document.title;
    document.title = "Hapalin — 아이디어를 웹사이트로";
    return () => {
      document.title = title;
    };
  }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (prompt.trim()) {
      setSubmitted(true);
      setPreview({ title: "아이디어 미리보기", file: "site-1.png" });
    }
  }
  return (
    <div className="fr-page">
      <a href="#main-content" className="fr-skip">
        본문으로 건너뛰기
      </a>
      <LandingHeader />
      <main id="main-content">
        <section className="fr-hero fr-container" aria-labelledby="fr-title">
          <h1 id="fr-title">
            아이디어를 펼치고,
            <br />
            웹사이트로 만드세요.
          </h1>
          <p>
            구상부터 디자인, 완성까지 Hapalin에서.
            원하는 모습 그대로 웹사이트를 만들어 보세요.
          </p>
          <div className="fr-hero-actions">
            <div>
              <Button asChild>
                <a href="#start">무료로 시작하기</a>
              </Button>
              <Button variant="secondary" asChild>
                <a
                  href={`${original}/downloads/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  앱 다운로드 <Download data-icon="inline-end" />
                </a>
              </Button>
            </div>
            <a href="#connect">
              새 기능: <span>쓰던 도구를 그대로 연결하세요</span>
              <ArrowRight />
            </a>
          </div>
          <HeroVideo />
        </section>
        <div
          className="fr-customer-logos fr-container"
          aria-label="Framer 주요 고객사"
        >
          {[
            "miro.svg",
            "legora.svg",
            "zapier.svg",
            "perplexity.png",
            "mixpanel.png",
            "flora.svg",
          ].map((file) => (
            <a
              key={file}
              href={`${original}/stories/`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={asset(file)}
                alt={file === "flora.svg" ? "TypeSafe AI" : file.split(".")[0]}
              />
            </a>
          ))}
        </div>
        <section className="fr-section fr-container" id="canvas">
          <h2>
            만들고 싶은 모든 것을
            <br />
            하나의 캔버스에서.
          </h2>
          <CanvasPreview />
          <div className="fr-principles">
            <article>
              <Sparkles />
              <h3>아이디어를 첫 시안으로</h3>
              <p>
                여러 레이아웃을 살펴보고, 떠오른 아이디어를 캔버스에 옮겨 보세요.
              </p>
            </article>
            <article>
              <MousePointer2 />
              <h3>작은 디테일까지 직접</h3>
              <p>
                글꼴과 배치, 인터랙션을 화면에서 확인하며 원하는 대로 다듬으세요.
              </p>
            </article>
            <article>
              <Rocket />
              <h3>완성된 웹사이트로</h3>
              <p>
                콘텐츠와 기능을 연결해 보기에도, 사용하기에도 좋은 웹사이트를 만드세요.
              </p>
            </article>
          </div>
        </section>
        <section className="fr-section fr-container" id="agents">
          <div className="fr-section-heading">
            <h2>
              아이디어부터 완성까지.
              <br />에이전트와 함께.
            </h2>
            <Button variant="secondary" asChild>
              <a href="#start">에이전트와 시작하기</a>
            </Button>
          </div>
          <div className="fr-agent-layout">
            <div className="fr-agent-cards">
              {agents.map((item) => (
                <article className="fr-agent-card" key={item.label}>
                  <div className="fr-agent-image">
                    {item.label === "Design" ? (
                      <DesignPreview />
                    ) : item.label === "Content" ? (
                      <CmsPreview />
                    ) : (
                      <CodePreview />
                    )}
                  </div>
                  <div className="fr-agent-description">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.copy}</p>
                    </div>
                    <a href="#start">
                      직접 써보기 <ArrowRight />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <div className="fr-agent-aside">
              <AgentPanel />
            </div>
          </div>
          <article className="fr-connect" id="connect">
            <div>
              <CmsPreview compact />
              <div className="fr-connect-copy">
                <h3>쓰던 도구를 그대로 연결하세요.</h3>
                <p>
                  익숙한 도구와 콘텐츠를 연결해 작업을 이어가세요.
                </p>
              </div>
            </div>
            <McpPreview />
          </article>
        </section>
        <section className="fr-section fr-container" id="platform">
          <div className="fr-section-heading">
            <div>
              <h2>
                멋진 디자인은
                <br />
                시작일 뿐입니다.
              </h2>
              <p className="fr-section-intro">
                콘텐츠 관리부터 성능과 협업까지,
                웹사이트 운영에 필요한 기능을 한곳에 담았습니다.
              </p>
            </div>
          </div>
          <div className="fr-platform-grid">
            {platform.map((item) => (
              <article key={item.title} className={item.className}>
                <div className="fr-feature-image">
                  {item.title === "Hosting" ? (
                    <>
                      <img
                        src={asset("hosting.png")}
                        alt="호스팅을 표현한 추상 이미지"
                        loading="lazy"
                      />
                      <strong>
                        99.99%<span>가동률</span>
                      </strong>
                    </>
                  ) : (
                    <FeaturePreview title={item.title} />
                  )}
                </div>
                <h3>
                  <a
                    href={`${original}${item.url}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {displayLabel(item.title)}
                    <ArrowRight />
                  </a>
                </h3>
              </article>
            ))}
          </div>
        </section>
        <section className="fr-section fr-container" id="showcase">
          <div className="fr-section-heading">
            <h2>
              좋은 아이디어에서,
              <br />
              더 나은 웹사이트로.
            </h2>
            <Button variant="secondary" asChild>
              <a
                href={`${original}/community/gallery/`}
                target="_blank"
                rel="noreferrer"
              >
                Framer 웹사이트 둘러보기
              </a>
            </Button>
          </div>
          <div className="fr-showcase">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                className={
                  [
                    "fr-site fr-site-1",
                    "fr-site fr-site-2",
                    "fr-site fr-site-3",
                    "fr-site fr-site-4",
                    "fr-site fr-site-5",
                    "fr-site fr-site-6",
                  ][n - 1]
                }
                onClick={() =>
                  setPreview({
                    title: `웹사이트 디자인 예시 ${n}`,
                    file: `site-${n}.png`,
                  })
                }
                aria-label={`웹사이트 디자인 예시 ${n} 보기`}
              >
                <img
                  src={asset(`site-${n}.png`)}
                  alt={`Framer 갤러리의 웹사이트 예시 ${n}`}
                  loading="lazy"
                />
                <span>
                  사이트 보기
                  <ArrowUpRight />
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="fr-section fr-container" id="stories">
          <div className="fr-section-heading">
            <h2>
              한발 앞서가는
              <br />
              팀들의 이야기.
            </h2>
            <Button variant="secondary" asChild>
              <a href={`${original}/stories/`} target="_blank" rel="noreferrer">
                Framer 고객 사례
              </a>
            </Button>
          </div>
          <div className="fr-stories">
            {stories.map((story) => (
              <a
                key={story.name}
                className="fr-story"
                href={`${original}/stories/${story.url}`}
                target="_blank"
                rel="noreferrer"
              >
                {story.photo && (
                  <img
                    className="fr-story-photo"
                    src={asset(story.photo)}
                    alt="Legora 사옥"
                    loading="lazy"
                  />
                )}
                <img
                  className="fr-story-logo"
                  src={asset(story.logo)}
                  alt={story.name}
                  loading="lazy"
                />
                <span>
                  사례 읽기
                  <ArrowRight />
                </span>
              </a>
            ))}
          </div>
        </section>
        <section className="fr-section fr-container" id="community">
          <div className="fr-section-heading">
            <h2>
              함께 만들고,
              <br />
              서로에게 영감을.
            </h2>
            <Button variant="secondary" asChild>
              <a
                href={`${original}/community/`}
                target="_blank"
                rel="noreferrer"
              >
                커뮤니티 둘러보기
              </a>
            </Button>
          </div>
          <CommunityPreview />
        </section>
        <section className="fr-start fr-container" id="start">
          <h2>어떤 웹사이트를 만들고 싶으세요?</h2>
          <form className="fr-prompt" onSubmit={submit}>
            <Field>
              <FieldLabel htmlFor="site-idea" className="sr-only">
                만들고 싶은 웹사이트를 설명해 주세요
              </FieldLabel>
              <Textarea
                id="site-idea"
                placeholder="어떤 웹사이트를 만들고 싶으신가요?"
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value);
                  setSubmitted(false);
                }}
                maxLength={500}
                required
              />
            </Field>
            <div className="fr-prompt-actions">
              <span>
                <Sparkles />
                Hapalin Studio
              </span>
              <Button
                size="icon-sm"
                type="submit"
                disabled={!prompt.trim()}
                aria-label="아이디어 미리보기"
              >
                <ArrowUp />
              </Button>
            </div>
          </form>
          <div className="fr-prompt-suggestions">
            {[
              "개인 포트폴리오",
              "스타트업 웹사이트",
              "제품 소개 랜딩 페이지",
              "기업 블로그",
            ].map((idea) => (
              <Button
                key={idea}
                size="xs"
                variant="secondary"
                onClick={() => {
                  setPrompt(`${idea}를 만들어 주세요.`);
                  setSubmitted(false);
                }}
              >
                {idea}
              </Button>
            ))}
          </div>
          <p className="fr-prompt-note">
            이 브라우저에서만 미리보기를 만듭니다. 입력한 내용은 외부로 전송되지 않습니다.
          </p>
          <Link to="/design-system" className="fr-start-without">
            디자인 시스템 둘러보기 <ArrowRight />
          </Link>
        </section>
      </main>
      <footer className="fr-footer fr-container">
        <div className="fr-footer-columns">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3>{displayLabel(column.title)}</h3>
              {column.links.map((label) => (
                <a
                  key={label}
                  href={
                    label === "Components"
                      ? "/design-system"
                      : sourceLink(label)
                  }
                  target={label === "Components" ? undefined : "_blank"}
                  rel="noreferrer"
                >
                  {displayLabel(label)}
                </a>
              ))}
              {column.second && (
                <>
                  <h3 className="fr-footer-second">{displayLabel(column.second)}</h3>
                  {column.extra?.map((label) => (
                    <a
                      key={label}
                      href={sourceLink(label)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {displayLabel(label)}
                    </a>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
        <div className="fr-footer-bottom">
          <Link to="/" className="fr-brand" aria-label="Hapalin 홈">
            <Layers2 aria-hidden="true" />
          </Link>
          <span>
            <Globe />
            한국어
          </span>
          <div className="fr-footer-social">
            <a href="https://x.com/framer" target="_blank" rel="noreferrer">
              X ↗
            </a>
            <a
              href="https://www.youtube.com/@Framer"
              target="_blank"
              rel="noreferrer"
            >
              YouTube ↗
            </a>
          </div>
          <div className="fr-footer-appearance">
            <DashboardThemeToggle theme={theme} setTheme={setTheme} language="ko" />
          </div>
          <span>Hapalin © 2026</span>
        </div>
        <p className="fr-attribution">
          Hapalin 디자인 시스템으로 만든 웹사이트입니다. 레이아웃과 제품 이미지, 영상은{" "}
          <a href={original} target="_blank" rel="noreferrer">
            Framer
          </a>
          를 참고했으며, 제품 관련 링크는 원본 사이트로 연결됩니다.
        </p>
      </footer>
      <Dialog
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent className="sm:max-w-5xl" closeLabel="닫기">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
            <DialogDescription>
              {submitted
                ? `입력한 아이디어: “${prompt}” — 이 브라우저에서 보여 드리는 디자인 예시입니다.`
                : "Framer의 제품 이미지와 웹사이트 디자인을 살펴보세요."}
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <img
              className="fr-modal-image"
              src={asset(preview.file)}
              alt={preview.title}
            />
          )}
          {submitted && (
            <Button variant="secondary" asChild>
              <Link to="/design-system">
                컴포넌트 살펴보기 <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
