import { addDays, format, getDay, parseISO } from "date-fns";
import { nightsBetween } from "@/lib/dates";

const MIN_TWO_NIGHT_CHECK_IN_DAYS = new Set([5, 6]);

export type HighSeasonPeriod = {
  startDate: string;
  endDate: string;
  minNights: number;
  label?: string | null;
};

function checkInWeekday(checkIn: string): number {
  return getDay(parseISO(`${checkIn}T12:00:00`));
}

export function requiresMinTwoNights(checkIn: string): boolean {
  return MIN_TWO_NIGHT_CHECK_IN_DAYS.has(checkInWeekday(checkIn));
}

function baseMinimumNightsForCheckIn(checkIn: string): number {
  return requiresMinTwoNights(checkIn) ? 2 : 1;
}

function lastNightOfStay(checkIn: string, checkOut: string): string {
  return format(addDays(parseISO(`${checkOut}T12:00:00`), -1), "yyyy-MM-dd");
}

export function stayOverlapsHighSeasonPeriod(
  checkIn: string,
  checkOut: string,
  period: HighSeasonPeriod,
): boolean {
  const lastNight = lastNightOfStay(checkIn, checkOut);
  return checkIn <= period.endDate && lastNight >= period.startDate;
}

function highSeasonMinimumForStay(
  checkIn: string,
  checkOut: string,
  highSeasonPeriods: HighSeasonPeriod[] = [],
): { minNights: number; label: string | null } | null {
  const matching = highSeasonPeriods.filter((p) =>
    stayOverlapsHighSeasonPeriod(checkIn, checkOut, p),
  );
  if (matching.length === 0) return null;

  const maxPeriod = matching.reduce((best, current) =>
    current.minNights > best.minNights ? current : best,
  );
  return { minNights: maxPeriod.minNights, label: maxPeriod.label ?? null };
}

export function minimumNightsForStay(
  checkIn: string,
  checkOut: string,
  highSeasonPeriods: HighSeasonPeriod[] = [],
): number {
  const base = baseMinimumNightsForCheckIn(checkIn);
  const season = highSeasonMinimumForStay(checkIn, checkOut, highSeasonPeriods);
  if (!season) return base;
  return Math.max(base, season.minNights);
}

/** Mínimo cuando aún no hay salida; solo aplica regla base (vie/sáb). */
export function minimumNightsForCheckIn(checkIn: string): number {
  return baseMinimumNightsForCheckIn(checkIn);
}

export function validateStayLength(
  checkIn: string,
  checkOut: string,
  highSeasonPeriods: HighSeasonPeriod[] = [],
): string | null {
  const nights = nightsBetween(checkIn, checkOut);
  const minNights = minimumNightsForStay(checkIn, checkOut, highSeasonPeriods);
  const season = highSeasonMinimumForStay(checkIn, checkOut, highSeasonPeriods);

  if (nights < minNights) {
    if (season) {
      const labelPart = season.label ? ` (${season.label})` : "";
      return `La estancia incluye temporada alta${labelPart} y el mínimo es de ${minNights} ${minNights === 1 ? "noche" : "noches"}.`;
    }
    if (minNights === 2) {
      return "Con entrada viernes o sábado la estancia mínima es de 2 noches.";
    }
    return "La salida debe ser después de la entrada.";
  }

  return null;
}
