import type { VacationStatus } from "@/lib/mock-data";
import { statusLabels } from "@/lib/mock-data";

const statusStyles: Record<VacationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  DRAFT: "bg-surface text-muted ring-border",
};

interface BadgeProps {
  status: VacationStatus;
}

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
