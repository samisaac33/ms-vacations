import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";

/**
 * IVA sobre servicios de alojamiento turístico en Ecuador.
 *
 * Tarifa general: 15 %. Durante feriados decretados por el Ejecutivo puede reducirse al 8 %
 * para actividades turísticas registradas (Ley de Turismo, reformas 2025+).
 *
 * Actualizar `PROMOTIONAL_VAT_PERIODS` cuando se publiquen nuevos decretos en el Registro Oficial.
 */

export const HOSPITALITY_VAT_STANDARD_RATE = 0.15;
export const HOSPITALITY_VAT_PROMOTIONAL_RATE = 0.08;

export type VatPeriod = {
  /** ISO date inclusive (America/Guayaquil) */
  start: string;
  end: string;
  label: string;
  decree?: string;
};

/** Períodos con tarifa reducida decretados (actualizar según normativa vigente). */
export const PROMOTIONAL_VAT_PERIODS: VatPeriod[] = [
  { start: "2026-01-01", end: "2026-01-04", label: "Año Nuevo 2026", decree: "Decreto Ejecutivo 271" },
  { start: "2026-02-14", end: "2026-02-17", label: "Carnaval 2026", decree: "Decreto Ejecutivo 304" },
  { start: "2026-04-03", end: "2026-04-05", label: "Semana Santa 2026" },
  { start: "2026-04-30", end: "2026-05-03", label: "Día del Trabajo 2026", decree: "Decreto Ejecutivo 368" },
];

function parseIsoDate(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
}

/** True si la fecha civil (YYYY-MM-DD) cae en un período con IVA al 8 % decretado. */
export function isPromotionalVatDate(isoDate: string): boolean {
  const t = parseIsoDate(isoDate);
  return PROMOTIONAL_VAT_PERIODS.some((p) => {
    const start = parseIsoDate(p.start);
    const end = parseIsoDate(p.end);
    return t >= start && t <= end;
  });
}

/** True si alguna noche de la estancia [checkIn, checkOut) está en período promocional. */
export function stayTouchesPromotionalVat(checkIn: string, checkOut: string): boolean {
  const checkInDate = parseISO(checkIn);
  const lastNight = subDays(parseISO(checkOut), 1);
  if (lastNight < checkInDate) {
    return isPromotionalVatDate(checkIn);
  }
  return eachDayOfInterval({ start: checkInDate, end: lastNight }).some((day) =>
    isPromotionalVatDate(format(day, "yyyy-MM-dd")),
  );
}

export function hospitalityVatRatePercentForDate(isoDate: string): number {
  return isPromotionalVatDate(isoDate)
    ? HOSPITALITY_VAT_PROMOTIONAL_RATE * 100
    : HOSPITALITY_VAT_STANDARD_RATE * 100;
}

export function formatVatRatePercent(rate: number): string {
  return rate % 1 === 0 ? String(rate) : rate.toFixed(1);
}

export function getPromotionalVatPeriodsSummary(): string {
  return PROMOTIONAL_VAT_PERIODS.map((p) => {
    const decree = p.decree ? ` (${p.decree})` : "";
    return `${p.label}: ${p.start} a ${p.end}${decree}`;
  }).join("; ");
}
