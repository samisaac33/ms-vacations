import { addDays, differenceInCalendarDays, parseISO } from "date-fns";
import type { CalendarStayBar } from "@/lib/admin-calendar-query";
import { eachDayIsoInclusive } from "@/lib/dates";

export type BarSegment = {
  bar: CalendarStayBar;
  startIndex: number;
  span: number;
  clippedStart: string;
  clippedEnd: string;
};

export function dayIndexInRange(date: string, from: string, to: string): number {
  const days = eachDayIsoInclusive(from, to);
  return days.indexOf(date);
}

export function barsForDayRange(bars: CalendarStayBar[], from: string, to: string): BarSegment[] {
  const days = eachDayIsoInclusive(from, to);
  const totalDays = days.length;
  if (totalDays === 0) return [];

  const segments: BarSegment[] = [];

  for (const bar of bars) {
    if (bar.end <= from || bar.start >= to) continue;

    const visStart = bar.start < from ? from : bar.start;
    const visEndExclusive = bar.end > to ? to : bar.end;
    const lastNight = addDays(parseISO(visEndExclusive), -1);
    const visEndNight = formatIso(lastNight);

    if (visStart >= visEndExclusive) continue;

    const startIndex = dayIndexInRange(visStart, from, to);
    const endIndex = dayIndexInRange(visEndNight, from, to);
    if (startIndex < 0 || endIndex < 0) continue;

    segments.push({
      bar,
      startIndex,
      span: endIndex - startIndex + 1,
      clippedStart: visStart,
      clippedEnd: visEndExclusive,
    });
  }

  return segments;
}

export function barStyleInGrid(segment: BarSegment, totalColumns: number): { left: string; width: string } {
  const leftPct = (segment.startIndex / totalColumns) * 100;
  const widthPct = (segment.span / totalColumns) * 100;
  return { left: `${leftPct}%`, width: `${widthPct}%` };
}

export function barStyleInWeekRow(
  segment: BarSegment,
  weekDays: (string | null)[],
): { left: string; width: string } | null {
  let startCol = -1;
  let endCol = -1;

  for (let i = 0; i < weekDays.length; i++) {
    const iso = weekDays[i];
    if (!iso) continue;
    if (iso >= segment.clippedStart && iso < segment.clippedEnd) {
      if (startCol < 0) startCol = i;
      endCol = i;
    }
  }

  if (startCol < 0 || endCol < 0) return null;
  const span = endCol - startCol + 1;
  return {
    left: `${(startCol / 7) * 100}%`,
    width: `${(span / 7) * 100}%`,
  };
}

function formatIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function nightsInBar(start: string, endExclusive: string): number {
  return differenceInCalendarDays(parseISO(endExclusive), parseISO(start));
}

export function formatAdminDayHeader(iso: string): { weekday: string; day: number } {
  const d = parseISO(iso + "T12:00:00");
  const weekday = new Intl.DateTimeFormat("es-EC", { weekday: "short" }).format(d).replace(".", "");
  return { weekday, day: d.getDate() };
}

export function formatAdminMonthLabel(isoMonth: string): string {
  const d = parseISO(isoMonth + "-01T12:00:00");
  return new Intl.DateTimeFormat("es-EC", { month: "long", year: "numeric" }).format(d);
}
