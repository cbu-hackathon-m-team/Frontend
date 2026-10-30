import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { DashboardThemeToggle } from '@/components/dashboard/sidebar';
import { ArrowUpRight, Layers2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SiteHeader({ navigation }: { navigation?: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();
  return <header className="site-header">
    <Link to="/" className="site-brand"><Layers2 aria-hidden="true" /><span>hapalin<span className="site-brand-dot">®</span></span></Link>
    <nav aria-label="주 메뉴" className="site-navigation">
      {navigation ?? <Link to="/design-system" className="site-text-link">Design system <ArrowUpRight aria-hidden="true" /></Link>}
      <div className="site-appearance"><DashboardThemeToggle theme={theme} setTheme={setTheme} /></div>
      {pathname !== '/login' && <Button variant="outline" asChild><Link to="/login">로그인</Link></Button>}
    </nav>
  </header>;
}
