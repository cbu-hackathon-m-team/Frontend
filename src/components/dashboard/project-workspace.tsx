import { useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  FolderOpen,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { WorkspacePageHeader } from "./page-header";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SearchBar } from "@/components/ui/search-bar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { readProjects, writeProjects, type Project } from "./projects";

type ProjectValues = Pick<Project, "name" | "description">;
const saveError =
  "프로젝트를 저장하지 못했습니다. 브라우저 저장 공간과 권한을 확인한 뒤 다시 시도해 주세요.";

function ProjectEditor({
  project,
  onSave,
  onDelete,
  onClose,
}: {
  project?: Project;
  onSave: (values: ProjectValues) => string | null;
  onDelete: () => string | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setError(onSave({ name: name.trim(), description: description.trim() }));
  }
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {project ? "프로젝트 설정" : "새 프로젝트 만들기"}
        </DialogTitle>
        <DialogDescription>
          {project
            ? "프로젝트 이름과 설명을 수정하세요."
            : "이름을 정하고 새로운 작업을 시작하세요."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="flex flex-col gap-6">
        <FieldGroup>
          <Field data-invalid={nameError || undefined}>
            <FieldLabel htmlFor="project-name">프로젝트 이름</FieldLabel>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setNameError(false);
              }}
              placeholder="예: 브랜드 웹사이트"
              required
              maxLength={80}
              aria-invalid={nameError || undefined}
              aria-describedby={nameError ? "project-name-error" : undefined}
            />
            {nameError && (
              <FieldError id="project-name-error">
                프로젝트 이름을 입력해 주세요.
              </FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="project-description">
              설명 <span className="text-interface-subtle">(선택)</span>
            </FieldLabel>
            <Textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="어떤 프로젝트인지 간단히 적어주세요."
              maxLength={500}
              rows={3}
            />
          </Field>
        </FieldGroup>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          {project && (
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="ghost" className="sm:mr-auto">
                  <Trash2 data-icon="inline-start" />
                  삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>프로젝트를 삭제할까요?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ‘{project.name}’ 프로젝트가 이 브라우저에서 삭제됩니다. 삭제
                    후에는 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {deleteError && (
                  <Alert variant="destructive">
                    <AlertDescription>{deleteError}</AlertDescription>
                  </Alert>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteError(onDelete())}
                  >
                    프로젝트 삭제
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">
            {project ? "변경사항 저장" : "프로젝트 만들기"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function ProjectWorkspace() {
  const [store, setStore] = useState(() => {
    try {
      return { projects: readProjects(), error: null as string | null };
    } catch {
      return {
        projects: [] as Project[],
        error:
          "저장된 프로젝트를 읽지 못했습니다. 기존 데이터를 보호하기 위해 변경을 중지했습니다. 브라우저 저장소를 확인하고 새로고침해 주세요.",
      };
    }
  });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState("grid");
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const createRef = useRef<HTMLButtonElement>(null);
  const query = search.trim().toLocaleLowerCase();
  const visibleProjects = store.projects
    .filter((project) =>
      `${project.name} ${project.description}`
        .toLocaleLowerCase()
        .includes(query),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "ko")
        : Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );

  function openEditor(project: Project | "new", trigger: HTMLElement) {
    triggerRef.current = trigger;
    setEditing(project);
  }
  function persist(projects: Project[]) {
    if (store.error) return store.error;
    try {
      writeProjects(projects);
    } catch {
      return saveError;
    }
    setStore({ projects, error: null });
    setEditing(null);
    return null;
  }
  function save(values: ProjectValues) {
    const now = new Date().toISOString();
    const project =
      editing && editing !== "new"
        ? { ...editing, ...values, updatedAt: now }
        : {
            ...values,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
          };
    const existing = store.projects.some((item) => item.id === project.id);
    const error = persist(
      existing
        ? store.projects.map((item) =>
            item.id === project.id ? project : item,
          )
        : [project, ...store.projects],
    );
    if (!error) {
      setSearch("");
      toast.success(
        existing ? "프로젝트를 수정했습니다." : "프로젝트를 만들었습니다.",
      );
    }
    return error;
  }
  function remove() {
    if (!editing || editing === "new") return null;
    const error = persist(
      store.projects.filter((project) => project.id !== editing.id),
    );
    if (!error) toast.success("프로젝트를 삭제했습니다.");
    return error;
  }
  return (
    <div className="flex flex-col gap-7">
      <WorkspacePageHeader
        title="프로젝트"
        description="워크스페이스의 웹사이트 프로젝트를 만들고 관리하세요."
        actions={
          <Button
            ref={createRef}
            disabled={!!store.error}
            onClick={(event) => openEditor("new", event.currentTarget)}
          >
            <Plus data-icon="inline-start" />새 프로젝트
          </Button>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 type-label-lg text-interface-contrast">
          전체 프로젝트{" "}
          <span className="type-label-md text-interface-subtle">
            {store.projects.length}
          </span>
        </h2>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <SearchBar
            aria-label="프로젝트 검색"
            placeholder="프로젝트 검색…"
            value={search}
            onValueChange={setSearch}
            containerClassName="min-w-0 basis-full sm:w-64 sm:basis-auto sm:flex-1"
          />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger aria-label="프로젝트 정렬">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="recent">최근 수정순</SelectItem>
                <SelectItem value="name">이름순</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => {
              if (value) setView(value);
            }}
            variant="outline"
            className="ml-auto sm:ml-0"
            aria-label="프로젝트 보기 방식"
          >
            <ToggleGroupItem value="grid" aria-label="카드 보기">
              <LayoutGrid />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="목록 보기">
              <List />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      {store.error ? (
        <Alert variant="destructive">
          <AlertDescription>{store.error}</AlertDescription>
        </Alert>
      ) : visibleProjects.length ? (
        view === "list" ? (
          <div
            className="overflow-hidden rounded-lg border border-boundary-default bg-surface-panel"
            aria-label="프로젝트 목록"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>프로젝트 이름</TableHead>
                  <TableHead className="hidden sm:table-cell">상태</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    최근 수정
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">생성일</TableHead>
                  <TableHead>
                    <span className="sr-only">관리</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <FolderOpen
                          className="size-4 shrink-0 text-interface-subtle"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <span
                            className="block max-w-36 truncate type-label-md text-interface-contrast sm:max-w-48 lg:max-w-64 xl:max-w-80"
                            title={project.name}
                          >
                            {project.name}
                          </span>
                          <span className="mt-1 block max-w-36 truncate type-body-sm text-interface-subtle sm:max-w-48 lg:max-w-64 xl:max-w-80">
                            {project.description || "설명 없음"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="muted">초안</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <time dateTime={project.updatedAt}>
                        {new Date(project.updatedAt).toLocaleDateString(
                          "ko-KR",
                        )}
                      </time>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <time dateTime={project.createdAt}>
                        {new Date(project.createdAt).toLocaleDateString(
                          "ko-KR",
                        )}
                      </time>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={project.name + " 프로젝트 관리"}
                          title="프로젝트 관리"
                          onClick={(event) =>
                            openEditor(project, event.currentTarget)
                          }
                        >
                          <ArrowUpRight />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="프로젝트 목록"
          >
            {visibleProjects.map((project) => (
              <Card
                key={project.id}
                variant="panel"
                className="flex min-w-0 flex-col overflow-hidden"
              >
                <div
                  className="flex aspect-video items-center justify-center border-b border-boundary-subtle bg-surface-inset"
                  aria-hidden="true"
                >
                  <span className="type-display-md text-primary">
                    {Array.from(project.name).slice(0, 2).join("")}
                  </span>
                </div>
                <CardHeader className="px-5 py-5 md:px-5">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <CardTitle className="min-w-0">
                      <span className="block truncate" title={project.name}>
                        {project.name}
                      </span>
                    </CardTitle>
                    <Badge variant="muted">초안</Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-5 md:pb-5">
                  <CardDescription>
                    <span className="line-clamp-2 min-h-10">
                      {project.description || "설명 없음"}
                    </span>
                  </CardDescription>
                </CardContent>
                <CardFooter className="justify-between gap-3 px-5 py-3 md:px-5 md:py-3">
                  <time
                    className="type-body-xs text-interface-subtle"
                    dateTime={project.updatedAt}
                  >
                    {new Date(project.updatedAt).toLocaleDateString("ko-KR")}{" "}
                    수정
                  </time>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={project.name + " 프로젝트 관리"}
                    onClick={(event) =>
                      openEditor(project, event.currentTarget)
                    }
                  >
                    관리
                    <ArrowUpRight data-icon="inline-end" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Empty variant="panel" className="min-h-80">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {query ? <Search /> : <FolderOpen />}
            </EmptyMedia>
            <EmptyTitle>
              {query ? "검색 결과가 없습니다" : "첫 프로젝트를 시작해 보세요"}
            </EmptyTitle>
            <EmptyDescription>
              {query
                ? "다른 이름이나 설명으로 검색해 보세요."
                : "프로젝트를 만들면 이곳에서 작업을 모아 관리할 수 있습니다."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {query ? (
              <Button variant="secondary" onClick={() => setSearch("")}>
                검색 초기화
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={(event) => openEditor("new", event.currentTarget)}
              >
                <Plus data-icon="inline-start" />새 프로젝트 만들기
              </Button>
            )}
          </EmptyContent>
        </Empty>
      )}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        {editing !== null && (
          <DialogContent
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              (triggerRef.current?.isConnected
                ? triggerRef.current
                : createRef.current
              )?.focus();
            }}
          >
            <ProjectEditor
              key={editing === "new" ? "new" : editing.id}
              project={editing === "new" ? undefined : editing}
              onSave={save}
              onDelete={remove}
              onClose={() => setEditing(null)}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
