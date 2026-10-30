import { toast } from "sonner";
import { useState } from "react";
import { Plus, Trash2, Check, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { draftsFromRules } from "./workflow";
import type { ValidationProject, ValidationCase, Value } from "./model";

function validBody(value: string) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
export function validTests(cases: ValidationCase[]) {
  return (
    cases.length > 0 &&
    cases.every(
      (c) =>
        c.name.trim() &&
        c.input.trim() &&
        (!c.request ||
          (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(
            c.request.method,
          ) &&
            c.request.path.startsWith("/") &&
            validBody(c.request.body))) &&
        (c.intent?.trim() || c.assertions.length > 0) &&
        c.assertions.every((a) => a.key.trim() && a.label.trim()) &&
        new Set(c.assertions.map((a) => a.key)).size === c.assertions.length,
    )
  );
}
function parseValue(raw: string): Value {
  if (raw.trim() === "") return "";
  try {
    const value: unknown = JSON.parse(raw);
    if (
      value === null ||
      ["string", "number", "boolean"].includes(typeof value)
    )
      return value as Value;
  } catch {
    /* Treat non-JSON input as a string. */
  }
  return raw;
}
export function TestEditor({
  project,
  confirmed,
  busy,
  onChange,
  onConfirm,
}: {
  project: ValidationProject;
  confirmed: boolean;
  busy: boolean;
  onChange: (project: ValidationProject) => void;
  onConfirm: () => void;
}) {
  const [selected, setSelected] = useState(project.cases[0]?.id);
  const active =
    project.cases.find((c) => c.id === selected) ?? project.cases[0];
  function changeCase(id: string, updated: ValidationCase) {
    onChange({
      ...project,
      cases: project.cases.map((c) => (c.id === id ? updated : c)),
    });
  }
  function addCase() {
    const id = `T-${crypto.randomUUID().slice(0, 6)}`;
    setSelected(id);
    onChange({
      ...project,
      cases: [
        ...project.cases,
        {
          id,
          name: "새 테스트",
          input: "",
          assertions: [],
          ...(project.repository
            ? {
                request: {
                  method: "POST",
                  path: project.connection?.entry.split(/\s+/).at(-1) || "/",
                  body: "{}",
                },
              }
            : {}),
        },
      ],
    });
  }
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="business-rule">업무 규칙</FieldLabel>
          <Textarea
            id="business-rule"
            rows={3}
            value={project.rule}
            disabled={busy}
            placeholder="유지되어야 하는 동작과 실패 시 처리 방법을 입력하세요."
            onChange={(e) => onChange({ ...project, rule: e.target.value })}
          />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FieldDescription>
            AI 연결 전 · 규칙별 초안을 만들고 실행 입력은 직접 작성합니다.
          </FieldDescription>
          <Button
            variant="outline"
            disabled={busy || !project.rule.trim()}
            onClick={() => {
              const added = draftsFromRules(project);
              if (added.length) {
                onChange({ ...project, cases: [...project.cases, ...added] });
                setSelected(added[0].id);
              }
              toast(
                added.length
                  ? `${added.length}개 테스트 초안을 추가했습니다.`
                  : "이미 초안으로 만든 규칙입니다.",
              );
            }}
          >
            <ListPlus data-icon="inline-start" />
            규칙으로 테스트 초안 만들기
          </Button>
        </div>
      </FieldGroup>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="type-heading-sm">
            검증할 테스트 {project.cases.length}개
          </h2>
          <Badge variant={confirmed ? "success" : "warning"}>
            {confirmed ? "확정됨" : "검토 필요"}
          </Badge>
        </div>
        <div className="flex gap-2">
          {" "}
          <Button variant="outline" onClick={addCase} disabled={busy}>
            <Plus data-icon="inline-start" />
            테스트 추가
          </Button>{" "}
          <Button
            disabled={busy || !validTests(project.cases)}
            onClick={onConfirm}
          >
            <Check data-icon="inline-start" />
            테스트 확정하고 실행 준비
          </Button>
        </div>
      </div>
      {!project.cases.length && (
        <Empty variant="panel">
          <EmptyHeader>
            <EmptyTitle>검증할 동작을 추가하세요</EmptyTitle>
            <EmptyDescription>
              입력 조건과 기대 결과를 한 쌍으로 등록합니다. 개수는 제한하지
              않습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {!!project.cases.length && (
        <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav aria-label="편집할 테스트" className="flex flex-col gap-1">
            {project.cases.map((c) => (
              <Button
                key={c.id}
                variant={active?.id === c.id ? "secondary" : "ghost"}
                className="w-full min-w-0 justify-between"
                onClick={() => setSelected(c.id)}
                aria-pressed={active?.id === c.id}
              >
                <span className="truncate">{c.name}</span>
                <span>
                  {!c.input.trim()
                    ? "입력 필요"
                    : c.intent
                      ? "동작"
                      : c.assertions.length}
                </span>
              </Button>
            ))}
          </nav>
          <div className="min-w-0">
            {project.cases
              .filter((c) => c.id === active?.id)
              .map((c) => (
                <Card variant="panel" key={c.id}>
                  <CardHeader variant="divided" className="px-5 py-4 md:px-5">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>{c.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`${c.id} 테스트 삭제`}
                        disabled={busy}
                        onClick={() =>
                          onChange({
                            ...project,
                            cases: project.cases.filter(
                              (item) => item.id !== c.id,
                            ),
                          })
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pt-4 md:px-5">
                    <FieldGroup className="grid gap-4 md:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor={`name-${c.id}`}>
                          테스트 이름
                        </FieldLabel>
                        <Input
                          id={`name-${c.id}`}
                          value={c.name}
                          disabled={busy}
                          onChange={(e) =>
                            changeCase(c.id, { ...c, name: e.target.value })
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`input-${c.id}`}>
                          {project.repository
                            ? "선행 조건·테스트 입력"
                            : "보낼 입력·초기 조건"}
                        </FieldLabel>
                        <Textarea
                          rows={3}
                          placeholder="초기 상태와 보낼 요청·데이터"
                          id={`input-${c.id}`}
                          value={c.input}
                          disabled={busy}
                          onChange={(e) =>
                            changeCase(c.id, { ...c, input: e.target.value })
                          }
                        />
                      </Field>
                    </FieldGroup>
                    {project.repository && c.request && (
                      <FieldGroup className="mt-5">
                        <FieldGroup className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                          <Field>
                            <FieldLabel htmlFor={`method-${c.id}`}>
                              HTTP 메서드
                            </FieldLabel>
                            <Select
                              disabled={busy}
                              value={c.request.method}
                              onValueChange={(method) =>
                                changeCase(c.id, {
                                  ...c,
                                  request: { ...c.request!, method },
                                })
                              }
                            >
                              <SelectTrigger id={`method-${c.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {[
                                    "GET",
                                    "POST",
                                    "PUT",
                                    "PATCH",
                                    "DELETE",
                                  ].map((method) => (
                                    <SelectItem key={method} value={method}>
                                      {method}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor={`path-${c.id}`}>
                              요청 경로
                            </FieldLabel>
                            <Input
                              id={`path-${c.id}`}
                              value={c.request.path}
                              disabled={busy}
                              onChange={(e) =>
                                changeCase(c.id, {
                                  ...c,
                                  request: {
                                    ...c.request!,
                                    path: e.target.value,
                                  },
                                })
                              }
                            />
                          </Field>
                        </FieldGroup>
                        <Field
                          data-invalid={!validBody(c.request.body) || undefined}
                        >
                          <FieldLabel htmlFor={`body-${c.id}`}>
                            JSON 본문
                          </FieldLabel>
                          <Textarea
                            id={`body-${c.id}`}
                            value={c.request.body}
                            disabled={busy}
                            aria-invalid={
                              !validBody(c.request.body) || undefined
                            }
                            onChange={(e) =>
                              changeCase(c.id, {
                                ...c,
                                request: {
                                  ...c.request!,
                                  body: e.target.value,
                                },
                              })
                            }
                          />
                          {!validBody(c.request.body) && (
                            <FieldDescription>
                              유효한 JSON을 입력하세요.
                            </FieldDescription>
                          )}
                        </Field>
                      </FieldGroup>
                    )}
                    {c.intent !== undefined && (
                      <FieldGroup className="mt-5">
                        <Field>
                          <FieldLabel htmlFor={`intent-${c.id}`}>
                            기대 동작
                          </FieldLabel>
                          <Textarea
                            id={`intent-${c.id}`}
                            value={c.intent}
                            disabled={busy}
                            onChange={(e) =>
                              changeCase(c.id, { ...c, intent: e.target.value })
                            }
                          />
                          <FieldDescription>
                            실행 입력이 이 동작을 재현하는지 검토하세요. 실제
                            판정에는 실행기의 수집값 연결이 필요합니다.
                          </FieldDescription>
                        </Field>
                      </FieldGroup>
                    )}
                    <div className="mt-5 flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="type-label-md">
                          수집값 판정{" "}
                          <span className="text-interface-muted">· 선택</span>
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            changeCase(c.id, {
                              ...c,
                              assertions: [
                                ...c.assertions,
                                {
                                  key: `field_${crypto.randomUUID().slice(0, 6)}`,
                                  label: "새 비교 항목",
                                  expected: "",
                                },
                              ],
                            })
                          }
                        >
                          <Plus data-icon="inline-start" />
                          조건 추가
                        </Button>
                      </div>
                      {c.assertions.map((a, index) => (
                        <FieldGroup
                          key={index}
                          className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                        >
                          <Field>
                            <FieldLabel htmlFor={`label-${c.id}-${index}`}>
                              비교 항목
                            </FieldLabel>
                            <Input
                              id={`label-${c.id}-${index}`}
                              value={a.label}
                              disabled={busy}
                              onChange={(e) =>
                                changeCase(c.id, {
                                  ...c,
                                  assertions: c.assertions.map((v, i) =>
                                    i === index
                                      ? { ...v, label: e.target.value }
                                      : v,
                                  ),
                                })
                              }
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor={`key-${c.id}-${index}`}>
                              관측 필드
                            </FieldLabel>
                            <Input
                              id={`key-${c.id}-${index}`}
                              value={a.key}
                              disabled={busy}
                              onChange={(e) =>
                                changeCase(c.id, {
                                  ...c,
                                  assertions: c.assertions.map((v, i) =>
                                    i === index
                                      ? { ...v, key: e.target.value }
                                      : v,
                                  ),
                                })
                              }
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor={`expect-${c.id}-${index}`}>
                              기대값{a.unit ? ` (${a.unit})` : ""}
                            </FieldLabel>
                            <Input
                              id={`expect-${c.id}-${index}`}
                              aria-label={`${c.id} · ${c.name} / 기대 ${a.label}`}
                              value={
                                a.expected === null
                                  ? "null"
                                  : String(a.expected)
                              }
                              disabled={busy}
                              onChange={(e) =>
                                changeCase(c.id, {
                                  ...c,
                                  assertions: c.assertions.map((v, i) =>
                                    i === index
                                      ? {
                                          ...v,
                                          expected: parseValue(e.target.value),
                                        }
                                      : v,
                                  ),
                                })
                              }
                            />
                          </Field>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={busy}
                            aria-label={`${c.id} ${a.label} 조건 삭제`}
                            onClick={() =>
                              changeCase(c.id, {
                                ...c,
                                assertions: c.assertions.filter(
                                  (_, i) => i !== index,
                                ),
                              })
                            }
                          >
                            <Trash2 />
                          </Button>
                        </FieldGroup>
                      ))}
                      {!c.assertions.length && (
                        <FieldDescription>
                          실행기가 제공할 관측 필드와 기대값을 알고 있다면
                          추가하세요.
                        </FieldDescription>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
