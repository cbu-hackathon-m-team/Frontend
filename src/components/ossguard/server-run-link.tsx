import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BackendConnection } from "./backend-workspace";
import { useBackend } from "./backend-context";
import { errorText } from "./api";
import { projectHref } from "./model";
import { Alert, AlertDescription } from "@/components/ui/alert";
export function ServerRunLink() {
  const { api } = useBackend();
  const { runId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  useEffect(() => {
    if (!api || !runId) return;
    const controller = new AbortController();
    api
      .run(runId, controller.signal)
      .then((run) =>
        navigate(
          `${projectHref(run.project_id, "results")}&run=${encodeURIComponent(run.id)}`,
          { replace: true },
        ),
      )
      .catch((e) => {
        if (!controller.signal.aborted) setError(errorText(e));
      });
    return () => controller.abort();
  }, [api, runId, navigate]);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="type-heading-xl">검증 결과</h1>
      {!api ? (
        <BackendConnection />
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <p role="status" className="type-body-sm text-interface-secondary">
          실행을 확인하는 중…
        </p>
      )}
    </div>
  );
}
