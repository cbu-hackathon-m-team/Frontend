/* eslint shadcn/require-static-classes: "off" -- Scoped slide compositions; shared UI retains its component variants. */
import { memo, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check, Clock3, FileText, Folder, Grid2X2, Layers2, List, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchBar } from "@/components/ui/search-bar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import styles from "./presentation.module.css";

export const slides = [
  { id: "intro", title: "아이디어에서,\n프로젝트까지.", summary: "웹사이트 작업을 한곳에서 시작하고 관리하는 Hapalin." },
  { id: "problem", title: "만들고 싶은 건 많고,\n작업은 흩어져 있죠.", summary: "브랜드 사이트도, 포트폴리오도. 진행할 프로젝트를 한곳에 모아보세요." },
  { id: "ideas", title: "포트폴리오부터,\n팀의 프로젝트까지.", summary: "어떤 웹사이트를 준비하든, 프로젝트를 만들고 정리하는 출발점은 같아요." },
  { id: "create", title: "시작은,\n이름 하나면 충분해요.", summary: "프로젝트 이름을 정하고, 만들고 싶은 내용을 간단히 적어보세요." },
  { id: "details", title: "어떤 작업인지,\n설명까지 분명하게.", summary: "프로젝트마다 이름과 설명을 관리해 다음에 열었을 때도 맥락을 이어가세요." },
  { id: "overview", title: "여러 프로젝트도,\n한눈에.", summary: "작업 중인 프로젝트를 한곳에 모으고 필요한 프로젝트를 열어보세요." },
  { id: "search", title: "찾고 싶은 작업을,\n이름으로 바로.", summary: "프로젝트가 늘어나도 이름으로 검색하면 원하는 작업만 남아요." },
  { id: "views", title: "보기 편한 방식으로,\n가볍게 전환하세요.", summary: "카드로 둘러보거나 목록으로 정리해 보세요. 같은 프로젝트를 내 방식대로 볼 수 있어요." },
  { id: "activity", title: "어디까지 했는지,\n다시 찾지 않아도.", summary: "프로젝트별 마지막 변경과 수정 시점을 최근 변경 화면에서 확인하세요." },
  { id: "projects", title: "직접,\n만들어보세요.", summary: "새 프로젝트를 만들고, 검색하거나 보기 방식을 바꿔보세요." },
  { id: "workspace", title: "작업 공간에도,\n나만의 이름을.", summary: "워크스페이스 이름과 설명을 정하고, 나의 작업에 맞는 공간을 만들어보세요." },
  { id: "continue", title: "다시 열어도,\n하던 작업 그대로.", summary: "프로젝트 정보는 현재 브라우저에 저장해요. 같은 브라우저에서 이어서 관리할 수 있어요." },
  { id: "demo", title: "서비스에서,\n이어서 둘러보세요.", summary: "Hapalin의 첫 화면부터 실제 프로젝트 관리까지 직접 확인하세요." },
  { id: "next", title: "프로젝트 관리에서,\n웹사이트 완성까지.", summary: "지금은 프로젝트를 시작하고 관리하는 데 집중했어요. 다음은 편집과 게시 경험입니다." },
  { id: "closing", title: "다음 웹사이트의 시작,\nHapalin.", summary: "만들고 싶은 아이디어를 첫 프로젝트로 이어보세요." },
] as const;

type Slide = typeof slides[number];

function Feature({ slide, children }: { slide: Slide; children: ReactNode }) {
  return <div className={styles["ppt-feature"]}>
    <div className={styles["ppt-message"]}><h2>{slide.title}</h2><p>{slide.summary}</p>{slide.id === "overview" && <div className={styles["ppt-mid-site"]}><Button variant="secondary" asChild><a href="/" target="_blank" rel="noopener noreferrer">사이트 가기 <ArrowUpRight data-icon="inline-end" /></a></Button></div>}</div>
    <div className={styles["ppt-feature-visual"]}>{children}</div>
  </div>;
}

