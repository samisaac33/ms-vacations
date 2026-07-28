import { describe, expect, it } from "vitest";
import { beachBasePriceUpdates } from "@/lib/beach-price-migration";
import { guestDirectPriceUsd } from "@/lib/property-pricing";

describe("beachBasePriceUpdates", () => {
  it("define todas las propiedades de playa del catálogo", () => {
    expect(beachBasePriceUpdates()).toHaveLength(9);
  });

  it("Villa Palmera: referencia $465 y huésped $400", () => {
    const villa = beachBasePriceUpdates().find((row) => row.slug === "villa-palmera");
    expect(villa?.newUsd).toBe(465);
    expect(villa?.transferUsd).toBe(400);
    expect(guestDirectPriceUsd("villa-palmera")).toBe(400);
  });

  it("La Punta: referencia $581 y huésped $500", () => {
    const laPunta = beachBasePriceUpdates().find(
      (row) => row.slug === "home-luxury-la-punta-18-personas-max",
    );
    expect(laPunta?.newUsd).toBe(581);
    expect(laPunta?.transferUsd).toBe(500);
  });

  it("Porto Norte: referencia $372 y huésped $320", () => {
    const porto = beachBasePriceUpdates().find((row) => row.slug === "porto-norte");
    expect(porto?.newUsd).toBe(372);
    expect(porto?.transferUsd).toBe(320);
    expect(guestDirectPriceUsd("porto-norte")).toBe(320);
  });
});
