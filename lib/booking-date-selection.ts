import { differenceInCalendarDays, parseISO } from "date-fns";
import { isNightBlocked, rangeOverlapsAny, type DateRange } from "@/lib/availability-utils";
import { validateStayLength } from "@/lib/stay-rules";

export type DateRangeSelection = {
  checkIn: string;
  checkOut: string;
};

export type DateSelectionResult =
  | { ok: true; range: DateRangeSelection }
  | { ok: false; error: string };

export function selectBookingDateRange(
  iso: string,
  current: DateRangeSelection,
  blocks: DateRange[],
  today: string,
): DateSelectionResult | { ok: true; range: DateRangeSelection; error?: undefined } {
  const { checkIn, checkOut } = current;

  if (iso < today) {
    return { ok: false, error: "No puedes seleccionar fechas pasadas." };
  }

  if (checkIn && checkOut) {
    if (isNightBlocked(iso, blocks)) {
      return { ok: false, error: "Esa fecha no está disponible." };
    }
    return { ok: true, range: { checkIn: iso, checkOut: "" } };
  }

  if (!checkIn) {
    if (isNightBlocked(iso, blocks)) {
      return { ok: false, error: "Esa fecha no está disponible." };
    }
    return { ok: true, range: { checkIn: iso, checkOut: "" } };
  }

  if (iso === checkIn) {
    return { ok: true, range: { checkIn: "", checkOut: "" } };
  }

  const start = iso < checkIn ? iso : checkIn;
  const end = iso < checkIn ? checkIn : iso;

  if (differenceInCalendarDays(parseISO(end), parseISO(start)) < 1) {
    if (isNightBlocked(iso, blocks)) {
      return { ok: false, error: "Esa fecha no está disponible." };
    }
    return { ok: true, range: { checkIn: iso, checkOut: "" } };
  }

  if (rangeOverlapsAny(start, end, blocks)) {
    return {
      ok: false,
      error: "Ese rango incluye noches ocupadas. Prueba con menos días o otras fechas.",
    };
  }

  const stayLengthError = validateStayLength(start, end);
  if (stayLengthError) {
    return { ok: false, error: stayLengthError };
  }

  return { ok: true, range: { checkIn: start, checkOut: end } };
}

export function isValidBookingRange(checkIn: string, checkOut: string): boolean {
  return Boolean(checkIn && checkOut && checkOut > checkIn);
}
