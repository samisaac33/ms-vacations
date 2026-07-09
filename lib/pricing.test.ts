import { describe, expect, it } from "vitest";
import {
  BANK_TRANSFER_DISCOUNT_RATE,
  basePriceFromPriorDirectUsd,
  formatUsd,
  totalCentsForPaymentMethod,
  totalUsdForPaymentMethod,
} from "@/lib/pricing";

describe("formatUsd", () => {
  it("omite decimales en enteros", () => {
    expect(formatUsd(120)).toBe("120");
  });

  it("muestra dos decimales cuando hace falta", () => {
    expect(formatUsd(99.5)).toBe("99.50");
  });
});

describe("totalCentsForPaymentMethod", () => {
  const base = 10_000; // $100.00

  it("aplica descuento del 7 % en transferencia bancaria", () => {
    expect(totalCentsForPaymentMethod(base, "bank_transfer")).toBe(
      Math.round(base * BANK_TRANSFER_DISCOUNT_RATE),
    );
  });

  it("no descuenta PayPal ni PayPhone", () => {
    expect(totalCentsForPaymentMethod(base, "paypal")).toBe(base);
    expect(totalCentsForPaymentMethod(base, "payphone")).toBe(base);
  });
});

describe("totalUsdForPaymentMethod", () => {
  it("convierte centavos a USD", () => {
    expect(totalUsdForPaymentMethod(12_500, "paypal")).toBe(125);
    expect(totalUsdForPaymentMethod(10_000, "bank_transfer")).toBe(93);
  });
});

describe("basePriceFromPriorDirectUsd", () => {
  it("suma 7 % al precio directo anterior para la nueva tarifa base", () => {
    expect(basePriceFromPriorDirectUsd(500)).toBe(535);
    expect(basePriceFromPriorDirectUsd(250)).toBe(268);
    expect(basePriceFromPriorDirectUsd(260)).toBe(278);
    expect(basePriceFromPriorDirectUsd(280)).toBe(300);
    expect(basePriceFromPriorDirectUsd(300)).toBe(321);
  });
});
