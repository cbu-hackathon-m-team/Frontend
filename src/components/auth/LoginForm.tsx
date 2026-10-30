import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { startPreviewSession } from "@/lib/preview-session";

export function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Frontend preview only; replace with the authentication API when available.
    startPreviewSession();
    navigate("/dashboard", { replace: true });
  };
  return (
    <div className="login-form">
      <div className="login-heading">
        <h1 className="type-display-md">Hapalin에 로그인</h1>
        <p className="type-body-md text-interface-secondary">
          워크스페이스에서 작업을 이어가세요.
        </p>
      </div>
      <form onSubmit={handleSubmit} aria-label="로그인">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">아이디</FieldLabel>
            <Input
              id="username"
              name="username"
              placeholder="아이디를 입력하세요"
              autoComplete="username"
              className="h-11"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">비밀번호</FieldLabel>
            <InputGroup className="h-11">
              <InputGroupInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                required
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-sm"
                  aria-label={
                    showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                  }
                  aria-controls="password"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Button type="submit" size="lg" className="w-full">
            로그인 <ArrowRight data-icon="inline-end" />
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
