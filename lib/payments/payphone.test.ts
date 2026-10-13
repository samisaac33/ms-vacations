import { describe, expect, it } from "vitest";
import { buildStayPriceBreakdown } from "@/lib/pricing-breakdown";
import { refundableGuaranteeCents } from "@/lib/pricing";
import type { StayQuote } from "@/lib/pricing-query";
import { buildPayPhoneBoxAmountsForCharge } from "@/lib/payments/payphone";

const LA_PUNTA_QUOTE: StayQuote = {
  slug: "la-punta-1-san-clemente",
  nights: 1,
  nightly: [
    {
      date: "2026-08-01",
      referenceCents: 85_000,
      guestDirectCents: 50_000,
      directCents: 50_000,
      isPromotionalVat: false,
      isOverride: false,
      isNewYearsEve: false,
    },
  ],
  cleaningFeeCents: 4_000,
  nightlyTotalDirectCents: 50_000,
};

function payPhonePartsTotal(amounts: ReturnType<typeof buildPayPhoneBoxAmountsForCharge>) {
  return (
    amounts.amountWithoutTax +
    amounts.amountWithTax +
    amounts.tax +
    amounts.service +
    amounts.tip
  );
}

describe("buildPayPhoneBoxAmountsForCharge", () => {
  it("cumple la ecuación de PayPhone y usa amountWithTax cuando hay IVA", () => {
    const breakdown = buildStayPriceBreakdown(LA_PUNTA_QUOTE, "payphone");
    const chargeCents = breakdown.totalCents;
    const amounts = buildPayPhoneBoxAmountsForCharge({
      breakdown,
      cleaningFeeCents: LA_PUNTA_QUOTE.cleaningFeeCents,
      guaranteeCents: refundableGuaranteeCents(LA_PUNTA_QUOTE.slug),
      chargeCents,
    });

    expect(amounts.amount).toBe(chargeCents);
    expect(payPhonePartsTotal(amounts)).toBe(chargeCents);
    expect(amounts.tax).toBeGreaterThan(0);
    expect(amounts.amountWithTax).toBeGreaterThan(0);
    expect(amounts.amountWithoutTax).toBe(
      breakdown.markupCents + refundableGuaranteeCents(LA_PUNTA_QUOTE.slug),
    );
  });

  it("escala montos en pago fraccionado (50 %)", () => {
    const breakdown = buildStayPriceBreakdown(LA_PUNTA_QUOTE, "payphone");
    const chargeCents = Math.round(breakdown.totalCents / 2);
    const amounts = buildPayPhoneBoxAmountsForCharge({
      breakdown,
      cleaningFeeCents: LA_PUNTA_QUOTE.cleaningFeeCents,
      guaranteeCents: refundableGuaranteeCents(LA_PUNTA_QUOTE.slug),
      chargeCents,
    });

    expect(amounts.amount).toBe(chargeCents);
    expect(payPhonePartsTotal(amounts)).toBe(chargeCents);
    expect(amounts.amountWithTax).toBeGreaterThan(0);
  });
});
