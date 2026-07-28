import { describe, expect, it } from "vitest";
import {
  calculateLateCheckoutFees,
  getLateCheckoutRules,
} from "@/lib/legal/additional-house-rules";

describe("calculateLateCheckoutFees", () => {
  it("calcula montos para tarifa de 300 USD", () => {
    expect(calculateLateCheckoutFees(300)).toEqual({
      until14hUsd: 60,
      until16hUsd: 120,
      after16hUsd: 300,
    });
  });

  it("calcula montos para tarifa de 302 USD", () => {
    expect(calculateLateCheckoutFees(302)).toEqual({
      until14hUsd: 60,
      until16hUsd: 121,
      after16hUsd: 302,
    });
  });
});

describe("getLateCheckoutRules", () => {
  it("incluye horario 12:00 y las tres franjas horarias", () => {
    const rules = getLateCheckoutRules(300);

    expect(rules[0]).toContain("12:00");
    expect(rules[2]).toContain("14:00");
    expect(rules[2]).toContain("16:00");
    expect(rules[2]).toContain("USD 60");
    expect(rules[2]).toContain("USD 120");
    expect(rules[2]).toContain("USD 300");
    expect(rules[3]).toContain("USD 120");
  });
});
