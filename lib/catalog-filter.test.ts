import { describe, expect, it } from "vitest";
import { propertyAvailableForStay } from "@/lib/catalog-filter";

describe("propertyAvailableForStay", () => {
  const blocks = [{ start: "2026-08-10", end: "2026-08-15" }];

  it("excluye si el rango choca con un bloqueo", () => {
    expect(propertyAvailableForStay("2026-08-12", "2026-08-14", blocks)).toBe(false);
  });

  it("incluye si el rango no choca", () => {
    expect(propertyAvailableForStay("2026-08-15", "2026-08-18", blocks)).toBe(true);
  });

  it("excluye si supera la capacidad de huéspedes", () => {
    expect(propertyAvailableForStay("2026-08-15", "2026-08-18", blocks, 20, 18)).toBe(false);
    expect(propertyAvailableForStay("2026-08-15", "2026-08-18", blocks, 18, 18)).toBe(true);
  });
});
