import type { ReactNode } from "react";

export function WorkspacePageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1
          id="workspace-page-title"
          className="type-heading-xl text-interface-contrast"
        >
          {title}
        </h1>
        <p className="mt-2 type-body-md text-interface-secondary">
          {description}
        </p>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
