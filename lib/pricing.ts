import type { PaymentMethod } from "@/lib/payments/types";
import {
  catalogReferencePriceUsd,
  guestDirectPriceUsd,
  SLUGS_WITHOUT_REFUNDABLE_GUARANTEE,
} from "@/lib/property-pricing";

/** Garantía reembolsable (USD 300); fija, sin recargo tarjeta ni IVA de hospedaje. */
export const REFUNDABLE_GUARANTEE_CENTS = 30_000;

export function refundableGuaranteeCents(slug: string): number {
  return SLUGS_WITHOUT_REFUNDABLE_GUARANTEE.has(slug) ? 0 : REFUNDABLE_GUARANTEE_CENTS;
}

export function appliesRefundableGuarantee(slug: string): boolean {
  return refundableGuaranteeCents(slug) > 0;
}

/** Recargo PayPal/PayPhone/tarjeta sobre total transferencia (noches + limpieza). */
export const CARD_PAYMENT_MARKUP_RATE = 1.0575;

export const CARD_PAYMENT_MARKUP_PERCENT = 5.75;

/** @deprecated Usar CARD_PAYMENT_MARKUP_RATE. Conservado para migración playa legacy (+7 %). */
export const LEGACY_BEACH_MARKUP_RATE = 1.07;

/** @deprecated Usar CARD_PAYMENT_MARKUP_PERCENT. */
export const BANK_TRANSFER_DISCOUNT_PERCENT = CARD_PAYMENT_MARKUP_PERCENT;

/** @deprecated Usar CARD_PAYMENT_MARKUP_RATE. */
export const BANK_TRANSFER_MARKUP_RATE = CARD_PAYMENT_MARKUP_RATE;

/** @deprecated Usar CARD_PAYMENT_MARKUP_RATE; conservado por compatibilidad en tests legacy. */
export const BANK_TRANSFER_DISCOUNT_RATE = 1 / LEGACY_BEACH_MARKUP_RATE;

/** Precio huésped por noche en centavos. */
export function directPricePerNightCents(slug: string): number {
  return Math.round(guestDirectPriceUsd(slug) * 100);
}

/** Precio huésped por noche en USD (transferencia). */
export function directPricePerNightUsd(slug: string): number {
  return guestDirectPriceUsd(slug);
}

export function directStayTotalCents(priceCentsPerNight: number, nights: number): number {
  return priceCentsPerNight * nights;
}

export function formatUsd(amount: number): string {
  return amount % 1 === 0 ? String(amount) : amount.toFixed(2);
}

/**
 * @deprecated Usar catalogReferencePriceUsd(slug). Conservado para scripts legacy.
 * Antes: precio directo × 1,07. Ya no define la referencia de catálogo.
 */
export function basePriceFromPriorDirectUsd(priorDirectUsd: number): number {
  return Math.round(priorDirectUsd * LEGACY_BEACH_MARKUP_RATE);
}

/** Convierte tarifa tarjeta legacy a precio huésped (÷ 1,07). Solo scripts antiguos. */
export function bankTransferTotalCents(cardPriceCents: number): number {
  return Math.round(cardPriceCents / LEGACY_BEACH_MARKUP_RATE);
}

/** Recargo tarjeta/PayPal/PayPhone (+5,75 % sobre total transferencia, redondeo a USD entero). */
export function cardPaymentTotalCents(transferTotalCents: number): number {
  const transferUsd = transferTotalCents / 100;
  return Math.round(transferUsd * CARD_PAYMENT_MARKUP_RATE) * 100;
}

/** Total a cobrar según método; el input es precio huésped (transferencia). */
export function totalCentsForPaymentMethod(
  guestTotalCents: number,
  method: PaymentMethod,
): number {
  if (method === "bank_transfer") {
    return guestTotalCents;
  }
  return cardPaymentTotalCents(guestTotalCents);
}

export function totalUsdForPaymentMethod(guestTotalCents: number, method: PaymentMethod): number {
  return totalCentsForPaymentMethod(guestTotalCents, method) / 100;
}

/** Total estancia: transferencia = noches + limpieza; tarjeta/PayPal = +5,75 % sobre ese subtotal. */
export function stayTotalCentsForPaymentMethod(
  nightlyDirectCents: number,
  cleaningFeeCents: number,
  method: PaymentMethod,
): number {
  const transferTotalCents = nightlyDirectCents + cleaningFeeCents;
  return totalCentsForPaymentMethod(transferTotalCents, method);
}

export function stayTotalUsdForPaymentMethod(
  nightlyDirectCents: number,
  cleaningFeeCents: number,
  method: PaymentMethod,
): number {
  return stayTotalCentsForPaymentMethod(nightlyDirectCents, cleaningFeeCents, method) / 100;
}

/** Total reserva online: estancia (+ recargo tarjeta si aplica) + garantía reembolsable. */
export function bookingTotalCentsForPaymentMethod(
  nightlyDirectCents: number,
  cleaningFeeCents: number,
  method: PaymentMethod,
  slug: string,
): number {
  return (
    stayTotalCentsForPaymentMethod(nightlyDirectCents, cleaningFeeCents, method) +
    refundableGuaranteeCents(slug)
  );
}

export function bookingTotalUsdForPaymentMethod(
  nightlyDirectCents: number,
  cleaningFeeCents: number,
  method: PaymentMethod,
  slug: string,
): number {
  return bookingTotalCentsForPaymentMethod(nightlyDirectCents, cleaningFeeCents, method, slug) / 100;
}

/** Precio de referencia sin descuento (tipo Airbnb). */
export function catalogAirbnbReferenceUsd(slug: string): number {
  return catalogReferencePriceUsd(slug);
}

/** Precio huésped por noche (transferencia). */
export function catalogDirectPriceUsd(slug: string): number {
  return guestDirectPriceUsd(slug);
}

/** Porcentaje de ahorro vs precio referencia; mínimo 1 % si hay ahorro. */
export function catalogSavingsPercentVsAirbnb(slug: string): number {
  const reference = catalogReferencePriceUsd(slug);
  const direct = guestDirectPriceUsd(slug);
  if (direct >= reference) return 0;
  const pct = Math.round((1 - direct / reference) * 100);
  return Math.max(1, pct);
}

/** Ahorro total comunicado en fichas (redondeado a 14 %). */
export const CATALOG_CARD_SAVINGS_PERCENT = 14;

/** Precio por noche en ficha: transferencia redondeada a USD entero. */
export function catalogDisplayPriceUsd(slug: string): number {
  return Math.round(guestDirectPriceUsd(slug));
}

/** Referencia sin descuento en ficha (para tachado). */
export function catalogDisplayReferenceUsd(slug: string): number {
  return Math.round(catalogReferencePriceUsd(slug));
}
