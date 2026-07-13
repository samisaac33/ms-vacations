import { getDay, parseISO } from "date-fns";
import { nightsBetween } from "@/lib/dates";

const MIN_TWO_NIGHT_CHECK_IN_DAYS = new Set([5, 6]);

function checkInWeekday(checkIn: string): number {
  return getDay(parseISO(`${checkIn}T12:00:00`));
}

export function requiresMinTwoNights(checkIn: string): boolean {
  return MIN_TWO_NIGHT_CHECK_IN_DAYS.has(checkInWeekday(checkIn));
}

export function minimumNightsForCheckIn(checkIn: string): number {
  return requiresMinTwoNights(checkIn) ? 2 : 1;
}

export function validateStayLength(checkIn: string, checkOut: string): string | null {
  const nights = nightsBetween(checkIn, checkOut);
  const minNights = minimumNightsForCheckIn(checkIn);

  if (nights < minNights) {
    if (minNights === 2) {
      return "Con entrada viernes o sábado la estancia mínima es de 2 noches.";
    }
    return "La salida debe ser después de la entrada.";
  }

  return null;
}
