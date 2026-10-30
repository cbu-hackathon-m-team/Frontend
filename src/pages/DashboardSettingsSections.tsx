import { CreditCard, ReceiptText, UserPlus, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { DashboardThemeToggle } from "@/components/dashboard/sidebar";
import { WorkspacePageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SettingsMembers() {
  return <div className="flex flex-col gap-8">
    <WorkspacePageHeader title="멤버"
      actions={<Button disabled title="멤버 초대는 준비 중입니다."><UserPlus data-icon="inline-start" />멤버 초대</Button>} />
    <Table>
      <TableHeader><TableRow><TableHead>멤버</TableHead><TableHead>이메일</TableHead><TableHead>역할</TableHead></TableRow></TableHeader>
      <TableBody><TableRow><TableCell colSpan={3}>
        <Empty><EmptyHeader><EmptyMedia variant="icon"><Users /></EmptyMedia><EmptyTitle>등록된 멤버가 없습니다</EmptyTitle><EmptyDescription>초대된 멤버와 워크스페이스 역할이 여기에 표시됩니다.</EmptyDescription></EmptyHeader></Empty>
      </TableCell></TableRow></TableBody>
    </Table>
  </div>;
}

export function SettingsPlans() {
  return <div className="flex flex-col gap-8">
    <WorkspacePageHeader title="요금제" />
    <section className="grid gap-6 border-t border-boundary-subtle pt-7 sm:grid-cols-3" aria-labelledby="settings-plan">
      <div><h2 id="settings-plan" className="type-heading-sm">현재 요금제</h2><p className="mt-2 type-body-md text-interface-secondary">워크스페이스에 적용되는 구독입니다.</p></div>
      <div className="flex flex-col items-start gap-4 sm:col-span-2">
        <Badge variant="outline">미등록</Badge>
        <p className="type-body-md text-interface-secondary">활성화된 요금제가 없습니다.</p>
        <Button variant="secondary" disabled title="요금제 선택은 준비 중입니다.">요금제 선택</Button>
      </div>
    </section>
    <section className="grid gap-6 border-t border-boundary-subtle pt-7 sm:grid-cols-3" aria-labelledby="settings-payment">
      <h2 id="settings-payment" className="type-heading-sm">결제 정보</h2>
      <div className="flex flex-col items-start gap-4 sm:col-span-2">
        <p className="type-body-md text-interface-secondary">등록된 결제 수단이 없습니다.</p>
        <Button variant="secondary" disabled title="결제 관리는 준비 중입니다."><CreditCard data-icon="inline-start" />결제 정보 관리</Button>
      </div>
    </section>
  </div>;
}

export function SettingsInvoices() {
  return <div className="flex flex-col gap-8">
    <WorkspacePageHeader title="청구서" />
    <Table>
      <TableHeader><TableRow><TableHead>발행일</TableHead><TableHead>내역</TableHead><TableHead>금액</TableHead><TableHead>상태</TableHead></TableRow></TableHeader>
      <TableBody><TableRow><TableCell colSpan={4}>
        <Empty><EmptyHeader><EmptyMedia variant="icon"><ReceiptText /></EmptyMedia><EmptyTitle>발행된 청구서가 없습니다</EmptyTitle><EmptyDescription>결제 내역이 생기면 청구서를 여기에서 확인할 수 있습니다.</EmptyDescription></EmptyHeader></Empty>
      </TableCell></TableRow></TableBody>
    </Table>
  </div>;
}

export function SettingsAppearance() {
  const { theme, setTheme } = useTheme();
  return <div className="flex flex-col gap-8">
    <WorkspacePageHeader title="화면 설정" />
    <section className="grid gap-6 border-t border-boundary-subtle pt-7 sm:grid-cols-3" aria-labelledby="workspace-appearance">
      <div><h2 id="workspace-appearance" className="type-heading-sm">화면 모드</h2><p className="mt-2 type-body-md text-interface-secondary">모든 페이지에 같은 테마가 적용됩니다.</p></div>
      <div className="flex items-center justify-between gap-4 sm:col-span-2">
        <div><h3 className="type-label-md">시스템 설정, 라이트, 다크</h3><p className="mt-1 type-body-sm text-interface-subtle">시스템 설정은 기기의 화면 모드를 따릅니다.</p></div>
        <DashboardThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </section>
  </div>;
}
