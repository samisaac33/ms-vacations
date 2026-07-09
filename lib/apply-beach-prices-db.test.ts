import { describe, expect, it } from "vitest";
import { beachBasePriceUpdates } from "@/lib/beach-price-migration";
import { basePriceFromPriorDirectUsd, bankTransferTotalCents } from "@/lib/pricing";

describe("applyBeachPricesToDatabase mapping", () => {
  it("La Punta queda en base 535 y transferencia 500", () => {
    const laPunta = beachBasePriceUpdates().find(
      (row) => row.slug === "home-luxury-la-punta-18-personas-max",
    );
    expect(laPunta?.newUsd).toBe(535);
    expect(bankTransferTotalCents(laPunta!.newUsd * 100) / 100).toBe(500);
  });

  it("cada playa sube un 7 % sobre el precio anterior", () => {
    for (const row of beachBasePriceUpdates()) {
      expect(row.newUsd).toBe(basePriceFromPriorDirectUsd(row.priorUsd));
    }
  });
});
