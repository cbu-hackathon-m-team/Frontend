import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { endPreviewSession, PREVIEW_SESSION_KEY } from "@/lib/preview-session";

beforeEach(endPreviewSession);
afterEach(() => { cleanup(); endPreviewSession(); });

it("requires both fields before continuing to the dashboard", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<h1>대시보드</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  await user.click(screen.getByRole("button", { name: "로그인" }));
  expect(screen.getByRole("heading", { name: "Hapalin에 로그인" })).toBeInTheDocument();
  expect(localStorage.getItem(PREVIEW_SESSION_KEY)).toBeNull();
  await user.type(screen.getByLabelText("아이디", { exact: true }), "demo");
  await user.click(screen.getByRole("button", { name: "로그인" }));
  expect(screen.getByRole("heading", { name: "Hapalin에 로그인" })).toBeInTheDocument();
  expect(localStorage.getItem(PREVIEW_SESSION_KEY)).toBeNull();
  await user.type(screen.getByLabelText("비밀번호", { exact: true }), "demo-password");
  await user.click(screen.getByRole("button", { name: "비밀번호 보기" }));
  expect(screen.getByLabelText("비밀번호", { exact: true })).toHaveAttribute("type", "text");
  await user.click(screen.getByRole("button", { name: "로그인" }));
  expect(await screen.findByRole("heading", { name: "대시보드" })).toBeInTheDocument();
  expect(localStorage.getItem(PREVIEW_SESSION_KEY)).toBe("active");
});
