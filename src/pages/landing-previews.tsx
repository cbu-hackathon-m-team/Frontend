import { useId, useState, type FormEvent } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  Database,
  FileText,
  Folder,
  Heart,
  Home,
  Layers2,
  LockKeyhole,
  MessageCircle,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const image = (file: string) => `/images/framer/${file}`;
const articles = [
  {
    title: "자연에서 영감을 얻은 편안한 인터페이스",
    category: "영감",
    photo: "portrait.jpg",
  },
  {
    title: "현대적인 UI에 담은 유기적인 형태와 움직임",
    category: "제품",
    photo: "flower.jpg",
  },
  {
    title: "자연의 색에서 찾은 차분한 컬러 팔레트",
    category: "영감",
    photo: "haus-landscape.jpg",
  },
  {
    title: "자연의 성장 과정에서 배우는 UX 패턴",
    category: "가이드",
    photo: "runner.jpg",
  },
  {
    title: "숲에서 픽셀까지, 자연을 닮은 질감",
    category: "디자인",
    photo: "flower.jpg",
  },
];

function SearchField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      type="search"
      aria-label={label}
      placeholder="검색…"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function AgentPanel() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(
    "스튜디오 웹사이트의 새로운 방향을 제안해 주세요. 레이아웃은 간결하게, 이미지는 개성 있게 구성해 주세요.",
  );
  const id = useId();
  function submit(event: FormEvent) {
    event.preventDefault();
    if (message.trim()) {
      setSent(message.trim());
      setMessage("");
    }
  }
  return (
    <aside className="fp-agent">
      <Tabs defaultValue="agent">
        <TabsList size="sm">
          <TabsTrigger value="agent">에이전트</TabsTrigger>
          <TabsTrigger value="style">스타일</TabsTrigger>
        </TabsList>
        <TabsContent value="agent">
          <div className="fp-conversation">
            <Badge variant="muted">히어로 영역 업데이트</Badge>
            <p>{sent}</p>
            <div className="fp-art-thumbnails">
              {["portrait.jpg", "flower.jpg", "runner.jpg"].map((file) => (
                <img
                  key={file}
                  src={image(file)}
                  alt="스튜디오 무드보드 참고 이미지"
                  loading="lazy"
                />
              ))}
            </div>
            <p className="fp-muted" aria-live="polite">
              <Check aria-hidden="true" />
              제안한 방향이 미리보기에 반영되었습니다.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="style">
          <div className="fp-style">
            <p>사이트 스타일</p>
            <Badge variant="outline">Hapalin 디자인 토큰</Badge>
            <p className="fp-muted">
              색상과 타이포그래피, UI 요소에 공통 디자인 시스템을 적용합니다.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      <form onSubmit={submit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={id}>추가 요청</FieldLabel>
            <Textarea
              id={id}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="추가로 다듬고 싶은 내용을 적어 주세요…"
              maxLength={240}
            />
          </Field>
          <div className="fp-agent-submit">
            <span>미리보기</span>
            <Button
              size="icon-xs"
              aria-label="추가 요청 보내기"
              disabled={!message.trim()}
            >
              <ArrowUp />
            </Button>
          </div>
        </FieldGroup>
      </form>
    </aside>
  );
}

