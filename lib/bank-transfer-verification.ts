import { calculateBalanceDueDate } from "@/lib/payment-schedule";

export type VerificationMode = "full" | "half" | "partial";

export type VerifiedPaymentUpdate = {
  status: "confirmed" | "pending_balance";
  depositCents: number | null;
  balanceCents: number | null;
  balanceDueAt: string | null;
  depositPaidAt: Date | null;
};

type BookingPaymentRow = {
  totalCents: number;
  checkIn: string;
  balanceDueAt: string | null;
  depositPaidAt: Date | null;
};

export function isVerificationMode(value: string): value is VerificationMode {
  return value === "full" || value === "half" || value === "partial";
}

export function resolveVerifiedPaidCents(
  totalCents: number,
  mode: VerificationMode,
  partialCents?: number,
): { ok: true; paidCents: number } | { ok: false; reason: string } {
  if (totalCents <= 0) {
    return { ok: false, reason: "Total de reserva inválido." };
  }

  let paidCents: number;
  if (mode === "full") {
    paidCents = totalCents;
  } else if (mode === "half") {
    paidCents = Math.round(totalCents / 2);
  } else {
    if (partialCents == null || !Number.isFinite(partialCents)) {
      return { ok: false, reason: "Indique el monto parcial verificado." };
    }
    paidCents = Math.round(partialCents);
  }

  if (paidCents <= 0) {
    return { ok: false, reason: "El monto verificado debe ser mayor a cero." };
  }
  if (paidCents > totalCents) {
    return { ok: false, reason: "El monto verificado no puede superar el total de la reserva." };
  }

  return { ok: true, paidCents };
}

export function applyVerifiedPaymentToBooking(
  row: BookingPaymentRow,
  paidCents: number,
): VerifiedPaymentUpdate {
  if (paidCents >= row.totalCents) {
    return {
      status: "confirmed",
      depositCents: null,
      balanceCents: null,
      balanceDueAt: null,
      depositPaidAt: row.depositPaidAt,
    };
  }

  return {
    status: "pending_balance",
    depositCents: paidCents,
    balanceCents: row.totalCents - paidCents,
    balanceDueAt: row.balanceDueAt ?? calculateBalanceDueDate(row.checkIn),
    depositPaidAt: new Date(),
  };
}

export function parsePartialAmountUsd(value: string): number | null {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
}
