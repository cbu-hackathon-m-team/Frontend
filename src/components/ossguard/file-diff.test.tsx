import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileDiff } from "./file-diff";

afterEach(cleanup);
it("shows exact change counts and line numbers and lets the file be collapsed", async () => {
  const user = userEvent.setup();
  render(<FileDiff path="src/app.py" diff={"@@ -8 +8 @@\n-old()\n+new()\n"} defaultOpen />);
  expect(screen.getByLabelText("1줄 추가, 1줄 삭제")).toBeInTheDocument();
  const table = screen.getByRole("table", { name: "src/app.py 변경 내용" });
  const rows = within(table).getAllByRole("row");
  expect(rows[2]).toHaveTextContent("8−old()");
  expect(rows[3]).toHaveTextContent("8+new()");
  const path = screen.getByText("src/app.py");
  expect(path.closest("details")).toHaveAttribute("open");
  await user.click(path);
  await waitFor(() => expect(path.closest("details")).not.toHaveAttribute("open"));
});
