import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

/** Ecuador continental: America/Guayaquil, sin horario de verano */
export const ECUADOR_TZ = "America/Guayaquil";

export function parseLocalDate(yyyyMmDd: string): Date {
  return parseISO(yyyyMmDd);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.max(
    0,
    differenceInCalendarDays(parseLocalDate(checkOut), parseLocalDate(checkIn)),
  );
}

export function isValidDateOrder(checkIn: string, checkOut: string): boolean {
  return nightsBetween(checkIn, checkOut) >= 1;
}

/** Noches de estancia [checkIn, checkOut) en ISO YYYY-MM-DD. */
export function eachNightIso(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  let d = parseLocalDate(checkIn);
  const end = parseLocalDate(checkOut);
  while (d < end) {
    nights.push(format(d, "yyyy-MM-dd"));
    d = addDays(d, 1);
  }
  return nights;
}

/** Rango inclusivo para edición admin (día inicio … día fin). */
export function eachDayIsoInclusive(start: string, end: string): string[] {
  const [a, b] = start <= end ? [start, end] : [end, start];
  const days: string[] = [];
  let d = parseLocalDate(a);
  const last = parseLocalDate(b);
  while (d <= last) {
    days.push(format(d, "yyyy-MM-dd"));
    d = addDays(d, 1);
  }
  return days;
}
