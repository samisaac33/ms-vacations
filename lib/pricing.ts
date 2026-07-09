import type { PaymentMethod } from "@/lib/payments/types";

/** Recargo del 7 % sobre la tarifa directa anterior para obtener la nueva base. */
export const BANK_TRANSFER_MARKUP_RATE = 1.07;

export const BANK_TRANSFER_DISCOUNT_PERCENT = 7;

/** @deprecated Usar bankTransferTotalCents; conservado por compatibilidad en tests legacy. */
export const BANK_TRANSFER_DISCOUNT_RATE = 1 / BANK_TRANSFER_MARKUP_RATE;

/** Precio por noche en centavos USD (valor definido en admin). */
export function directPricePerNightCents(priceCents: number): number {
  return priceCents;
}

/** Precio por noche en USD (valor definido en admin). */
export function directPricePerNightUsd(priceUsd: number): number {
  return priceUsd;
}

export function directStayTotalCents(priceCentsPerNight: number, nights: number): number {
  return priceCentsPerNight * nights;
}

export function formatUsd(amount: number): string {
  return amount % 1 === 0 ? String(amount) : amount.toFixed(2);
}

/**
 * Nueva tarifa base: precio directo anterior + 7 %.
 * Ej.: $500 → $535 (PayPal/PayPhone); transferencia revierte a $500 vía / 1.07.
 */
export function basePriceFromPriorDirectUsd(priorDirectUsd: number): number {
  return Math.round(priorDirectUsd * BANK_TRANSFER_MARKUP_RATE);
}

/** Total con transferencia: revierte el +7 % de la base (no × 0.93). */
export function bankTransferTotalCents(baseDirectTotalCents: number): number {
  return Math.round(baseDirectTotalCents / BANK_TRANSFER_MARKUP_RATE);
}

export function totalCentsForPaymentMethod(
  baseDirectTotalCents: number,
  method: PaymentMethod,
): number {
  if (method === "bank_transfer") {
    return bankTransferTotalCents(baseDirectTotalCents);
  }
  return baseDirectTotalCents;
}

export function totalUsdForPaymentMethod(baseDirectTotalCents: number, method: PaymentMethod): number {
  return totalCentsForPaymentMethod(baseDirectTotalCents, method) / 100;
}