const sampleProjects = [
  { id: 1, name: "브랜드 웹사이트", description: "웹사이트 프로젝트", cover: 0 },
  { id: 2, name: "팀 포트폴리오", description: "팀의 작업과 이야기를 모으는 공간", cover: 1 },
];

function ProjectPreview({ interactive = false }: { interactive?: boolean }) {
  const [projects, setProjects] = useState(sampleProjects);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<typeof sampleProjects[number] | null>(null);
  const filtered = projects.filter(project => project.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  function closeDialog() { setCreating(false); setSelected(null); }
  return <div className={styles["ppt-product-window"]} inert={!interactive} data-interactive={interactive} data-ppt-interactive={interactive ? "" : undefined} aria-label={interactive ? "직접 조작하는 프로젝트 예시" : "프로젝트 목록 구성 예시"}>
    <div className={styles["ppt-window-bar"]}><span className="type-body-md-medium"><Layers2 /> Hapalin Studio</span><Badge variant="outline">{interactive ? "직접 사용해보기" : projects.length + "개"}</Badge></div>
    <SidebarProvider className="min-h-0">
      <div className={styles["ppt-workspace-preview"]}>
        <div className={styles["ppt-mini-sidebar"]} inert>
          <span className="type-body-sm text-interface-subtle">워크스페이스</span>
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton variant="product" isActive><Folder /><span>프로젝트</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton variant="product"><FileText /><span>최근 변경</span></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
          <div className={styles["ppt-mini-account"]}><SidebarMenuButton><Layers2 /><span>내 계정</span><MoreHorizontal /></SidebarMenuButton></div>
        </div>
        <div className={styles["ppt-mini-main"]}>
          <div className={styles["ppt-mini-heading"]}><div><h3 className="type-heading-xl">프로젝트</h3><p className="type-body-sm text-interface-secondary">다음 아이디어를 시작할 공간.</p></div><Button size="sm" onClick={() => { setName(""); setCreating(true); }}><Plus data-icon="inline-start" />새 프로젝트</Button></div>
          <div className={styles["ppt-project-toolbar"]}>
            <SearchBar placeholder="프로젝트 검색…" aria-label="프로젝트 검색 예시" value={query} onValueChange={setQuery} readOnly={!interactive} />
            <ToggleGroup type="single" value={view} onValueChange={value => { if (value) setView(value); }} variant="outline" aria-label="프로젝트 보기 예시"><ToggleGroupItem value="grid" aria-label="카드 보기 예시"><Grid2X2 /></ToggleGroupItem><ToggleGroupItem value="list" aria-label="목록 보기 예시"><List /></ToggleGroupItem></ToggleGroup>
          </div>
          <div className={styles["ppt-project-grid"]} data-view={view} aria-label="샘플 프로젝트 목록">
            {filtered.map(project => <Card key={project.id} variant="panel"><div className={styles["ppt-project-cover"]} data-cover={project.cover}><span>{project.name.split(" ")[0]}</span></div><CardHeader className="p-4"><CardTitle>{project.name}</CardTitle><CardDescription>{project.description}</CardDescription></CardHeader><CardFooter className="px-4 py-3"><Badge variant="secondary">초안</Badge><Button variant="ghost" size="xs" aria-label={project.name + " 미리보기"} onClick={() => setSelected(project)}>미리보기 <ArrowRight data-icon="inline-end" /></Button></CardFooter></Card>)}
            {filtered.length === 0 && <Empty className="col-span-full"><EmptyHeader><EmptyTitle>검색 결과가 없습니다</EmptyTitle><EmptyDescription>다른 프로젝트 이름으로 검색해 보세요.</EmptyDescription></EmptyHeader></Empty>}
          </div>
        </div>
      </div>
    </SidebarProvider>
    <Dialog open={creating || selected !== null} onOpenChange={open => { if (!open) closeDialog(); }}><DialogContent>
      <DialogHeader><DialogTitle>{selected?.name ?? "샘플 프로젝트 만들기"}</DialogTitle><DialogDescription>이 발표에서만 유지되는 샘플입니다. 실제 워크스페이스 데이터는 변경하지 않습니다.</DialogDescription></DialogHeader>
      {selected ? <><div className={styles["ppt-project-detail"]} data-cover={selected.cover}><span>{selected.name}</span></div><DialogFooter><Button variant="secondary" onClick={closeDialog}>닫기</Button><Button asChild><a href="/dashboard" target="_blank" rel="noopener noreferrer">실제 워크스페이스 열기 <ArrowRight data-icon="inline-end" /></a></Button></DialogFooter></> :
        <form onSubmit={event => { event.preventDefault(); const trimmed = name.trim(); if (!trimmed) return; setProjects(previous => [...previous, { id: previous.length + 1, name: trimmed, description: "새로운 아이디어를 담는 공간", cover: previous.length % 2 }]); setQuery(""); closeDialog(); }}>
          <FieldGroup><Field><FieldLabel htmlFor="ppt-project-name">프로젝트 이름</FieldLabel><Input id="ppt-project-name" value={name} onChange={event => setName(event.target.value)} placeholder="예: 나의 첫 웹사이트" maxLength={60} required autoComplete="off" /></Field><DialogFooter><Button type="button" variant="secondary" onClick={closeDialog}>취소</Button><Button type="submit" disabled={!name.trim()}>만들기</Button></DialogFooter></FieldGroup>
        </form>}
    </DialogContent></Dialog>
  </div>;
}

const projectIdeas = [
  { id: "portfolio", label: "포트폴리오", name: "나의 작업과 이야기", description: "나를 소개할 프로젝트를 준비하는 공간", image: "portrait.jpg" },
  { id: "brand", label: "브랜드 사이트", name: "브랜드의 첫인상", description: "브랜드가 가진 이야기를 모으는 공간", image: "flower.jpg" },
  { id: "campaign", label: "캠페인", name: "새로운 시작의 기록", description: "새로운 캠페인을 준비하는 공간", image: "runner.jpg" },
];

function IdeaPreview({ image, name, description }: typeof projectIdeas[number]) {
  return <Card variant="panel" className={styles["ppt-idea-preview"]}>
    <div className={styles["ppt-idea-image"]}><img src={"/images/framer/" + image} alt="" /></div>
    <CardHeader><CardTitle>{name}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
    <CardFooter><Badge variant="secondary">프로젝트 구상</Badge></CardFooter>
  </Card>;
}

function ProjectIdeas() {
  const [idea, setIdea] = useState("portfolio");
  return <Tabs value={idea} onValueChange={setIdea} className={styles["ppt-idea-tabs"]} data-ppt-interactive="">
    <TabsList aria-label="프로젝트 활용 예시">{projectIdeas.map(item => <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>)}</TabsList>
    {projectIdeas.map(item => <TabsContent key={item.id} value={item.id}><IdeaPreview {...item} /></TabsContent>)}
  </Tabs>;
}

function ProjectForm({ workspace = false }: { workspace?: boolean }) {
  return <Card variant="panel" className={styles["ppt-form-preview"]} inert>
    <CardHeader><CardTitle>{workspace ? "워크스페이스 설정" : "새 프로젝트 만들기"}</CardTitle><CardDescription>{workspace ? "나의 작업 공간을 관리하세요." : "이름을 정하고 새로운 작업을 시작하세요."}</CardDescription></CardHeader>
    <CardContent><FieldGroup>
      <Field><FieldLabel htmlFor={workspace ? "ppt-workspace-name" : "ppt-create-name"}>{workspace ? "워크스페이스 이름" : "프로젝트 이름"}</FieldLabel><Input id={workspace ? "ppt-workspace-name" : "ppt-create-name"} value={workspace ? "나의 스튜디오" : "브랜드 웹사이트"} readOnly /></Field>
      <Field><FieldLabel htmlFor={workspace ? "ppt-workspace-description" : "ppt-create-description"}>설명</FieldLabel><Input id={workspace ? "ppt-workspace-description" : "ppt-create-description"} value={workspace ? "아이디어가 프로젝트로 이어지는 곳" : "브랜드의 새로운 이야기를 담을 웹사이트"} readOnly /></Field>
    </FieldGroup></CardContent>
    <CardFooter><Button>{workspace ? "변경사항 저장" : "프로젝트 만들기"}</Button></CardFooter>
  </Card>;
}

function ProjectSearch() {
  const [query, setQuery] = useState("");
  const results = sampleProjects.filter(project => project.name.includes(query.trim()));
  return <Card variant="panel" className={styles["ppt-search-preview"]} data-ppt-interactive="">
    <CardHeader><CardTitle>프로젝트 찾기</CardTitle><CardDescription>이름을 입력해 원하는 작업을 찾아보세요.</CardDescription></CardHeader>
    <CardContent><SearchBar value={query} onValueChange={setQuery} placeholder="프로젝트 검색…" aria-label="프로젝트 이름 검색" />
    <div className={styles["ppt-search-results"]} aria-live="polite">{results.map(project => <div key={project.id}><Folder /><span className="type-body-md flex-1">{project.name}</span><Badge variant="secondary">초안</Badge></div>)}
      {results.length === 0 && <Empty><EmptyHeader><EmptyTitle>검색 결과가 없습니다</EmptyTitle><EmptyDescription>다른 이름으로 검색해 보세요.</EmptyDescription></EmptyHeader></Empty>}
    </div></CardContent>
  </Card>;
}

function ProjectViews() {
  const [view, setView] = useState("grid");
  return <Card variant="panel" className={styles["ppt-view-preview"]} data-ppt-interactive="">
    <CardHeader><div className={styles["ppt-view-toolbar"]}><h3 className="type-heading-xl">내 프로젝트</h3><ToggleGroup type="single" variant="outline" value={view} onValueChange={value => { if (value) setView(value); }} aria-label="프로젝트 표시 방식"><ToggleGroupItem value="grid" aria-label="카드로 보기"><Grid2X2 /></ToggleGroupItem><ToggleGroupItem value="list" aria-label="목록으로 보기"><List /></ToggleGroupItem></ToggleGroup></div></CardHeader>
    <CardContent><div className={styles["ppt-view-cards"]} data-view={view}>{sampleProjects.map(project => <Card key={project.id} variant="panel"><div className={styles["ppt-project-cover"]} data-cover={project.cover}><span>{project.name.split(" ")[0]}</span></div><CardHeader><CardTitle>{project.name}</CardTitle><CardDescription>{project.description}</CardDescription></CardHeader><CardFooter><Badge variant="secondary">초안</Badge></CardFooter></Card>)}</div></CardContent>
  </Card>;
}

function RecentChanges() {
  return <Card variant="panel" className={styles["ppt-activity-preview"]}>
    <CardHeader><CardTitle>최근 변경</CardTitle><CardDescription>프로젝트별 마지막 저장 정보입니다.</CardDescription></CardHeader>
    <CardContent><div className={styles["ppt-activity-list"]}>{sampleProjects.map((project, i) => <div key={project.id}><Clock3 /><div><strong className="type-label-md">{project.name}</strong><span className="type-body-sm text-interface-secondary">{i === 0 ? "프로젝트 정보를 수정했습니다." : "프로젝트를 만들었습니다."}</span></div><span className="type-body-xs text-interface-subtle">{i === 0 ? "10월 30일" : "10월 29일"}</span></div>)}</div></CardContent>
  </Card>;
}

// Navigation captures need not reconcile the fifteen unchanged scene subtrees.
export const SlideContent = memo(function SlideContent({ id }: { id: Slide["id"] }) {
  const slide = slides.find(item => item.id === id)!;
  switch (id) {
    case "intro": return <div className={styles["ppt-hero"]}><div className={styles["ppt-message"]}><h1>아이디어에서,<br /><em>프로젝트까지.</em></h1><p>{slide.summary}</p></div><div className={styles["ppt-feature-visual"]}><ProjectPreview /></div></div>;
    case "problem": return <div className={styles["ppt-problem"]}><div className={styles["ppt-message"]}><h2>{slide.title}</h2><p>{slide.summary}</p></div><div className={styles["ppt-story-collage"]}>{projectIdeas.map(item => <figure key={item.id}><img src={"/images/framer/" + item.image} alt="" /><figcaption>{item.label}</figcaption></figure>)}</div></div>;
    case "ideas": return <Feature slide={slide}><ProjectIdeas /></Feature>;
    case "create": return <Feature slide={slide}><ProjectForm /></Feature>;
    case "details": return <Feature slide={slide}><div className={styles["ppt-detail-composition"]}><figure><img src="/images/framer/flower.jpg" alt="" /></figure><Card variant="panel" className={styles["ppt-detail-card"]}><CardHeader><CardTitle>브랜드 웹사이트</CardTitle><CardDescription>브랜드의 새로운 이야기를 담을 웹사이트</CardDescription></CardHeader><CardFooter><Badge variant="secondary">초안</Badge><Badge variant="outline">프로젝트 정보</Badge></CardFooter></Card></div></Feature>;
    case "overview": return <Feature slide={slide}><ProjectPreview /></Feature>;
    case "search": return <Feature slide={slide}><ProjectSearch /></Feature>;
    case "views": return <Feature slide={slide}><ProjectViews /></Feature>;
    case "activity": return <Feature slide={slide}><RecentChanges /></Feature>;
    case "projects": return <Feature slide={slide}><ProjectPreview interactive /></Feature>;
    case "workspace": return <Feature slide={slide}><ProjectForm workspace /></Feature>;
    case "continue": return <Feature slide={slide}><div className={styles["ppt-saved-project"]}><div className={styles["ppt-save-symbol"]} aria-hidden="true"><Check /></div><Alert role="note"><Check /><AlertDescription>프로젝트 정보가 저장되었어요</AlertDescription></Alert><Card variant="panel"><CardHeader><CardTitle>브랜드 웹사이트</CardTitle><CardDescription>다시 열고 이어서 관리할 프로젝트</CardDescription></CardHeader><CardFooter><Badge variant="secondary">현재 브라우저에 저장</Badge></CardFooter></Card></div></Feature>;
    case "demo": return <div className={styles["ppt-demo"]}><div className={styles["ppt-message"]}><h2>{slide.title}</h2><p>{slide.summary}</p><div className={styles["ppt-demo-actions"]}><Button asChild><a href="/dashboard" target="_blank" rel="noopener noreferrer">프로젝트 둘러보기 <ArrowRight data-icon="inline-end" /></a></Button><Button variant="secondary" asChild><a href="/login" target="_blank" rel="noopener noreferrer">로그인 화면</a></Button><Button variant="ghost" asChild><a href="/" target="_blank" rel="noopener noreferrer">홈페이지</a></Button></div></div></div>;
    case "next": return <div className={styles["ppt-next"]}><div className={styles["ppt-message"]}><h2>{slide.title}</h2><p>{slide.summary}</p></div><div className={styles["ppt-next-columns"]}><div><h3>지금 할 수 있는 일</h3><ul><li><Check />프로젝트 생성과 정보 관리</li><li><Check />검색과 카드·목록 보기</li><li><Check />최근 변경과 작업 공간 설정</li></ul></div><ArrowRight className={styles["ppt-roadmap-arrow"]} aria-hidden="true" /><div><h3>다음으로 준비할 일</h3><ul><li><Plus />웹사이트 콘텐츠 편집</li><li><Plus />게시와 배포</li><li><Plus />팀원 초대와 협업</li></ul></div></div></div>;
    case "closing": return <div className={styles["ppt-closing"]}><div className={styles["ppt-message"]}><h2>다음 웹사이트의 시작,<br /><em>Hapalin.</em></h2><p>{slide.summary}</p><Button variant="secondary" size="lg" asChild><a href="/dashboard" target="_blank" rel="noopener noreferrer">프로젝트 시작하기 <ArrowRight data-icon="inline-end" /></a></Button></div></div>;
  }
});
