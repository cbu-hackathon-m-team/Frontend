import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ProjectWorkspace } from "./project-workspace";
import { PROJECTS_STORAGE_KEY, readProjects, type Project } from "./projects";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

it("creates, searches, edits, reloads, and confirms deletion of a project", async () => {
  const user = userEvent.setup();
  const view = render(<ProjectWorkspace />);
  await user.click(screen.getByRole("button", { name: "새 프로젝트" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("프로젝트 이름"), {
    target: { value: "   " },
  });
  await user.click(
    within(dialog).getByRole("button", { name: "프로젝트 만들기" }),
  );
  expect(within(dialog).getByLabelText("프로젝트 이름")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  fireEvent.change(within(dialog).getByLabelText("프로젝트 이름"), {
    target: { value: "브랜드 웹사이트" },
  });
  fireEvent.change(within(dialog).getByLabelText(/설명/), {
    target: { value: "제품과 팀을 소개하는 페이지" },
  });
  await user.click(
    within(dialog).getByRole("button", { name: "프로젝트 만들기" }),
  );
  expect(
    await screen.findByRole("button", {
      name: "브랜드 웹사이트 프로젝트 관리",
    }),
  ).toBeInTheDocument();
  expect(readProjects()[0].description).toBe("제품과 팀을 소개하는 페이지");
  expect(
    await screen.findByRole("button", { name: "새 프로젝트" }),
  ).toHaveFocus();
  fireEvent.change(screen.getByRole("textbox", { name: "프로젝트 검색" }), {
    target: { value: "없는 이름" },
  });
  expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "검색 초기화" }));
  await user.click(
    screen.getByRole("button", { name: "브랜드 웹사이트 프로젝트 관리" }),
  );
  fireEvent.change(screen.getByLabelText("프로젝트 이름"), {
    target: { value: "리뉴얼 프로젝트" },
  });
  await user.click(screen.getByRole("button", { name: "변경사항 저장" }));
  view.unmount();
  render(<ProjectWorkspace />);
  await user.click(
    screen.getByRole("button", { name: "리뉴얼 프로젝트 프로젝트 관리" }),
  );
  await user.click(screen.getByRole("button", { name: "삭제" }));
  let confirmation = screen.getByRole("alertdialog");
  await user.click(within(confirmation).getByRole("button", { name: "취소" }));
  expect(readProjects()).toHaveLength(1);
  await user.click(screen.getByRole("button", { name: "삭제" }));
  confirmation = screen.getByRole("alertdialog");
  await user.click(
    within(confirmation).getByRole("button", { name: "프로젝트 삭제" }),
  );
  expect(
    await screen.findByText("첫 프로젝트를 시작해 보세요"),
  ).toBeInTheDocument();
  expect(readProjects()).toEqual([]);
});

it("keeps the form and previous data intact when saving fails", async () => {
  const user = userEvent.setup();
  render(<ProjectWorkspace />);
  await user.click(screen.getByRole("button", { name: "새 프로젝트" }));
  fireEvent.change(screen.getByLabelText("프로젝트 이름"), {
    target: { value: "저장할 프로젝트" },
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Full", "QuotaExceededError");
  });
  await user.click(screen.getByRole("button", { name: "프로젝트 만들기" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "프로젝트를 저장하지 못했습니다",
  );
  expect(localStorage.getItem(PROJECTS_STORAGE_KEY)).toBeNull();
});

it("does not overwrite unreadable existing project data", () => {
  localStorage.setItem(PROJECTS_STORAGE_KEY, "not-json");
  render(<ProjectWorkspace />);
  expect(screen.getByRole("alert")).toHaveTextContent("기존 데이터를 보호");
  expect(screen.getByRole("button", { name: "새 프로젝트" })).toBeDisabled();
  expect(localStorage.getItem(PROJECTS_STORAGE_KEY)).toBe("not-json");
});

it("validates stored records and duplicate identifiers", () => {
  const project: Project = {
    id: "one",
    name: "프로젝트",
    description: "",
    createdAt: "2026-10-29T00:00:00.000Z",
    updatedAt: "2026-10-29T00:00:00.000Z",
  };
  for (const data of [
    [{ ...project, name: " " }],
    [{ ...project, updatedAt: "bad-date" }],
    [project, project],
    {},
  ]) {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(data));
    expect(() => readProjects()).toThrow();
  }
});

it("starts with cards and keeps search results when switching to the table", async () => {
  const user = userEvent.setup();
  localStorage.setItem(
    PROJECTS_STORAGE_KEY,
    JSON.stringify([
      {
        id: "a",
        name: "브랜드",
        description: "공식 웹사이트",
        createdAt: "2026-10-29T00:00:00.000Z",
        updatedAt: "2026-10-29T00:00:00.000Z",
      },
      {
        id: "b",
        name: "포트폴리오",
        description: "개인 작업",
        createdAt: "2026-10-29T00:00:00.000Z",
        updatedAt: "2026-10-29T00:00:00.000Z",
      },
    ]),
  );
  render(<ProjectWorkspace />);
  expect(screen.getByRole("radio", { name: "카드 보기" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole("textbox", { name: "프로젝트 검색" }), {
    target: { value: "공식" },
  });
  expect(
    screen.getByRole("button", { name: "브랜드 프로젝트 관리" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "포트폴리오 프로젝트 관리" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("radio", { name: "목록 보기" }));
  expect(screen.getByRole("table")).toBeInTheDocument();
  expect(screen.getAllByRole("row")).toHaveLength(2);
});
