import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { errorText, type GuardApi, type HttpCase, type Suite } from "./api";

function JsonField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState(false);
  return (
    <Field data-invalid={error || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        value={text}
        disabled={disabled}
        aria-invalid={error}
        onChange={(e) => {
          setText(e.target.value);
          try {
            const v: unknown = JSON.parse(e.target.value);
            onChange(v);
            setError(false);
          } catch {
            setError(true);
            onChange(value);
          }
        }}
      />
      {error && (
        <span className="type-body-xs text-signal-danger">
          JSON 형식을 확인하세요. 마지막 유효 값이 유지됩니다.
        </span>
      )}
    </Field>
  );
}
export function ServerTests({
  api,
  projectId,
  suite,
  rule,
  inputSchema = {},
  dirty,
  onChange,
  onRule,
  onSaved,
}: {
  api: GuardApi;
  projectId: string;
  suite: Suite;
  rule: string;
  inputSchema?: Record<string, unknown>;
  dirty: boolean;
  onChange: (value: Suite) => void;
  onRule: (value: string) => void;
  onSaved: (value: Suite) => void;
}) {
  const [selected, setSelected] = useState(suite.cases[0]?.id);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const editor = useRef<HTMLDivElement>(null);
  const current = suite.cases.find((c) => c.id === selected) ?? suite.cases[0];
  function change(c: HttpCase) {
    onChange({
      ...suite,
      approved: false,
      cases: suite.cases.map((v) => (v.id === c.id ? c : v)),
    });
  }
  async function save(generate = false) {
    const invalid = editor.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    if (!generate && invalid) {
      invalid.focus();
      setError(
        "JSON 형식을 먼저 확인하세요. 테스트는 아직 승인하지 않았습니다.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.request(`/api/projects/${projectId}/rules`, "PUT", {
        description: rule,
        input_schema: inputSchema,
      });
      if (generate) {
        const next = await api.request<Suite>(
          `/api/projects/${projectId}/test-suites/generate`,
          "POST",
        );
        onSaved(next);
        setSelected(next.cases[0]?.id);
      } else {
        const body = { cases: suite.cases, stubs: suite.stubs, approved: true };
        const next = await api.request<Suite>(
          suite.id
            ? `/api/test-suites/${suite.id}`
            : `/api/projects/${projectId}/test-suites`,
          suite.id ? "PUT" : "POST",
          body,
        );
        onSaved(next);
      }
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div ref={editor} className="flex min-w-0 flex-col gap-5">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Field>
        <FieldLabel htmlFor="server-rule">업무 규칙</FieldLabel>
        <Textarea
          id="server-rule"
          value={rule}
          disabled={busy}
          onChange={(e) => onRule(e.target.value)}
        />
        <div>
          <Button
            variant="outline"
            disabled={busy || !rule.trim()}
            onClick={() => void save(true)}
          >
            AI 테스트 초안
          </Button>
        </div>
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="type-heading-sm">
            업무 테스트 {suite.cases.length}개
          </h2>
          <Badge variant={!dirty && suite.approved ? "success" : "warning"}>
            {!dirty && suite.approved ? "승인됨" : "검토 필요"}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={busy || suite.cases.length >= 30}
            onClick={() => {
              const id = `T-${crypto.randomUUID().slice(0, 8)}`;
              onChange({
                ...suite,
                approved: false,
                cases: [
                  ...suite.cases,
                  {
                    id,
                    method: "POST",
                    path: "/",
                    body: {},
                    expected_status: 200,
                    assertions: [],
                    external: [],
                    ignore_paths: [],
                  },
                ],
              });
              setSelected(id);
            }}
          >
            <Plus />
            테스트 추가
          </Button>
          <Button
            disabled={busy || !suite.cases.length}
            onClick={() => void save()}
          >
            {busy ? "저장 중…" : "테스트 저장·승인"}
          </Button>
        </div>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav className="flex flex-col gap-1" aria-label="서버 테스트 선택">
          {suite.cases.map((c) => (
            <Button
              key={c.id}
              variant={c.id === current?.id ? "secondary" : "ghost"}
              className="h-auto min-w-0 w-full justify-start whitespace-normal text-left"
              disabled={busy}
              onClick={() => setSelected(c.id)}
            >
              <span className="min-w-0 py-2">
                <span className="block type-code-sm text-interface-muted">
                  {c.id}
                </span>
                <span className="block break-all">
                  {c.method} {c.path}
                </span>
              </span>
            </Button>
          ))}
        </nav>
        {current && (
          <Card key={current.id} variant="panel" className="min-w-0">
            <CardHeader className="px-5 py-4 md:px-5">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{current.id}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="선택 테스트 삭제"
                  disabled={busy}
                  onClick={() =>
                    onChange({
                      ...suite,
                      approved: false,
                      cases: suite.cases.filter((c) => c.id !== current.id),
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex min-w-0 flex-col gap-5 px-5 pb-5 md:px-5 md:pb-5">
              <FieldGroup className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                <Field>
                  <FieldLabel htmlFor="case-method">HTTP 메서드</FieldLabel>
                  <Select
                    value={current.method}
                    onValueChange={(method) => change({ ...current, method })}
                    disabled={busy}
                  >
                    <SelectTrigger id="case-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {["GET", "POST", "PUT", "PATCH", "DELETE"].map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="case-path">요청 경로</FieldLabel>
                  <Input
                    id="case-path"
                    value={current.path}
                    disabled={busy}
                    onChange={(e) =>
                      change({ ...current, path: e.target.value })
                    }
                  />
                </Field>
              </FieldGroup>
              <JsonField
                id="case-body"
                label="동일 요청 본문 · JSON"
                value={current.body}
                disabled={busy}
                onChange={(body) => change({ ...current, body })}
              />
              <Field>
                <FieldLabel htmlFor="case-status">기대 HTTP 상태</FieldLabel>
                <Input
                  id="case-status"
                  type="number"
                  min={100}
                  max={599}
                  disabled={busy}
                  value={current.expected_status}
                  onChange={(e) =>
                    change({
                      ...current,
                      expected_status: Number(e.target.value),
                    })
                  }
                />
              </Field>
              <div className="flex items-center justify-between gap-3">
                <h3 className="type-heading-sm">응답 필드 검증</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    change({
                      ...current,
                      assertions: [
                        ...current.assertions,
                        { path: "", op: "eq", value: null },
                      ],
                    })
                  }
                >
                  <Plus />
                  조건 추가
                </Button>
              </div>
              {current.assertions.map((a, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-md border border-boundary-default p-3"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:grid-cols-[minmax(0,1fr)_100px_auto]">
                    <Field className="col-span-2 sm:col-span-1">
                      <FieldLabel htmlFor={`json-path-${index}`}>
                        JSON 경로
                      </FieldLabel>
                      <Input
                        id={`json-path-${index}`}
                        value={a.path}
                        disabled={busy}
                        onChange={(e) =>
                          change({
                            ...current,
                            assertions: current.assertions.map((v, i) =>
                              i === index ? { ...v, path: e.target.value } : v,
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`json-op-${index}`}>조건</FieldLabel>
                      <Select
                        value={a.op}
                        disabled={busy}
                        onValueChange={(op) =>
                          change({
                            ...current,
                            assertions: current.assertions.map((v, i) =>
                              i === index
                                ? { ...v, op: op as "eq" | "gte" }
                                : v,
                            ),
                          })
                        }
                      >
                        <SelectTrigger id={`json-op-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="eq">같음</SelectItem>
                            <SelectItem value="gte">이상</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`${index + 1}번째 응답 조건 삭제`}
                      disabled={busy}
                      onClick={() =>
                        change({
                          ...current,
                          assertions: current.assertions.filter(
                            (_, i) => i !== index,
                          ),
                        })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <JsonField
                    id={`json-value-${index}`}
                    label="기대값 · JSON"
                    value={a.value}
                    disabled={busy}
                    onChange={(value) =>
                      change({
                        ...current,
                        assertions: current.assertions.map((v, i) =>
                          i === index ? { ...v, value } : v,
                        ),
                      })
                    }
                  />
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <h3 className="type-heading-sm">외부 API 호출</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    change({
                      ...current,
                      external: [
                        ...current.external,
                        {
                          method: "POST",
                          path: "/",
                          count: 1,
                          response_status: 200,
                          body_contains: {},
                        },
                      ],
                    })
                  }
                >
                  <Plus />
                  호출 추가
                </Button>
              </div>
              {current.external.map((e, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-md border border-boundary-default p-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={`external-method-${index}`}>
                        HTTP 메서드
                      </FieldLabel>
                      <Input
                        id={`external-method-${index}`}
                        value={e.method}
                        disabled={busy}
                        onChange={(event) =>
                          change({
                            ...current,
                            external: current.external.map((v, i) =>
                              i === index
                                ? { ...v, method: event.target.value }
                                : v,
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`external-path-${index}`}>
                        외부 경로
                      </FieldLabel>
                      <Input
                        id={`external-path-${index}`}
                        value={e.path}
                        disabled={busy}
                        onChange={(event) =>
                          change({
                            ...current,
                            external: current.external.map((v, i) =>
                              i === index
                                ? { ...v, path: event.target.value }
                                : v,
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`external-count-${index}`}>
                        기대 호출 횟수
                      </FieldLabel>
                      <Input
                        id={`external-count-${index}`}
                        type="number"
                        min={0}
                        max={100}
                        value={e.count}
                        disabled={busy}
                        onChange={(event) =>
                          change({
                            ...current,
                            external: current.external.map((v, i) =>
                              i === index
                                ? { ...v, count: Number(event.target.value) }
                                : v,
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`external-status-${index}`}>
                        기대 Mock 응답 상태
                      </FieldLabel>
                      <Input
                        id={`external-status-${index}`}
                        type="number"
                        min={100}
                        max={599}
                        value={e.response_status}
                        disabled={busy}
                        onChange={(event) =>
                          change({
                            ...current,
                            external: current.external.map((v, i) =>
                              i === index
                                ? {
                                    ...v,
                                    response_status: Number(event.target.value),
                                  }
                                : v,
                            ),
                          })
                        }
                      />
                    </Field>
                  </div>
                  <JsonField
                    id={`external-body-${index}`}
                    label="호출 식별 조건 · JSON"
                    value={e.body_contains}
                    disabled={busy}
                    onChange={(body) =>
                      change({
                        ...current,
                        external: current.external.map((v, i) =>
                          i === index
                            ? {
                                ...v,
                                body_contains: body as Record<string, unknown>,
                              }
                            : v,
                        ),
                      })
                    }
                  />
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        change({
                          ...current,
                          external: current.external.filter(
                            (_, i) => i !== index,
                          ),
                        })
                      }
                    >
                      <Trash2 />
                      호출 조건 삭제
                    </Button>
                  </div>
                </div>
              ))}
              <Accordion type="single" collapsible>
                <AccordionItem value="advanced">
                  <AccordionTrigger>
                    고급 설정 · Mock 응답·비교 제외 필드
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4">
                      <JsonField
                        id="suite-stubs"
                        label="Mock 응답 목록 · JSON"
                        value={suite.stubs}
                        disabled={busy}
                        onChange={(v) =>
                          onChange({
                            ...suite,
                            approved: false,
                            stubs: v as Suite["stubs"],
                          })
                        }
                      />
                      <JsonField
                        id="ignore-paths"
                        label="비교 제외 JSON 경로 · 배열"
                        value={current.ignore_paths}
                        disabled={busy}
                        onChange={(v) =>
                          change({ ...current, ignore_paths: v as string[] })
                        }
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
