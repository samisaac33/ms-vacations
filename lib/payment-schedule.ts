import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { parseLocalDate } from "@/lib/dates";
import type { PaymentMethod } from "@/lib/payments/types";
import { totalCentsForPaymentMethod } from "@/lib/pricing";

export const SPLIT_BALANCE_DAYS_BEFORE_CHECKIN = 14;
export const SPLIT_MIN_DAYS_UNTIL_CHECKIN = 14;

export type PaymentTiming = "full_now" | "split";

export type SplitSchedule = {
  totalCents: number;
  depositCents: number;
  balanceCents: number;
  balanceDueDate: string;
};

export function daysUntilCheckIn(checkIn: string): number {
  const today = format(new Date(), "yyyy-MM-dd");
  return differenceInCalendarDays(parseLocalDate(checkIn), parseLocalDate(today));
}

export function isSplitPaymentEligible(checkIn: string): boolean {
  return daysUntilCheckIn(checkIn) >= SPLIT_MIN_DAYS_UNTIL_CHECKIN;
}

export function calculateBalanceDueDate(checkIn: string): string {
  return format(
    addDays(parseLocalDate(checkIn), -SPLIT_BALANCE_DAYS_BEFORE_CHECKIN),
    "yyyy-MM-dd",
  );
}

export function calculateSplitSchedule(totalCents: number, checkIn: string): SplitSchedule {
  const depositCents = Math.round(totalCents / 2);
  const balanceCents = totalCents - depositCents;
  return {
    totalCents,
    depositCents,
    balanceCents,
    balanceDueDate: calculateBalanceDueDate(checkIn),
  };
}

export function formatBalanceDueDate(iso: string): string {
  return format(parseISO(iso), "d MMM", { locale: es });
}

export function splitScheduleForPaymentMethod(
  baseDirectTotalCents: number,
  paymentMethod: PaymentMethod,
  checkIn: string,
): SplitSchedule {
  const totalCents = totalCentsForPaymentMethod(baseDirectTotalCents, paymentMethod);
  return calculateSplitSchedule(totalCents, checkIn);
}

export function amountDueNowCents(
  totalCents: number,
  paymentTiming: PaymentTiming,
  checkIn: string,
): number {
  if (paymentTiming === "split" && isSplitPaymentEligible(checkIn)) {
    return calculateSplitSchedule(totalCents, checkIn).depositCents;
  }
  return totalCents;
}

export function isPaymentTiming(value: string): value is PaymentTiming {
  return value === "full_now" || value === "split";
}
