import { todayInGuayaquil } from "@/lib/availability-utils";
import { isValidDateOrder } from "@/lib/dates";
import { validateStayLength, type HighSeasonPeriod } from "@/lib/stay-rules";

export type StayDestination = "beach" | "city";

export type StaySearch = {
  destino: StayDestination;
  checkIn: string;
  checkOut: string;
  huespedes: number;
};

export function defaultCheckIn(): string {
  const today = todayInGuayaquil();
  const d = new Date(`${today}T12:00:00`);
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function defaultCheckOut(checkIn: string): string {
  const d = new Date(`${checkIn}T12:00:00`);
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

export function minCheckOutDate(checkIn: string, minCheckIn: string): string {
  return checkIn && checkIn > minCheckIn ? checkIn : minCheckIn;
}

export function clampCheckIn(value: string, minCheckIn: string): string {
  if (!value || value < minCheckIn) return minCheckIn;
  return value;
}

export function clampCheckOut(
  value: string,
  checkIn: string,
  minCheckIn: string,
): string {
  const anchor = checkIn || minCheckIn;
  const minOut = minCheckOutDate(anchor, minCheckIn);
  if (!value || value <= minOut) return defaultCheckOut(anchor);
  return value;
}

export function normalizeStayDates(
  checkIn: string,
  checkOut: string,
  minCheckIn: string,
): { checkIn: string; checkOut: string } {
  const nextCheckIn = clampCheckIn(checkIn, minCheckIn);
  const nextCheckOut = clampCheckOut(checkOut, nextCheckIn, minCheckIn);
  return { checkIn: nextCheckIn, checkOut: nextCheckOut };
}

export function validateStaySearch(
  checkIn: string,
  checkOut: string,
  minCheckIn = todayInGuayaquil(),
  highSeasonPeriods: HighSeasonPeriod[] = [],
): string | null {
  if (!checkIn || !checkOut) return "Selecciona entrada y salida.";
  if (checkIn < minCheckIn) return "La entrada no puede ser en el pasado.";
  if (!isValidDateOrder(checkIn, checkOut)) return "La salida debe ser después de la entrada.";
  return validateStayLength(checkIn, checkOut, highSeasonPeriods);
}

export function buildStaySearchQuery(search: Partial<StaySearch>): string {
  const params = new URLSearchParams();
  if (search.destino) params.set("destino", search.destino);
  if (search.checkIn) params.set("checkIn", search.checkIn);
  if (search.checkOut) params.set("checkOut", search.checkOut);
  if (search.huespedes && search.huespedes > 0) {
    params.set("huespedes", String(search.huespedes));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function parseStaySearchFromParams(
  params: Record<string, string | string[] | undefined>,
): Partial<StaySearch> | null {
  const destino = params.destino;
  const checkIn = params.checkIn;
  const checkOut = params.checkOut;
  const huespedes = params.huespedes;

  if (typeof destino !== "string" && typeof checkIn !== "string") return null;

  const parsed: Partial<StaySearch> = {};
  if (destino === "beach" || destino === "city") parsed.destino = destino;
  if (typeof checkIn === "string") parsed.checkIn = checkIn;
  if (typeof checkOut === "string") parsed.checkOut = checkOut;
  if (typeof huespedes === "string") {
    const n = Number(huespedes);
    if (Number.isFinite(n) && n > 0) parsed.huespedes = n;
  }

  return Object.keys(parsed).length > 0 ? parsed : null;
}

export function destinationHash(destino: StayDestination): string {
  return destino === "beach" ? "#playa" : "#ciudad";
}

export function buildCatalogHref(
  parsed: Partial<StaySearch>,
  catalogPath = "/propiedades",
): string {
  if (!parsed.checkIn || !parsed.checkOut) return catalogPath;
  const query = buildStaySearchQuery(parsed);
  const hash = parsed.destino ? destinationHash(parsed.destino) : "";
  return `${catalogPath}${query}${hash}`;
}
