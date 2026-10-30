import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GuardConsole } from "./guard-console";
import { caseResult, verdict } from "./sample";
afterEach(cleanup);
it("keeps baseline failures and unexecuted tests distinct from regression and passes", () => {
  expect(verdict("baseline")).toBe("기준 확인 필요");
  expect(caseResult("error", 3)).toBe("미검증");
  expect(caseResult("defect", 0)).toBe("규칙 위반");
  expect(caseResult("defect", 2)).toBe("통과");
  expect(caseResult("fixed", 0)).toBe("통과");
});
it("blocks starting a sample when required environment input is missing", () => {
  render(
    <MemoryRouter initialEntries={["/?tab=setup"]}>
      <GuardConsole />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("앱 이름 · 필수"), {
    target: { value: "" },
  });
  expect(screen.getByRole("button", { name: "샘플 검증 실행" })).toBeDisabled();
  expect(screen.getByRole("alert")).toHaveTextContent("앱 이름과 이메일");
});
it("invalidates confirmation when test expectations change and restores the sample", () => {
  render(
    <MemoryRouter initialEntries={["/?tab=tests"]}>
      <GuardConsole />
    </MemoryRouter>,
  );
  fireEvent.change(
    screen.getByLabelText("T01 · 정상 주문 / 기대 배송 요청 횟수"),
    { target: { value: "0" } },
  );
  expect(screen.getByRole("button", { name: "샘플 검증 실행" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "샘플 기준 확정" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "기대값 복원" }));
  fireEvent.click(screen.getByRole("button", { name: "샘플 기준 확정" }));
  expect(screen.getByRole("button", { name: "샘플 검증 실행" })).toBeEnabled();
});
