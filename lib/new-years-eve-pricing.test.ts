import { describe, expect, it } from "vitest";
import {
  applyNewYearsEveGuestDirectCents,
  isNewYearsEveNight,
  NEW_YEARS_EVE_PRICE_MULTIPLIER,
} from "@/lib/new-years-eve-pricing";

describe("isNewYearsEveNight", () => {
  it("detecta 31 de diciembre en cualquier año", () => {
    expect(isNewYearsEveNight("2026-12-31")).toBe(true);
    expect(isNewYearsEveNight("2027-12-31")).toBe(true);
  });

  it("ignora otras fechas", () => {
    expect(isNewYearsEveNight("2026-12-30")).toBe(false);
    expect(isNewYearsEveNight("2027-01-01")).toBe(false);
    expect(isNewYearsEveNight("2026-07-10")).toBe(false);
  });
});

describe("applyNewYearsEveGuestDirectCents", () => {
  it("duplica el precio huésped en fin de año sin override", () => {
    const result = applyNewYearsEveGuestDirectCents("2026-12-31", 50_000, false);
    expect(result.isNewYearsEve).toBe(true);
    expect(result.guestDirectCents).toBe(50_000 * NEW_YEARS_EVE_PRICE_MULTIPLIER);
  });

  it("no duplica si hay override admin", () => {
    const result = applyNewYearsEveGuestDirectCents("2026-12-31", 80_000, true);
    expect(result.isNewYearsEve).toBe(false);
    expect(result.guestDirectCents).toBe(80_000);
  });

  it("no duplica fechas normales", () => {
    const result = applyNewYearsEveGuestDirectCents("2026-08-01", 50_000, false);
    expect(result.isNewYearsEve).toBe(false);
    expect(result.guestDirectCents).toBe(50_000);
  });
});
