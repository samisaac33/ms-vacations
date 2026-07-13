import { describe, expect, it } from "vitest";
import { isMismatchedNightlyRateOverride } from "@/lib/pricing-query";

describe("isMismatchedNightlyRateOverride", () => {
  it("marca $300 como inconsistente cuando la base es $535", () => {
    expect(isMismatchedNightlyRateOverride(30_000, 53_500)).toBe(true);
  });

  it("detecta un override distinto a la base como inconsistente", () => {
    expect(isMismatchedNightlyRateOverride(60_000, 53_500)).toBe(true);
  });

  it("no marca como inconsistente un override igual a la base", () => {
    expect(isMismatchedNightlyRateOverride(53_500, 53_500)).toBe(false);
  });
});
