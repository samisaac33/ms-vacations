import type { CalendarStayBar } from "@/lib/admin-calendar-query";

type Props = {
  bar: CalendarStayBar;
  style: { left: string; width: string };
  compact?: boolean;
};

export function CalendarStayBar({ bar, style, compact }: Props) {
  const priceHint =
    bar.totalCents !== undefined ? ` · $${(bar.totalCents / 100).toFixed(0)}` : "";

  return (
    <div
      className={`admin-stay-bar ${bar.source === "booking" ? "admin-stay-bar--booking" : "admin-stay-bar--external"}`}
      style={style}
      title={bar.label + priceHint}
    >
      <span className="truncate">{compact ? bar.label.split(" · ")[0] : bar.label}</span>
      {!compact && bar.totalCents !== undefined && (
        <span className="ml-1 shrink-0 opacity-90">${(bar.totalCents / 100).toFixed(0)}</span>
      )}
    </div>
  );
}
