import { describe, expect, it } from "vitest";
import { directCentsForNight, type VatPeriod } from "@/lib/legal/hospitality-vat";

const TEST_VAT_PERIODS: VatPeriod[] = [
  { start: "2026-02-14", end: "2026-02-17", label: "Test Carnaval" },
];

describe("promotional vat pricing", () => {
  it("suma mixta en estancia que cruza período promocional", () => {
    const referenceCents = 11500;
    const nights = [
      { date: "2026-02-16", cents: directCentsForNight(referenceCents, "2026-02-16", TEST_VAT_PERIODS) },
      { date: "2026-02-17", cents: directCentsForNight(referenceCents, "2026-02-17", TEST_VAT_PERIODS) },
      { date: "2026-02-18", cents: directCentsForNight(referenceCents, "2026-02-18", TEST_VAT_PERIODS) },
    ];
    const total = nights.reduce((sum, n) => sum + n.cents, 0);
    expect(nights[0].cents).toBe(10800);
    expect(nights[1].cents).toBe(10800);
    expect(nights[2].cents).toBe(11500);
    expect(total).toBe(33100);
  });
});
