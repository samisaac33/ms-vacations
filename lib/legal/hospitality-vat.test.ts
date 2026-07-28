import { describe, expect, it } from "vitest";
import {
  HOSPITALITY_VAT_PROMOTIONAL_RATE,
  HOSPITALITY_VAT_STANDARD_RATE,
  directCentsForNight,
  hospitalityVatRatePercentForNight,
  isPromotionalVatDate,
  quoteHasPromotionalVatNights,
  stayTouchesPromotionalVat,
  type VatPeriod,
} from "@/lib/legal/hospitality-vat";

const TEST_VAT_PERIODS: VatPeriod[] = [
  { start: "2026-02-14", end: "2026-02-17", label: "Test Carnaval" },
];

describe("hospitality-vat", () => {
  it("aplica tarifa promocional en fechas del período configurado", () => {
    expect(isPromotionalVatDate("2026-02-15", TEST_VAT_PERIODS)).toBe(true);
    expect(isPromotionalVatDate("2026-07-10", TEST_VAT_PERIODS)).toBe(false);
    expect(isPromotionalVatDate("2026-07-10", [])).toBe(false);
  });

  it("detecta estancias que cruzan feriado decretado", () => {
    expect(stayTouchesPromotionalVat("2026-02-13", "2026-02-18", TEST_VAT_PERIODS)).toBe(true);
    expect(stayTouchesPromotionalVat("2026-07-01", "2026-07-05", TEST_VAT_PERIODS)).toBe(false);
  });

  it("expone tarifas estándar y promocional", () => {
    expect(HOSPITALITY_VAT_STANDARD_RATE).toBe(0.15);
    expect(HOSPITALITY_VAT_PROMOTIONAL_RATE).toBe(0.08);
  });

  it("reduce el precio directo en noches con IVA 8 %", () => {
    const referenceCents = 11500; // $115 con IVA 15 % incluido
    const standard = directCentsForNight(referenceCents, "2026-07-10", TEST_VAT_PERIODS);
    const promo = directCentsForNight(referenceCents, "2026-02-15", TEST_VAT_PERIODS);
    expect(standard).toBe(referenceCents);
    expect(promo).toBeLessThan(referenceCents);
    expect(promo).toBe(10800); // base 10000 * 1.08
  });

  it("La Punta sin período admin: desglose IVA 15 %, no confunde descuento catálogo", () => {
    const night = {
      referenceCents: 58_100,
      guestDirectCents: 50_000,
      directCents: 50_000,
      isPromotionalVat: false,
    };
    expect(hospitalityVatRatePercentForNight(night)).toBe(HOSPITALITY_VAT_STANDARD_RATE * 100);
    expect(quoteHasPromotionalVatNights([night])).toBe(false);
  });

  it("noche en período admin: IVA 8 % y precio reducido", () => {
    const guestDirectCents = 50_000;
    const directCents = directCentsForNight(guestDirectCents, "2026-02-15", TEST_VAT_PERIODS);
    const night = {
      guestDirectCents,
      directCents,
      isPromotionalVat: true,
    };
    expect(directCents).toBeLessThan(guestDirectCents);
    expect(hospitalityVatRatePercentForNight(night)).toBe(HOSPITALITY_VAT_PROMOTIONAL_RATE * 100);
    expect(quoteHasPromotionalVatNights([night])).toBe(true);
  });
});
