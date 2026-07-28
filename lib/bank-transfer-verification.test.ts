import { describe, expect, it } from "vitest";
import {
  applyVerifiedPaymentToBooking,
  parsePartialAmountUsd,
  resolveVerifiedPaidCents,
} from "@/lib/bank-transfer-verification";

describe("resolveVerifiedPaidCents", () => {
  it("resuelve pago total", () => {
    expect(resolveVerifiedPaidCents(100_000, "full")).toEqual({ ok: true, paidCents: 100_000 });
  });

  it("resuelve pago 50%", () => {
    expect(resolveVerifiedPaidCents(100_001, "half")).toEqual({ ok: true, paidCents: 50_001 });
  });

  it("resuelve pago parcial", () => {
    expect(resolveVerifiedPaidCents(100_000, "partial", 30_000)).toEqual({
      ok: true,
      paidCents: 30_000,
    });
  });

  it("rechaza parcial sin monto", () => {
    expect(resolveVerifiedPaidCents(100_000, "partial")).toEqual({
      ok: false,
      reason: "Indique el monto parcial verificado.",
    });
  });

  it("rechaza monto cero o negativo", () => {
    expect(resolveVerifiedPaidCents(100_000, "partial", 0)).toEqual({
      ok: false,
      reason: "El monto verificado debe ser mayor a cero.",
    });
  });

  it("rechaza monto mayor al total", () => {
    expect(resolveVerifiedPaidCents(100_000, "partial", 100_001)).toEqual({
      ok: false,
      reason: "El monto verificado no puede superar el total de la reserva.",
    });
  });
});

describe("applyVerifiedPaymentToBooking", () => {
  const row = {
    totalCents: 100_000,
    checkIn: "2026-08-01",
    balanceDueAt: null as string | null,
    depositPaidAt: null as Date | null,
  };

  it("confirma reserva con pago total", () => {
    const update = applyVerifiedPaymentToBooking(row, 100_000);
    expect(update.status).toBe("confirmed");
    expect(update.depositCents).toBeNull();
    expect(update.balanceCents).toBeNull();
    expect(update.balanceDueAt).toBeNull();
  });

  it("deja saldo pendiente con pago parcial", () => {
    const update = applyVerifiedPaymentToBooking(row, 30_000);
    expect(update.status).toBe("pending_balance");
    expect(update.depositCents).toBe(30_000);
    expect(update.balanceCents).toBe(70_000);
    expect(update.balanceDueAt).toBe("2026-07-25");
    expect(update.depositPaidAt).toBeInstanceOf(Date);
  });

  it("conserva balanceDueAt existente", () => {
    const update = applyVerifiedPaymentToBooking(
      { ...row, balanceDueAt: "2026-07-20" },
      50_000,
    );
    expect(update.balanceDueAt).toBe("2026-07-20");
  });
});

describe("parsePartialAmountUsd", () => {
  it("convierte USD a centavos", () => {
    expect(parsePartialAmountUsd("300.50")).toBe(30_050);
    expect(parsePartialAmountUsd("300,50")).toBe(30_050);
  });

  it("retorna null para valores inválidos", () => {
    expect(parsePartialAmountUsd("")).toBeNull();
    expect(parsePartialAmountUsd("abc")).toBeNull();
  });
});
