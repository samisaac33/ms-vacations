import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";

/**
 * IVA sobre servicios de alojamiento turístico en Ecuador.
 *
 * Tarifa general: 15 %. Durante feriados decretados puede reducirse al 8 %
 * (precio final más bajo para el huésped en noches dentro del período).
 * Los períodos se configuran en /admin (tabla promotional_vat_periods).
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

const EMPTY_VAT_PERIODS: VatPeriod[] = [];

function parseIsoDate(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
}

export function isPromotionalVatDate(isoDate: string, periods: VatPeriod[] = EMPTY_VAT_PERIODS): boolean {
  const t = parseIsoDate(isoDate);
  return periods.some((p) => {
    const start = parseIsoDate(p.start);
    const end = parseIsoDate(p.end);
    return t >= start && t <= end;
  });
}

export function vatPeriodOverlaps(a: VatPeriod, b: VatPeriod): boolean {
  return a.start <= b.end && b.start <= a.end;
}

/** Precio directo por noche: descuento real si la fecha está en período 8 %. */
export function directCentsForNight(
  referenceCents: number,
  date: string,
  periods: VatPeriod[] = EMPTY_VAT_PERIODS,
): number {
  if (!isPromotionalVatDate(date, periods)) return referenceCents;
  const baseCents = Math.round(referenceCents / (1 + HOSPITALITY_VAT_STANDARD_RATE));
  return Math.round(baseCents * (1 + HOSPITALITY_VAT_PROMOTIONAL_RATE));
}

export function stayTouchesPromotionalVat(
  checkIn: string,
  checkOut: string,
  periods: VatPeriod[] = EMPTY_VAT_PERIODS,
): boolean {
  const checkInDate = parseISO(checkIn);
  const lastNight = subDays(parseISO(checkOut), 1);
  if (lastNight < checkInDate) {
    return isPromotionalVatDate(checkIn, periods);
  }
  return eachDayOfInterval({ start: checkInDate, end: lastNight }).some((day) =>
    isPromotionalVatDate(format(day, "yyyy-MM-dd"), periods),
  );
}

export function quoteHasPromotionalVatNights(
  nightly: {
    isPromotionalVat?: boolean;
    guestDirectCents?: number;
    directCents: number;
  }[],
): boolean {
  return nightly.some(
    (n) =>
      n.isPromotionalVat ??
      (n.guestDirectCents !== undefined && n.directCents < n.guestDirectCents),
  );
}

export function hospitalityVatRatePercentForNight(night: {
  isPromotionalVat?: boolean;
  guestDirectCents?: number;
  directCents: number;
}): number {
  const isPromotional =
    night.isPromotionalVat ??
    (night.guestDirectCents !== undefined && night.directCents < night.guestDirectCents);
  if (isPromotional) {
    return HOSPITALITY_VAT_PROMOTIONAL_RATE * 100;
  }
  return HOSPITALITY_VAT_STANDARD_RATE * 100;
}

/** @deprecated Preferir hospitalityVatRatePercentForNight con quote nightly */
export function hospitalityVatRatePercentForDate(
  isoDate: string,
  periods: VatPeriod[] = EMPTY_VAT_PERIODS,
): number {
  return isPromotionalVatDate(isoDate, periods)
    ? HOSPITALITY_VAT_PROMOTIONAL_RATE * 100
    : HOSPITALITY_VAT_STANDARD_RATE * 100;
}

export function formatVatRatePercent(rate: number): string {
  return rate % 1 === 0 ? String(rate) : rate.toFixed(1);
}

export function getPromotionalVatPeriodsSummary(periods: VatPeriod[] = EMPTY_VAT_PERIODS): string {
  if (periods.length === 0) return "ninguno configurado";
  return periods
    .map((p) => {
      const decree = p.decree ? ` (${p.decree})` : "";
      return `${p.label}: ${p.start} a ${p.end}${decree}`;
    })
    .join("; ");
}
