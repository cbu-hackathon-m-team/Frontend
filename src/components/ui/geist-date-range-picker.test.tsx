import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GeistDateRangePicker } from "./geist-date-range-picker";

it("선택한 종료 시각 00:00을 23:59로 바꾸지 않는다", () => {
  const setDateRange = vi.fn();
  render(<GeistDateRangePicker dateRange={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 2, 12, 45) }} setDateRange={setDateRange} />);
  fireEvent.click(screen.getByRole("button", { name: "Date range" }));
  fireEvent.change(screen.getByLabelText("End time"), { target: { value: "00:00" } });
  fireEvent.click(screen.getByRole("button", { name: /Apply/ }));
  const { from, to } = setDateRange.mock.calls[0][0];
  expect([from.getHours(), from.getMinutes(), from.getMilliseconds()]).toEqual([0, 0, 0]);
  expect([to.getHours(), to.getMinutes(), to.getSeconds(), to.getMilliseconds()]).toEqual([0, 0, 59, 999]);
});
