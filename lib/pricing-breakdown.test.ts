import { describe, expect, it } from "vitest";
import { buildStayPriceBreakdown } from "@/lib/pricing-breakdown";
import type { StayQuote } from "@/lib/pricing-query";

const LA_PUNTA_QUOTE: StayQuote = {
  slug: "home-luxury-la-punta-18-personas-max",
  nights: 1,
  nightly: [
    {
      date: "2026-08-01",
      referenceCents: 58_100,
      guestDirectCents: 50_000,
      directCents: 50_000,
      isPromotionalVat: false,
      isOverride: false,
      isNewYearsEve: false,
    },
  ],
  cleaningFeeCents: 4_000,
  nightlyTotalDirectCents: 50_000,
  totalDirectCents: 54_000,
};

describe("buildStayPriceBreakdown", () => {
  it("incluye bloque de recargo de limpieza con IVA 15 %", () => {
    const breakdown = buildStayPriceBreakdown(LA_PUNTA_QUOTE, "bank_transfer");
    const cleaningIndex = breakdown.lines.findIndex((l) => l.label === "Recargo de limpieza");
    expect(cleaningIndex).toBeGreaterThan(-1);
    expect(breakdown.lines[cleaningIndex]?.amountCents).toBe(4_000);

    const cleaningBlock = breakdown.lines.slice(cleaningIndex, cleaningIndex + 3);
    expect(cleaningBlock.map((l) => l.label)).toEqual([
      "Recargo de limpieza",
      "Subtotal sin IVA",
      "IVA 15 %",
    ]);
    expect(cleaningBlock[1]?.amountCents).toBe(3_478);
    expect(cleaningBlock[2]?.amountCents).toBe(522);
  });

  it("no incluye fila redundante Subtotal con IVA incluido", () => {
    const breakdown = buildStayPriceBreakdown(LA_PUNTA_QUOTE, "bank_transfer");
    expect(breakdown.lines.some((l) => l.label === "Subtotal con IVA incluido")).toBe(false);
  });

  it("La Punta 1 noche: transferencia $540 + garantía $300", () => {
    const breakdown = buildStayPriceBreakdown(LA_PUNTA_QUOTE, "bank_transfer");
    const nightLine = breakdown.lines.find((l) => l.label === "1 noche");
    expect(nightLine?.amountCents).toBe(50_000);
    expect(breakdown.totalCents).toBe(84_000);
    expect(breakdown.totalUsd).toBe(840);
  });

  it("La Punta 1 noche sin período promocional: IVA 15 %", () => {
    const breakdown = buildStayPriceBreakdown(LA_PUNTA_QUOTE, "bank_transfer");
    const vatLine = breakdown.lines.find((l) => l.label === "IVA 15 %");
    expect(vatLine).toBeDefined();
    expect(breakdown.lines.some((l) => l.label === "IVA 8 %")).toBe(false);
  });

  it("La Punta 1 noche: tarjeta +5,75 % sobre noches + limpieza + garantía", () => {
    const breakdown = buildStayPriceBreakdown(LA_PUNTA_QUOTE, "payphone");
    expect(breakdown.markupCents).toBe(3_100);
    expect(breakdown.totalCents).toBe(87_100);
    expect(breakdown.totalUsd).toBe(871);
  });

  it("incluye línea explícita de garantía reembolsable", () => {
    const breakdown = buildStayPriceBreakdown(LA_PUNTA_QUOTE, "bank_transfer");
    const guaranteeLine = breakdown.lines.find((l) => l.label === "Garantía reembolsable");
    expect(guaranteeLine?.amountCents).toBe(30_000);
    const totalIndex = breakdown.lines.findIndex((l) => l.label === "Total a pagar");
    const guaranteeIndex = breakdown.lines.findIndex((l) => l.label === "Garantía reembolsable");
    expect(guaranteeIndex).toBeGreaterThan(-1);
    expect(totalIndex).toBeGreaterThan(guaranteeIndex);
  });

  it("Container Stay 2: limpieza $5 y sin garantía reembolsable", () => {
    const quote: StayQuote = {
      slug: "container-stay-1-san-clemente",
      nights: 1,
      nightly: [
        {
          date: "2026-08-01",
          referenceCents: 7_500,
          guestDirectCents: 6_500,
          directCents: 6_500,
          isPromotionalVat: false,
          isOverride: false,
          isNewYearsEve: false,
        },
      ],
      cleaningFeeCents: 500,
      nightlyTotalDirectCents: 6_500,
      totalDirectCents: 7_000,
    };
    const breakdown = buildStayPriceBreakdown(quote, "bank_transfer");
    expect(breakdown.lines.some((l) => l.label === "Garantía reembolsable")).toBe(false);
    expect(breakdown.lines.find((l) => l.label === "Recargo de limpieza")?.amountCents).toBe(500);
    expect(breakdown.totalCents).toBe(7_000);
    expect(breakdown.totalUsd).toBe(70);
  });
});
