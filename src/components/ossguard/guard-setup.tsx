import { RepositorySetup, repositoryReady } from "./repository-setup";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ValidationProject } from "./model";

export function validSetup(project: ValidationProject) {
  if (project.repository) return repositoryReady(project);
  return !!(
    project.target.name.trim() &&
    project.target.id !== "custom" &&
    project.baseline.label.trim() &&
    project.candidate.label.trim() &&
    project.connection?.entry.trim()
  );
}
export function GuardSetup({
  project,
  templates,
  scenario,
  email,
  busy,
  onChange,
  onTemplate,
  onScenario,
  onEmail,
  onNext,
}: {
  project: ValidationProject;
  templates: ValidationProject[];
  scenario: string;
  email: string;
  busy: boolean;
  onChange: (p: ValidationProject) => void;
  onTemplate: (p: ValidationProject) => void;
  onScenario: (s: string) => void;
  onEmail: (s: string) => void;
  onNext: () => void;
}) {
  if (project.repository)
    return (
      <RepositorySetup
        project={project}
        email={email}
        busy={busy}
        onChange={onChange}
        onEmail={onEmail}
        onNext={onNext}
      />
    );
  const connection = project.connection ?? { entry: "", dependencies: [] };
  return (
    <div className="flex flex-col gap-5">
      <Card variant="panel">
        <CardHeader className="px-5 py-4 md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>업데이트할 대상</CardTitle>
            {templates.map((t) => (
              <Button
                key={t.id}
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => onTemplate(t)}
              >
                {t.target.name} 샘플로 채우기
              </Button>
            ))}
          </div>
          <CardDescription>
            소프트웨어 이름만으로 업무를 알 수 없습니다. 실행할 버전과 설정
            파일을 함께 지정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 md:px-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="target-name">
                오픈소스·서비스 이름
              </FieldLabel>
              <Input
                id="target-name"
                placeholder="검증할 소프트웨어 이름"
                value={
                  project.target.id === "custom" ? "" : project.target.name
                }
                disabled={busy}
                onChange={(e) =>
                  onChange({
                    ...project,
                    target: {
                      ...project.target,
                      id: "configured",
                      name: e.target.value,
                    },
                  })
                }
              />
            </Field>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              {(["baseline", "candidate"] as const).map((key, i) => (
                <div
                  key={key}
                  className="flex flex-col gap-3 rounded-lg border border-boundary-subtle p-4"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{i === 0 ? "A" : "B"}</Badge>
                    <h3 className="type-label-lg">
                      {i === 0 ? "기존 환경" : "업데이트 후보"}
                    </h3>
                  </div>
                  <Field>
                    <FieldLabel htmlFor={`${key}-version`}>
                      버전·배포 식별자
                    </FieldLabel>
                    <Input
                      id={`${key}-version`}
                      value={project[key].label}
                      placeholder={
                        i === 0 ? "현재 사용 중인 버전" : "비교할 새 버전"
                      }
                      disabled={busy}
                      onChange={(e) =>
                        onChange({
                          ...project,
                          [key]: { ...project[key], label: e.target.value },
                        })
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${key}-artifact`}>
                      업무 설정·아티팩트
                    </FieldLabel>
                    <Input
                      id={`${key}-artifact`}
                      value={project[key].artifact}
                      placeholder="이미지 또는 설정 파일 참조"
                      disabled={busy}
                      onChange={(e) =>
                        onChange({
                          ...project,
                          [key]: { ...project[key], artifact: e.target.value },
                        })
                      }
                    />
                  </Field>
                </div>
              ))}
            </FieldGroup>
          </FieldGroup>
        </CardContent>
      </Card>
      <Card variant="panel">
        <CardHeader className="px-5 py-4 md:px-5">
          <CardTitle>업무가 연결되는 방식</CardTitle>
          <CardDescription>
            어떤 요청을 보내고, 소프트웨어가 어떤 외부 서비스를 호출하는지
            지정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 px-5 md:px-5">
          <div
            className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]"
            aria-label="검증 환경 구성"
          >
            <div className="rounded-lg border border-boundary-subtle p-4">
              <p className="type-label-md">테스트 입력</p>
              <p className="mt-1 type-body-sm text-interface-secondary">
                사용자가 정한 요청·데이터
              </p>
            </div>
            <ArrowRight className="hidden size-4 text-interface-muted sm:block" />
            <div className="rounded-lg border border-boundary-subtle p-4">
              <p className="type-label-md">격리된 A / B</p>
              <p className="mt-1 type-body-sm text-interface-secondary">
                같은 입력으로 각각 실행
              </p>
            </div>
            <ArrowRight className="hidden size-4 text-interface-muted sm:block" />
            <div className="rounded-lg border border-boundary-subtle p-4">
              <p className="type-label-md">
                {connection.dependencies.length
                  ? "모의 외부 API"
                  : "응답·실행 기록"}
              </p>
              <p className="mt-1 type-body-sm text-interface-secondary">
                {connection.dependencies.length
                  ? "호출 횟수·순서·내용 기록"
                  : "실제 결과와 기대 동작 비교"}
              </p>
            </div>
          </div>
          <Field>
            <FieldLabel htmlFor="request-entry">요청을 보낼 경로</FieldLabel>
            <Input
              id="request-entry"
              value={connection.entry}
              placeholder="예: POST /orders"
              disabled={busy}
              onChange={(e) =>
                onChange({
                  ...project,
                  connection: { ...connection, entry: e.target.value },
                })
              }
            />
          </Field>
          <div className="flex items-center justify-between gap-3">
            <h3 className="type-label-lg">
              외부 API · 선택 ({connection.dependencies.length}개)
            </h3>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() =>
                onChange({
                  ...project,
                  connection: {
                    ...connection,
                    dependencies: [
                      ...connection.dependencies,
                      { name: "", endpoint: "" },
                    ],
                  },
                })
              }
            >
              <Plus data-icon="inline-start" />
              API 추가
            </Button>
          </div>
          {connection.dependencies.map((d, i) => (
            <FieldGroup
              key={i}
              className="grid items-end gap-3 sm:grid-cols-[1fr_2fr_auto]"
            >
              <Field>
                <FieldLabel htmlFor={`dep-name-${i}`}>서비스 이름</FieldLabel>
                <Input
                  id={`dep-name-${i}`}
                  value={d.name}
                  disabled={busy}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      connection: {
                        ...connection,
                        dependencies: connection.dependencies.map((x, n) =>
                          n === i ? { ...x, name: e.target.value } : x,
                        ),
                      },
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`dep-endpoint-${i}`}>
                  모의 API 주소
                </FieldLabel>
                <Input
                  id={`dep-endpoint-${i}`}
                  value={d.endpoint}
                  disabled={busy}
                  placeholder="mock://service/path"
                  onChange={(e) =>
                    onChange({
                      ...project,
                      connection: {
                        ...connection,
                        dependencies: connection.dependencies.map((x, n) =>
                          n === i ? { ...x, endpoint: e.target.value } : x,
                        ),
                      },
                    })
                  }
                />
              </Field>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={busy}
                aria-label={`외부 API ${i + 1} 삭제`}
                onClick={() =>
                  onChange({
                    ...project,
                    connection: {
                      ...connection,
                      dependencies: connection.dependencies.filter(
                        (_, n) => n !== i,
                      ),
                    },
                  })
                }
              >
                <Trash2 />
              </Button>
            </FieldGroup>
          ))}
          <FieldDescription>
            이 화면에서는 실제 회사 API에 요청하지 않습니다. 운영 환경과 분리한
            모의 연결을 정의합니다.
          </FieldDescription>
        </CardContent>
      </Card>
      <div className="grid items-start gap-5 md:grid-cols-2">
        {!!project.samples.length && (
          <Card variant="panel">
            <CardHeader className="px-5 py-4 md:px-5">
              <CardTitle>비교할 샘플 기록</CardTitle>
            </CardHeader>
            <CardContent className="px-5 md:px-5">
              <Field>
                <FieldLabel htmlFor="sample-source">후보 상태</FieldLabel>
                <Select
                  value={scenario}
                  onValueChange={onScenario}
                  disabled={busy}
                >
                  <SelectTrigger id="sample-source" aria-label="시연 시나리오">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {project.samples.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  지금은 미리 수집한 기록으로 비교 기능을 체험합니다.
                </FieldDescription>
              </Field>
            </CardContent>
          </Card>
        )}
        <Card variant="panel">
          <CardHeader className="px-5 py-4 md:px-5">
            <CardTitle>결과 알림</CardTitle>
          </CardHeader>
          <CardContent className="px-5 md:px-5">
            <Field>
              <FieldLabel htmlFor="notification-email">
                이메일 · 선택
              </FieldLabel>
              <Input
                id="notification-email"
                type="email"
                value={email}
                disabled={busy}
                placeholder="team@example.com"
                onChange={(e) => onEmail(e.target.value)}
              />
              <FieldDescription>
                주소만 저장하며 현재 데모에서는 발송하지 않습니다.
              </FieldDescription>
            </Field>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end">
        <Button disabled={busy || !validSetup(project)} onClick={onNext}>
          다음: 테스트 정의
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
