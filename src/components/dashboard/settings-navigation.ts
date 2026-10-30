import { ArrowLeft, CreditCard, Monitor, ReceiptText, Settings2, Users } from "lucide-react";

export const settingsNavigationGroups = [
  {
    title: "워크스페이스 설정",
    items: [
      { href: "/dashboard/settings", title: "일반", icon: Settings2 },
      { href: "/dashboard/settings/members", title: "멤버", icon: Users },
      { href: "/dashboard/settings/plans", title: "요금제", icon: CreditCard },
      { href: "/dashboard/settings/invoices", title: "청구서", icon: ReceiptText },
    ],
  },
  {
    title: "개인 설정",
    items: [
      { href: "/dashboard/settings/appearance", title: "화면 설정", icon: Monitor },
    ],
  },
];

export const settingsNavigation = settingsNavigationGroups.flatMap(group => group.items);
export const workspaceReturn = { href: "/dashboard", title: "돌아가기", icon: ArrowLeft };
export const isSettingsPath = (path: string) => path === "/dashboard/settings" || path.startsWith("/dashboard/settings/");
