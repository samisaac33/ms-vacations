import { format, startOfMonth } from "date-fns";

export function toIsoDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function buildMonthGrid(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: startPad }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), d));
  }
  return cells;
}
