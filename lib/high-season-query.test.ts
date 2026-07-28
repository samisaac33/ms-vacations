import { describe, expect, it } from "vitest";
import { vatPeriodOverlaps } from "@/lib/legal/hospitality-vat";

function periodsOverlapForProperty(
  a: { startDate: string; endDate: string; propertyIds: string[] },
  b: { startDate: string; endDate: string; propertyIds: string[] },
): boolean {
  const sharedProperty = a.propertyIds.some((id) => b.propertyIds.includes(id));
  if (!sharedProperty) return false;
  return vatPeriodOverlaps(
    { start: a.startDate, end: a.endDate, label: "" },
    { start: b.startDate, end: b.endDate, label: "" },
  );
}

describe("high season overlap per property", () => {
  it("no solapa si las fechas coinciden pero las propiedades son distintas", () => {
    expect(
      periodsOverlapForProperty(
        { startDate: "2026-01-01", endDate: "2026-01-10", propertyIds: ["a"] },
        { startDate: "2026-01-05", endDate: "2026-01-15", propertyIds: ["b"] },
      ),
    ).toBe(false);
  });

  it("solapa si comparten propiedad y las fechas se cruzan", () => {
    expect(
      periodsOverlapForProperty(
        { startDate: "2026-01-01", endDate: "2026-01-10", propertyIds: ["a", "b"] },
        { startDate: "2026-01-05", endDate: "2026-01-15", propertyIds: ["b"] },
      ),
    ).toBe(true);
  });

  it("no solapa si comparten propiedad pero las fechas son contiguas sin cruce", () => {
    expect(
      periodsOverlapForProperty(
        { startDate: "2026-01-01", endDate: "2026-01-10", propertyIds: ["a"] },
        { startDate: "2026-01-11", endDate: "2026-01-20", propertyIds: ["a"] },
      ),
    ).toBe(false);
  });
});
