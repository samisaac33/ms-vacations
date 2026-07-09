import { describe, expect, it } from "vitest";
import { beachBasePriceUpdates } from "@/lib/beach-price-migration";
import { bankTransferTotalCents, basePriceFromPriorDirectUsd } from "@/lib/pricing";

describe("beachBasePriceUpdates", () => {
  it("define cinco propiedades de playa", () => {
    expect(beachBasePriceUpdates()).toHaveLength(5);
  });
});

describe("bankTransferTotalCents", () => {
  it("revierte el markup del 7 % sobre la tarifa base", () => {
    expect(bankTransferTotalCents(53_500)).toBe(50_000);
    expect(bankTransferTotalCents(26_800)).toBe(25_047);
    expect(bankTransferTotalCents(32_100)).toBe(30_000);
  });
});

describe("basePriceFromPriorDirectUsd + transferencia", () => {
  it("La Punta: base $535 y transferencia $500", () => {
    const base = basePriceFromPriorDirectUsd(500);
    expect(base).toBe(535);
    expect(bankTransferTotalCents(base * 100) / 100).toBe(500);
  });
});
