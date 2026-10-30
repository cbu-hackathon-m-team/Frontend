import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { BlueAccentToggle } from '@/components/ui/blue-accent-toggle';
import { Button } from '@/components/ui/button';
import { DashboardThemeToggle } from './sidebar';
import { HeaderAccountMenu } from '@/components/auth/header-account-menu';
import { usePreviewSession } from '@/lib/preview-session';
export function DashboardHeader({ title }: { title: string }) {
  const { theme, setTheme } = useTheme();
  const signedIn = usePreviewSession();
  return <header className="sticky top-0 z-40 flex h-13 shrink-0 items-center justify-between border-b border-boundary-subtle bg-surface-canvas/80 px-4 backdrop-blur-lg">
    <h1 className="type-heading-sm"><Link to="/" className="focus-control rounded-sm" aria-label="홈으로">{title}</Link></h1>
    <div className="flex items-center gap-2">
      <DashboardThemeToggle theme={theme} setTheme={setTheme} />
      <BlueAccentToggle />
      {signedIn ? <HeaderAccountMenu context="design-system" /> : (
        <Button variant="ghost" size="sm" asChild><Link to="/login">Login</Link></Button>
      )}
    </div>
  </header>;
}
