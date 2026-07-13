import { parseISO } from "date-fns";

export function formatBookingDateRange(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return "—";
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()} – ${end.getDate()} de ${start.toLocaleDateString("es-EC", { month: "short", year: "numeric" })}`;
  }
  const startStr = start.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
  const endStr = end.toLocaleDateString("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}
