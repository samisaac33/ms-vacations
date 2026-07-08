import type { PaymentMethod } from "@/lib/payments/types";

/** Descuento adicional por pagar con transferencia bancaria (sobre el total). */
export const BANK_TRANSFER_DISCOUNT_RATE = 0.93;

export const BANK_TRANSFER_DISCOUNT_PERCENT = 7;

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

export function totalCentsForPaymentMethod(
  baseDirectTotalCents: number,
  method: PaymentMethod,
): number {
  if (method === "bank_transfer") {
    return Math.round(baseDirectTotalCents * BANK_TRANSFER_DISCOUNT_RATE);
  }
  return baseDirectTotalCents;
}

export function totalUsdForPaymentMethod(baseDirectTotalCents: number, method: PaymentMethod): number {
  return totalCentsForPaymentMethod(baseDirectTotalCents, method) / 100;
}
