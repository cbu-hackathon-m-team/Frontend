import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GuardApi } from "./api";
import { ServerSetup } from "./server-setup";
import { ServerTests } from "./server-tests";
import { apiProject, apiSuite } from "./api-fixture.test-support";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it.each([false, true])("saves execution settings before continuing and stays on errors: %s", async (fail) => {
  const api = new GuardApi("test");
  const request = vi.spyOn(api, "request").mockImplementation(async (path, method) => {
    if (method === "GET") return { versions: [] } as never;
    if (fail && path.endsWith("/environment-profile")) throw new Error("저장 실패");
    return {} as never;
  });
  const reload = vi.fn(async () => {}), next = vi.fn();
  render(<ServerSetup api={api} project={apiProject} packageName="pydantic" target="2.12.5"
    onPackage={() => {}} onTarget={() => {}} onReload={reload} onNext={next} />);
  fireEvent.change(screen.getByLabelText("앱 포트"), { target: { value: "9000" } });
  fireEvent.click(screen.getByRole("button", { name: "업무 테스트 검토" }));
  await waitFor(() => expect(request).toHaveBeenCalledWith(
    `/api/projects/${apiProject.id}/execution-profile`, "PUT",
    expect.objectContaining({ app_port: 9000 }),
  ));
  if (fail) {
    expect(await screen.findByText("저장 실패")).toBeInTheDocument();
    expect(next).not.toHaveBeenCalled();
  } else {
    await waitFor(() => expect(next).toHaveBeenCalledOnce());
    expect(reload).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledWith(`/api/projects/${apiProject.id}/notification-settings`, "PUT", { enabled: false, email: "" });
  }
});

it("preserves the input schema while saving business rules and approving tests", async () => {
  const api = new GuardApi("test");
  const inputSchema = { type: "object", required: ["quantity"] };
  const request = vi.spyOn(api, "request").mockResolvedValue(apiSuite);
  const saved = vi.fn();
  render(<ServerTests api={api} projectId={apiProject.id} suite={apiSuite} rule="주문 확인"
    inputSchema={inputSchema} dirty onChange={() => {}} onRule={() => {}} onSaved={saved} />);
  fireEvent.click(screen.getByRole("button", { name: "테스트 저장·승인" }));
  await waitFor(() => expect(saved).toHaveBeenCalledWith(apiSuite));
  expect(request).toHaveBeenCalledWith(`/api/projects/${apiProject.id}/rules`, "PUT", {
    description: "주문 확인", input_schema: inputSchema,
  });
});
