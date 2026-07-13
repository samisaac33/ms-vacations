"use client";

import { format, startOfMonth } from "date-fns";

export const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"] as const;

export function toIsoDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function buildMonthGridMondayFirst(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: startPad }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), d));
  }
  return cells;
}

export function MonthSkeleton({ className = "mb-8" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-sand-dark/70" />
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: 35 }, (_, i) => (
          <div key={i} className="mx-auto h-10 w-10 animate-pulse rounded-full bg-sand-dark/50" />
        ))}
      </div>
    </div>
  );
}

type DayCellProps = {
  iso: string;
  dayNum: number;
  checkIn: string;
  checkOut: string;
  today: string;
  blocked: boolean;
  onSelect: (iso: string) => void;
};

export function DayCell({ iso, dayNum, checkIn, checkOut, today, blocked, onSelect }: DayCellProps) {
  const past = iso < today;
  const isStart = checkIn === iso;
  const isEnd = checkOut === iso;
  const hasRange = Boolean(checkIn && checkOut);
  const inRange = hasRange && iso > checkIn && iso < checkOut && !blocked;
  const isEndpoint = isStart || isEnd;
  const disabled = past || blocked;

  let rangeBg = "";
  if (hasRange && (isStart || isEnd || inRange)) {
    if (isStart && isEnd) {
      rangeBg = "";
    } else if (isStart) {
      rangeBg = "absolute inset-y-0 left-1/2 right-0 bg-sand-dark";
    } else if (isEnd) {
      rangeBg = "absolute inset-y-0 left-0 right-1/2 bg-sand-dark";
    } else if (inRange) {
      rangeBg = "absolute inset-y-0 inset-x-0 bg-sand-dark";
    }
  }

  return (
    <div className="relative flex h-11 items-center justify-center">
      {rangeBg ? <span className={rangeBg} aria-hidden /> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(iso)}
        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
          past
            ? "cursor-not-allowed text-muted/40"
            : blocked
              ? "cursor-not-allowed text-muted/50 line-through"
              : "cursor-pointer text-ink"
        } ${isEndpoint ? "bg-ink text-white" : ""}`}
        aria-label={
          blocked
            ? `${iso}, no disponible`
            : `${iso}${isStart ? ", check-in" : ""}${isEnd ? ", check-out" : ""}`
        }
      >
        {dayNum}
      </button>
    </div>
  );
}

export function WeekdayHeader({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-7 text-center text-xs font-medium text-muted ${className}`}>
      {WEEKDAY_LABELS.map((label, i) => (
        <span key={`${label}-${i}`} className="py-1">
          {label}
        </span>
      ))}
    </div>
  );
}
