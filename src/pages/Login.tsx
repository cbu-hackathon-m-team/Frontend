import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Layers2, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { transitionAppearance } from "@/lib/appearance-transition";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";

function LoginAppearanceMenu() {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="화면 설정">
          <SunMoon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top">
        <DropdownMenuLabel>화면 설정</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => transitionAppearance(() => setTheme(value))}
        >
          <DropdownMenuRadioItem value="system">
            시스템 설정
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light">라이트</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">다크</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function LoginPage() {
  useEffect(() => {
    document.title = "로그인 | Hapalin";
  }, []);
  return (
    <main className="public-page login-layout">
      <section className="login-brand-panel" aria-label="Hapalin">
        <div className="login-brand-atmosphere" aria-hidden="true" />
        <div className="login-brand-content">
          <Link to="/" className="login-brand" aria-label="Hapalin 홈">
            <Layers2 aria-hidden="true" />
            <span>Hapalin</span>
          </Link>
          <h2 className="type-display-md">
            다음 웹사이트를
            <br />
            Hapalin에서 만드세요.
          </h2>
        </div>
      </section>
      <section className="login-form-region" aria-label="로그인">
        <div className="login-back">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft data-icon="inline-start" />
              홈으로
            </Link>
          </Button>
        </div>
        <div className="login-form-content">
          <Link to="/" className="login-mobile-brand" aria-label="Hapalin 홈">
            <Layers2 aria-hidden="true" />
            Hapalin
          </Link>
          <LoginForm />
        </div>
        <footer className="login-footer">
          <span>© 2026 Hapalin</span>
          <LoginAppearanceMenu />
        </footer>
      </section>
    </main>
  );
}
