import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/properties";
import { getPropertyBadges } from "@/lib/property-badges";

describe("getPropertyBadges", () => {
  it("incluye capacidad y piscina en propiedades de playa", () => {
    const beach = PROPERTIES.find((p) => p.slug === "alojamiento-en-arrecife")!;
    const badges = getPropertyBadges(beach);
    expect(badges.some((b) => b.label.includes("huéspedes"))).toBe(true);
    expect(badges.some((b) => b.label === "Piscina")).toBe(true);
  });

  it("marca ciudad en apartamentos urbanos", () => {
    const city = PROPERTIES.find((p) => p.destination === "city")!;
    const badges = getPropertyBadges(city);
    expect(badges.some((b) => b.label === "Ciudad")).toBe(true);
  });

  it("respeta el máximo de badges", () => {
    const property = PROPERTIES[0]!;
    expect(getPropertyBadges(property, 2)).toHaveLength(2);
  });
});
