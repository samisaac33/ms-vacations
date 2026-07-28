import type { BookingResultSummary } from "@/components/booking/booking-result-summary-card";
import type { BookingEmailContext } from "@/lib/email/booking-context";
import { PAYMENT_OPTIONS } from "@/lib/payment-options";

export function paymentMethodLabel(method: string): string {
  return PAYMENT_OPTIONS.find((o) => o.id === method)?.label ?? method;
}

export function bookingContextToResultSummary(
  ctx: BookingEmailContext,
): BookingResultSummary {
  return {
    propertyName: ctx.propertyName,
    checkIn: ctx.checkIn,
    checkOut: ctx.checkOut,
    guests: ctx.guests,
    reference: ctx.reference,
    totalUsd: ctx.totalCents / 100,
    guestEmail: ctx.guestEmail,
    paymentMethodLabel: paymentMethodLabel(ctx.paymentMethod),
    paymentTiming: ctx.paymentTiming,
    depositUsd: ctx.depositCents != null ? ctx.depositCents / 100 : undefined,
    balanceUsd: ctx.balanceCents != null ? ctx.balanceCents / 100 : undefined,
    balanceDueAt: ctx.balanceDueAt,
  };
}

export type GuestBookingSummaryInput = {
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  reference: string;
  totalUsd: number;
  guestEmail: string;
  paymentMethod: string;
  paymentTiming?: BookingResultSummary["paymentTiming"];
  depositCents?: number | null;
  balanceCents?: number | null;
  balanceDueAt?: string | null;
};

export function guestBookingToResultSummary(
  input: GuestBookingSummaryInput,
): BookingResultSummary {
  return {
    propertyName: input.propertyName,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    reference: input.reference,
    totalUsd: input.totalUsd,
    guestEmail: input.guestEmail,
    paymentMethodLabel: paymentMethodLabel(input.paymentMethod),
    paymentTiming: input.paymentTiming,
    depositUsd: input.depositCents != null ? input.depositCents / 100 : undefined,
    balanceUsd: input.balanceCents != null ? input.balanceCents / 100 : undefined,
    balanceDueAt: input.balanceDueAt,
  };
}
