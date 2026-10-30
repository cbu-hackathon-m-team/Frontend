import { lazy, Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import { ProjectWorkspace } from "@/components/dashboard/project-workspace";
import DashboardActivity from "@/pages/DashboardActivity";
import DashboardSettings from "@/pages/DashboardSettings";
import { SettingsAppearance, SettingsInvoices, SettingsMembers, SettingsPlans } from "@/pages/DashboardSettingsSections";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DesignSystemPending } from "@/pages/design-system/_components/page-loading";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ServerRunLink } from "@/components/ossguard/server-run-link";
const DesignSystem = lazy(() => import("@/pages/design-system"));
const Presentation = lazy(() => import("@/pages/presentation/Presentation"));
export default function App() {
  return (
    <div className="flex h-dvh min-h-0 w-full flex-col">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/ppt" element={<Suspense fallback={<div className="flex flex-1 items-center justify-center bg-surface-canvas text-interface-secondary" role="status">발표를 준비하고 있습니다…</div>}><Presentation /></Suspense>} />
        <Route
          path="/design-system"
          element={
            <SidebarProvider className="h-dvh min-h-0 flex-col">
              <Suspense fallback={<DesignSystemPending />}>
                <DesignSystem />
              </Suspense>
            </SidebarProvider>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectWorkspace />} />
          <Route path="activity" element={<DashboardActivity />} />
          <Route path="settings" element={<DashboardSettings />} />
          <Route path="settings/members" element={<SettingsMembers />} />
          <Route path="settings/plans" element={<SettingsPlans />} />
          <Route path="settings/invoices" element={<SettingsInvoices />} />
          <Route path="settings/appearance" element={<SettingsAppearance />} />
        </Route>
        <Route path="/validations/:runId" element={<DashboardLayout />}><Route index element={<ServerRunLink />} /></Route>
        <Route path="*" element={<Navigate to="/design-system" replace />} />
      </Routes>
    </div>
  );
}
