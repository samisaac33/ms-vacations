import { describe, expect, it } from "vitest";
import { beachBasePriceUpdates } from "@/lib/beach-price-migration";
import { catalogReferencePriceUsd, guestDirectPriceUsd } from "@/lib/property-pricing";

describe("applyBeachPricesToDatabase mapping", () => {
  it("La Punta queda en referencia $581 y huésped $500", () => {
    const laPunta = beachBasePriceUpdates().find(
      (row) => row.slug === "home-luxury-la-punta-18-personas-max",
    );
    expect(laPunta?.newUsd).toBe(581);
    expect(laPunta?.transferUsd).toBe(500);
    expect(catalogReferencePriceUsd("home-luxury-la-punta-18-personas-max")).toBe(581);
    expect(guestDirectPriceUsd("home-luxury-la-punta-18-personas-max")).toBe(500);
  });

  it("cada playa usa referencia sin descuento y mantiene el precio huésped", () => {
    for (const row of beachBasePriceUpdates()) {
      expect(row.newUsd).toBe(catalogReferencePriceUsd(row.slug));
      expect(row.transferUsd).toBe(guestDirectPriceUsd(row.slug));
    }
  });
});
