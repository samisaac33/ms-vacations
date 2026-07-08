export type DateRange = { start: string; end: string };

/** Rango [checkIn, checkOut) vs bloque [start, end) — fin exclusivo en ambos. */
export function rangesOverlap(checkIn: string, checkOut: string, block: DateRange): boolean {
  return block.start < checkOut && block.end > checkIn;
}

export function rangeOverlapsAny(
  checkIn: string,
  checkOut: string,
  blocks: DateRange[],
): boolean {
  return blocks.some((b) => rangesOverlap(checkIn, checkOut, b));
}

/** Noche ocupada: la fecha civil de la noche cae en [start, end). */
export function isNightBlocked(night: string, blocks: DateRange[]): boolean {
  return blocks.some((b) => b.start <= night && b.end > night);
}

export function todayInGuayaquil(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Guayaquil" });
}