export function CanvasPreview() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState("홈");
  const [device, setDevice] = useState("desktop");
  const [published, setPublished] = useState(false);
  const pages = ["홈", "/work", "/services", "/about", "/contact", "/news"];
  const pageNames: Record<string, string> = { "/work": "작업물", "/services": "서비스", "/about": "소개", "/contact": "문의", "/news": "소식" };
  return (
    <div className="fp-editor" aria-label="직접 조작할 수 있는 디자인 캔버스 미리보기">
      <div className="fp-toolbar">
        <span>
          <Layers2 />
          캔버스
        </span>
        <div className="fp-toolbar-center">
          사이트 <Badge variant="muted">main</Badge>
        </div>
        <div className="fp-toolbar-actions">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setDevice(device === "desktop" ? "mobile" : "desktop")
            }
            aria-label="미리보기 화면 크기 전환"
          >
            {device === "desktop" ? <Monitor /> : <Smartphone />}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPublished(!published)}
          >
            {published ? "미리보기에 게시됨" : "게시"}
          </Button>
        </div>
      </div>
      <div className="fp-editor-body">
        <aside className="fp-editor-sidebar">
          <Tabs defaultValue="pages">
            <TabsList variant="ghost" size="sm">
              <TabsTrigger value="pages">페이지</TabsTrigger>
              <TabsTrigger value="layers">레이어</TabsTrigger>
              <TabsTrigger value="assets">에셋</TabsTrigger>
            </TabsList>
            <TabsContent value="pages">
              <SearchField
                label="캔버스 페이지 검색"
                value={query}
                onChange={setQuery}
              />
              <div className="fp-page-list">
                <ToggleGroup
                  type="single"
                  value={page}
                  onValueChange={(value) => {
                    if (value) setPage(value);
                  }}
                  orientation="vertical"
                  className="w-full"
                >
                  {pages
                    .filter((p) =>
                      `${p} ${pageNames[p] ?? ""}`.toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((p) => (
                      <ToggleGroupItem
                        key={p}
                        value={p}
                        className="justify-start"
                      >
                        {p === "홈" ? <Home /> : <FileText />}
                        {p}
                      </ToggleGroupItem>
                    ))}
                </ToggleGroup>
              </div>
            </TabsContent>
            <TabsContent value="layers">
              <div className="fp-layer-list">
                <p>
                  <Folder />
                  데스크톱
                </p>
                <p>
                  <Layers2 />
                  내비게이션
                </p>
                <p>
                  <Layers2 />
                  히어로
                </p>
                <p>
                  <Layers2 />
                  작업물
                </p>
              </div>
            </TabsContent>
            <TabsContent value="assets">
              <div className="fp-asset-grid">
                {["portrait.jpg", "flower.jpg", "runner.jpg"].map((file) => (
                  <img
                    src={image(file)}
                    key={file}
                    alt="스튜디오 디자인 이미지"
                    loading="lazy"
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </aside>
        <div className="fp-editor-canvas">
          <div className="fp-device-line">
            <span>
              {device === "desktop" ? "데스크톱 · 1200" : "모바일 · 390"}
            </span>
            <ToggleGroup
              type="single"
              size="sm"
              value={device}
              onValueChange={(value) => {
                if (value) setDevice(value);
              }}
              aria-label="미리보기 화면 크기"
            >
              <ToggleGroupItem value="desktop" aria-label="데스크톱 화면">
                <Monitor />
              </ToggleGroupItem>
              <ToggleGroupItem value="mobile" aria-label="모바일 화면">
                <Smartphone />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div
            className={cn(
              "fp-website",
              device === "mobile" && "fp-website-mobile",
            )}
          >
            <nav aria-label="스튜디오 웹사이트 예시">
              <strong>HAUS</strong>
              <span>작업물 · 서비스 · 소개</span>
            </nav>
            <img
              className="fp-haus-wordmark"
              src={image("haus-wordmark.jpg")}
              alt="HAUS 스튜디오 워드마크"
              loading="lazy"
            />
            <div className="fp-website-caption">
              <span>
                {page === "홈"
                  ? "즐거운 여정의 시작."
                  : `${pageNames[page] ?? page} — Haus Studio`}
              </span>
              <span>추천</span>
            </div>
            <img
              className="fp-landscape"
              src={image("haus-landscape.jpg")}
              alt="푸른 하늘 아래 펼쳐진 초원"
              loading="lazy"
            />
            <div className="fp-website-bottom">
              <p>
                독립적인 시선.
                <br />
                새로운 경험.
              </p>
              <img
                src={image("flower.jpg")}
                alt="스튜디오에서 촬영한 흰 꽃"
                loading="lazy"
              />
            </div>
          </div>
          <div className="fp-canvas-status" aria-live="polite">
            {published
              ? "변경사항이 이 브라우저의 미리보기에 반영되었습니다."
              : "모든 디테일을 캔버스에서 다듬어 보세요."}
          </div>
        </div>
        <AgentPanel />
      </div>
    </div>
  );
}

export function CmsPreview({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("collections");
  const [selected, setSelected] = useState<string[]>([]);
  const [collection, setCollection] = useState("아티클");
  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div
      className={cn("fp-cms", compact && "fp-cms-compact")}
      aria-label="직접 조작할 수 있는 CMS 미리보기"
    >
      {!compact && (
        <div className="fp-toolbar">
          <span>
            <Database />
            CMS
          </span>
          <Badge variant="muted">사이트 · main</Badge>
          <Button
            size="sm"
            variant="secondary"
            disabled={!selected.length}
            onClick={() => setSelected([])}
          >
            {selected.length ? `${selected.length}개 게시` : "게시"}
          </Button>
        </div>
      )}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="fp-cms-tools">
          <TabsList variant="ghost" size="sm">
            <TabsTrigger value="collections">컬렉션</TabsTrigger>
            <TabsTrigger value="fields">필드</TabsTrigger>
            <TabsTrigger value="plugins">플러그인</TabsTrigger>
          </TabsList>
          {!compact && (
            <SearchField
              label="CMS 아티클 검색"
              value={query}
              onChange={setQuery}
            />
          )}
        </div>
        <TabsContent value="collections">
          <div className="fp-cms-body">
            <aside className="fp-cms-sidebar">
              <ToggleGroup
                type="single"
                value={collection}
                onValueChange={(v) => {
                  if (v) setCollection(v);
                }}
                orientation="vertical"
                className="w-full"
              >
                {["블로그", "아티클", "크리에이터", "카테고리", "스타일"].map(
                  (label, i) => (
                    <ToggleGroupItem
                      key={label}
                      value={label}
                      className="justify-start"
                    >
                      <Database />
                      {label}
                      <span>{[0, 320, 256, 18, 7][i] || ""}</span>
                    </ToggleGroupItem>
                  ),
                )}
              </ToggleGroup>
            </aside>
            <div className="fp-cms-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    {!compact && (
                      <TableHead>
                        <span className="sr-only">선택</span>
                      </TableHead>
                    )}
                    <TableHead>제목</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>이미지</TableHead>
                    <TableHead>카테고리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((article) => (
                    <TableRow
                      key={article.title}
                      data-state={
                        selected.includes(article.title)
                          ? "selected"
                          : undefined
                      }
                    >
                      {!compact && (
                        <TableCell>
                          <Checkbox
                            aria-label={`${article.title} 선택`}
                            checked={selected.includes(article.title)}
                            onCheckedChange={(checked) =>
                              setSelected((prev) =>
                                checked
                                  ? [...prev, article.title]
                                  : prev.filter((x) => x !== article.title),
                              )
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <span className="fp-article-title">
                          {article.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" size="sm">
                          게시됨
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <img
                          className="fp-table-thumb"
                          src={image(article.photo)}
                          alt=""
                          loading="lazy"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted" size="sm">
                          {article.category}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filtered.length && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="fields">
          <div className="fp-field-list">
            <h4>{collection}  필드</h4>
            <p>제목 · 텍스트</p>
            <p>상태 · 선택 항목</p>
            <p>이미지 · 미디어</p>
            <p>카테고리 · 참조</p>
          </div>
        </TabsContent>
        <TabsContent value="plugins">
          <div className="fp-field-list">
            <h4>연결된 작업 흐름</h4>
            <p>콘텐츠 가져오기 · 에셋 라이브러리 · 사이트 검색</p>
            <Badge variant="outline">미리보기</Badge>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function DesignPreview() {
  return (
    <div className="fp-explorations">
      {["exploration-1.jpg", "exploration-2.jpg", "exploration-3.jpg"].map(
        (file, i) => (
          <figure key={file}>
            <figcaption>
              {
                [
                  "디자인 시안",
                  "시안 — 큰 제목",
                  "시안 — 사이드바",
                ][i]
              }
            </figcaption>
            <img
              src={image(file)}
              alt={`HAUS 웹사이트 디자인 시안 ${i + 1}`}
              loading="lazy"
            />
          </figure>
        ),
      )}
    </div>
  );
}
export function CodePreview() {
  return (
    <div className="fp-code-art" aria-label="이미지 휠 컴포넌트 예시">
      {[
        "portrait.jpg",
        "flower.jpg",
        "runner.jpg",
        "haus-landscape.jpg",
        "portrait.jpg",
        "flower.jpg",
      ].map((file, i) => (
        <img
          key={`${file}-${i}`}
          src={image(file)}
          alt="원형으로 배치된 이미지"
          loading="lazy"
        />
      ))}
    </div>
  );
}
export function McpPreview() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="fp-mcp">
      <div className="fp-toolbar">
        <Code2 />
        <span>framer-agent</span>
        <Badge variant="muted">연결됨</Badge>
      </div>
      <Tabs defaultValue="codex">
        <TabsList variant="ghost">
          <TabsTrigger value="claude">Claude</TabsTrigger>
          <TabsTrigger value="cursor">Cursor</TabsTrigger>
          <TabsTrigger value="codex">Codex</TabsTrigger>
        </TabsList>
        {["claude", "cursor", "codex"].map((agent) => (
          <TabsContent value={agent} key={agent}>
            <pre>{`> ${agent} · Framer 미리보기\n\n✓ 프로젝트 연결 완료\n✓ 컬렉션 필드 확인 완료\n✓ 콘텐츠를 캔버스에 연결 완료\n\n다음 아이디어를 시작할 준비가 되었습니다.`}</pre>
          </TabsContent>
        ))}
      </Tabs>
      <div className="fp-mcp-copy">
        <code>https://mcp.framer.com/mcp</code>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="MCP 주소 복사"
          onClick={() => {
            void navigator.clipboard
              .writeText("https://mcp.framer.com/mcp")
              .then(() => setCopied(true));
          }}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
    </div>
  );
}

export function FeaturePreview({ title }: { title: string }) {
  const id = useId();
  const [locale, setLocale] = useState("nl");
  const [branch, setBranch] = useState("main");
  if (title === "CMS") return <CmsPreview compact />;
  if (title === "Performance")
    return (
      <div className="fp-performance">
        <div>
          <strong>Core Web Vitals</strong>
          <Badge variant="success">양호</Badge>
        </div>
        {[
          ["LCP", "1.1s", 12],
          ["INP", "95ms", 9],
          ["CLS", "0.01", 4],
        ].map(([label, value, progress]) => (
          <div className="fp-metric" key={label}>
            <p>
              <span>{label}</span>
              <strong>{value}</strong>
            </p>
            <Progress value={Number(progress)} aria-label={String(label)} />
          </div>
        ))}
      </div>
    );
  if (title === "SEO")
    return (
      <div className="fp-seo">
        <h4>사이트 설정</h4>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${id}-title`}>제목</FieldLabel>
            <Input
              id={`${id}-title`}
              defaultValue="Comet: 나만의 AI 브라우저"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-url`}>URL</FieldLabel>
            <Input id={`${id}-url`} defaultValue="/comet/" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-description`}>
              페이지 설명
            </FieldLabel>
            <Textarea
              id={`${id}-description`}
              defaultValue="Perplexity의 Comet은 개인 비서처럼 도와주는 AI 브라우저입니다. 반복 작업을 자동화하고, 웹에서 자료를 찾고, 하루를 계획해 보세요."
            />
          </Field>
        </FieldGroup>
        <p className="fp-muted">공유 미리보기 · 1200 × 630</p>
        <img
          src={image("comet.png")}
          alt="Comet 웹사이트 공유 미리보기"
          loading="lazy"
        />
      </div>
    );
  if (title === "Collaboration")
    return (
      <div className="fp-branches">
        <p>브랜치</p>
        <ToggleGroup
          type="single"
          value={branch}
          onValueChange={(v) => {
            if (v) setBranch(v);
          }}
          orientation="vertical"
          className="w-full"
        >
          {["main", "use-cases", "publishing", "content"].map((name, i) => (
            <ToggleGroupItem key={name} value={name} className="justify-start">
              <Avatar className="size-5">
                <AvatarFallback>{["M", "A", "S", "J"][i]}</AvatarFallback>
              </Avatar>
              {name}
              <span className="fp-muted">{i + 1}분 전</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    );
  if (title === "Localization")
    return (
      <div className="fp-localization">
        <p>언어</p>
        <Select value={locale} onValueChange={setLocale}>
          <SelectTrigger aria-label="미리보기 언어">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="nl">NL · 네덜란드어</SelectItem>
              <SelectItem value="it">IT · 이탈리아어</SelectItem>
              <SelectItem value="cn">CN · 중국어</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p className="fp-muted">번역 진행률</p>
        <Progress
          value={locale === "nl" ? 35 : locale === "it" ? 100 : 90}
          aria-label="번역 진행률"
        />
        <span>
          {locale === "nl" ? "35%" : locale === "it" ? "100%" : "90%"}
        </span>
      </div>
    );
  if (title === "Security")
    return (
      <div className="fp-security">
        <LockKeyhole />
        <Input
          aria-label="보안 연결된 사이트 주소"
          value="https://www.framer.com/"
          readOnly
        />
      </div>
    );
  if (title === "Analytics") return <AnalyticsPreview />;
  if (title === "A/B Testing")
    return (
      <div className="fp-testing">
        <div className="fp-metric">
          <p>홈페이지 조회수</p>
          <h4>4,916</h4>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>버전</TableHead>
              <TableHead>전환율</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                홈페이지 2026{" "}
                <Badge size="xs" variant="success">
                  성과 우수
                </Badge>
              </TableCell>
              <TableCell>17.1%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>홈페이지</TableCell>
              <TableCell>15%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Progress value={91} aria-label="성과가 높은 버전의 트래픽 비율" />
      </div>
    );
  return null;
}
const chartData = [
  { day: "월", views: 44, visitors: 21 },
  { day: "화", views: 74, visitors: 48 },
  { day: "수", views: 66, visitors: 35 },
  { day: "목", views: 92, visitors: 56 },
  { day: "금", views: 79, visitors: 63 },
  { day: "토", views: 118, visitors: 70 },
  { day: "일", views: 105, visitors: 57 },
];
function AnalyticsPreview() {
  return (
    <div className="fp-analytics">
      <h4>분석</h4>
      <div className="fp-analytics-metrics">
        {[
          ["실시간 방문자", "400"],
          ["순 방문자", "1.7M"],
          ["페이지 조회수", "2.2M"],
          ["이탈률", "40.9%"],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <ChartContainer
        config={{
          views: { label: "페이지 조회수", color: "var(--primary)" },
          visitors: { label: "방문자", color: "var(--interface-secondary)" },
        }}
        className="h-40 w-full"
      >
        <AreaChart data={chartData}>
          <CartesianGrid vertical={false} stroke="var(--boundary-default)" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="views"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.08}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke="var(--interface-secondary)"
            fill="var(--interface-secondary)"
            fillOpacity={0.04}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

export function CommunityPreview() {
  const [tab, setTab] = useState("feed");
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <div className="fp-community">
      <div className="fp-toolbar">
        <span>
          <Layers2 />
          커뮤니티
        </span>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList variant="ghost" size="sm">
            <TabsTrigger value="experts">전문가</TabsTrigger>
            <TabsTrigger value="gallery">갤러리</TabsTrigger>
            <TabsTrigger value="feed">피드</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="fp-community-search">
          <SearchField
            label="커뮤니티 게시물 검색"
            value={query}
            onChange={setQuery}
          />
        </div>
      </div>
      <div className="fp-community-body">
        <ScrollArea className="h-[590px]">
          <div className="fp-community-feed">
            {(tab === "feed" ? [0, 1] : tab === "gallery" ? [1] : [0])
              .filter(
                (i) =>
                  ["Lee Black", "Gustave Flowbert"][i]
                    .toLowerCase()
                    .includes(query.toLowerCase()) ||
                  "웹사이트 디자인 creative websites design".includes(query.toLowerCase()),
              )
              .map((i) => (
                <article key={i}>
                  <div className="fp-post-author">
                    <Avatar>
                      <AvatarFallback>{i ? "GF" : "LB"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <strong>{i ? "Gustave Flowbert" : "Lee Black"}</strong>
                      <span>{i ? "마켓플레이스 · 42분 전" : "7분 전"}</span>
                    </div>
                  </div>
                  <p>
                    {i
                      ? "독립 크리에이터를 위한 새로운 디자인을 소개합니다."
                      : "작은 움직임으로 새로운 시선을 담았습니다. 캔버스에서 만든 웹사이트입니다."}
                  </p>
                  <img
                    src={image(i ? "community.png" : "site-1.png")}
                    alt={
                      i
                        ? "Billie Duvalle의 포트폴리오 예시"
                        : "크리에이티브 스튜디오 웹사이트"
                    }
                    loading="lazy"
                  />
                  <div className="fp-post-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLiked(!liked)}
                      aria-pressed={liked}
                    >
                      <Heart data-icon="inline-start" />
                      {117 + (liked ? 1 : 0)}
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href="https://www.framer.com/community/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle data-icon="inline-start" />
                        32
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        void navigator.clipboard
                          .writeText("https://www.framer.com/community/")
                          .then(() => setCopied(true))
                      }
                    >
                      {copied ? (
                        <Check data-icon="inline-start" />
                      ) : (
                        <Copy data-icon="inline-start" />
                      )}
                      {copied ? "복사됨" : "복사"}
                    </Button>
                  </div>
                </article>
              ))}
          </div>
        </ScrollArea>
        <aside className="fp-community-aside">
          <h4>인기 템플릿</h4>
          {["Gridz", "Recraft", "Caspia", "Studio HRSE", "Lou"].map(
            (name, i) => (
              <a
                key={name}
                href="https://www.framer.com/community/marketplace/"
                target="_blank"
                rel="noreferrer"
              >
                <img src={image(`site-${i + 1}.png`)} alt="" loading="lazy" />
                <span>
                  {name}
                  <small>템플릿 · 둘러보기</small>
                </span>
                <ArrowUpRight />
              </a>
            ),
          )}
          <h4>추천 크리에이터</h4>
          <div className="fp-post-author">
            <Avatar>
              <AvatarFallback>FM</AvatarFallback>
            </Avatar>
            <span>Fanny Mulet</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
