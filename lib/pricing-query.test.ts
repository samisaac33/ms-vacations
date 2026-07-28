import { describe, expect, it } from "vitest";
import {
  fallbackCatalogCardQuote,
  isMismatchedNightlyRateOverride,
  quoteNightlyForDate,
} from "@/lib/pricing-query";
import type { VatPeriod } from "@/lib/legal/hospitality-vat";

const LA_PUNTA = "home-luxury-la-punta-18-personas-max";

const TEST_VAT_PERIODS: VatPeriod[] = [
  {
    start: "2026-12-26",
    end: "2027-01-03",
    label: "Fin de año",
  },
];

describe("isMismatchedNightlyRateOverride", () => {
  it("marca $300 como inconsistente cuando la base es $581", () => {
    expect(isMismatchedNightlyRateOverride(30_000, 58_100)).toBe(true);
  });

  it("detecta un override distinto a la base como inconsistente", () => {
    expect(isMismatchedNightlyRateOverride(60_000, 58_000)).toBe(true);
  });

  it("no marca como inconsistente un override igual a la base", () => {
    expect(isMismatchedNightlyRateOverride(58_000, 58_000)).toBe(false);
  });
});

describe("quoteNightlyForDate", () => {
  it("La Punta: ignora base DB legacy ($535) y cotiza $500 desde catálogo", () => {
    const night = quoteNightlyForDate({
      date: "2026-08-01",
      slug: LA_PUNTA,
      catalogReferenceCents: 58_100,
      overrides: new Map(),
    });
    expect(night.guestDirectCents).toBe(50_000);
    expect(night.directCents).toBe(50_000);
    expect(night.isPromotionalVat).toBe(false);
    expect(night.isNewYearsEve).toBe(false);
  });

  it("duplica el precio huésped el 31 de diciembre", () => {
    const night = quoteNightlyForDate({
      date: "2026-12-31",
      slug: LA_PUNTA,
      catalogReferenceCents: 58_100,
      overrides: new Map(),
    });
    expect(night.guestDirectCents).toBe(100_000);
    expect(night.directCents).toBe(100_000);
    expect(night.isNewYearsEve).toBe(true);
  });

  it("no duplica si hay override admin en fin de año", () => {
    const night = quoteNightlyForDate({
      date: "2026-12-31",
      slug: LA_PUNTA,
      catalogReferenceCents: 58_100,
      overrides: new Map([["2026-12-31", 70_000]]),
    });
    expect(night.guestDirectCents).toBe(60_200);
    expect(night.isOverride).toBe(true);
    expect(night.isNewYearsEve).toBe(false);
  });

  it("aplica IVA promocional sobre el precio duplicado de fin de año", () => {
    const night = quoteNightlyForDate({
      date: "2026-12-31",
      slug: LA_PUNTA,
      catalogReferenceCents: 58_100,
      overrides: new Map(),
      vatPeriods: TEST_VAT_PERIODS,
    });
    expect(night.guestDirectCents).toBe(100_000);
    expect(night.isPromotionalVat).toBe(true);
    expect(night.directCents).toBeLessThan(100_000);
    expect(night.isNewYearsEve).toBe(true);
  });
});

describe("fallbackCatalogCardQuote", () => {
  it("suma el doble en la noche de fin de año", () => {
    const quote = fallbackCatalogCardQuote(LA_PUNTA, "2026-12-30", "2027-01-02");
    expect(quote).toEqual({ nights: 3, totalUsd: 2040 });
  });
});
