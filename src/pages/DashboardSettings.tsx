import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { WorkspacePageHeader } from "@/components/dashboard/page-header";
import { useWorkspace } from "@/components/dashboard/dashboard-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DashboardSettings() {
  const { workspace, error: loadError, saveWorkspace } = useWorkspace();
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description);
  const [nameError, setNameError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    const message = saveWorkspace({
      name: name.trim(),
      description: description.trim(),
    });
    setError(message);
    if (!message) toast.success("워크스페이스 정보를 저장했습니다.");
  }
  return (
    <div className="flex flex-col gap-8">
      <WorkspacePageHeader
        title="워크스페이스 설정"
        description="워크스페이스 정보와 작업 환경을 관리하세요."
      />
      {(loadError || error) && (
        <Alert variant="destructive">
          <AlertDescription>{loadError || error}</AlertDescription>
        </Alert>
      )}
      <section
        className="grid gap-6 border-t border-boundary-subtle pt-7 lg:grid-cols-3"
        aria-labelledby="workspace-general"
      >
        <div>
          <h2 id="workspace-general" className="type-heading-sm">
            일반
          </h2>
          <p className="mt-2 max-w-64 type-body-md text-interface-secondary">
            사이드바와 탐색 경로에 표시되는 정보입니다.
          </p>
        </div>
        <form
          className="flex max-w-xl flex-col gap-5 lg:col-span-2"
          onSubmit={submit}
        >
          <FieldGroup>
            <Field data-invalid={nameError || undefined}>
              <FieldLabel htmlFor="workspace-name">
                워크스페이스 이름
              </FieldLabel>
              <Input
                id="workspace-name"
                value={name}
                maxLength={80}
                required
                aria-invalid={nameError || undefined}
                aria-describedby={
                  nameError ? "workspace-name-error" : undefined
                }
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError(false);
                }}
              />
              {nameError && (
                <FieldError id="workspace-name-error">
                  이름을 입력해 주세요.
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="workspace-description">
                설명 <span className="text-interface-subtle">(선택)</span>
              </FieldLabel>
              <Textarea
                id="workspace-description"
                value={description}
                maxLength={500}
                rows={3}
                placeholder="어떤 작업을 위한 공간인가요?"
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>
          </FieldGroup>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                !!loadError ||
                (name.trim() === workspace.name &&
                  description.trim() === workspace.description)
              }
            >
              변경사항 저장
            </Button>
          </div>
        </form>
      </section>


      <section
        className="grid gap-6 border-t border-boundary-subtle pt-7 lg:grid-cols-3"
        aria-labelledby="workspace-storage"
      >
        <div>
          <h2 id="workspace-storage" className="type-heading-sm">
            데이터 저장
          </h2>
        </div>
        <div className="max-w-xl lg:col-span-2">
          <p className="type-body-md text-interface-secondary">
            프로젝트와 워크스페이스 정보는 현재 브라우저에 저장됩니다. 브라우저
            데이터를 삭제하면 저장한 내용도 삭제됩니다.
          </p>
        </div>
      </section>
    </div>
  );
}
