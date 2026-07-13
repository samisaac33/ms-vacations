import { parseISO } from "date-fns";

export function formatDateRange(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return "Selecciona fechas";
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()} – ${end.getDate()} de ${start.toLocaleDateString("es-EC", { month: "short", year: "numeric" })}`;
  }
  const startStr = start.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
  const endStr = end.toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" });
  return `${startStr} – ${endStr}`;
}

export function guestsLabel(count: number): string {
  return `${count} ${count === 1 ? "huésped" : "huéspedes"}`;
}

export function SummaryRow({
  label,
  value,
  actionLabel,
  onAction,
  actionDisabled,
}: {
  label: string;
  value: string;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-sand-dark py-4 first:border-t-0">
      <div className="min-w-0">
        <p className="font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-sm text-muted">{value}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={actionDisabled}
        className="shrink-0 rounded-lg border border-sand-dark bg-sand/80 px-3 py-1.5 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {actionLabel}
      </button>
    </div>
  );
}
