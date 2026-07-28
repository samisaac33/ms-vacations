import { addDays, format } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  calculateBalanceDueDate,
  calculateSplitSchedule,
  isSplitPaymentEligible,
  SPLIT_MIN_DAYS_UNTIL_CHECKIN,
} from "@/lib/payment-schedule";

function isoDaysFromToday(days: number): string {
  return format(addDays(new Date(), days), "yyyy-MM-dd");
}

describe("isSplitPaymentEligible", () => {
  it(`rechaza check-in a menos de ${SPLIT_MIN_DAYS_UNTIL_CHECKIN} días`, () => {
    expect(isSplitPaymentEligible(isoDaysFromToday(6))).toBe(false);
  });

  it(`acepta check-in con al menos ${SPLIT_MIN_DAYS_UNTIL_CHECKIN} días`, () => {
    expect(isSplitPaymentEligible(isoDaysFromToday(7))).toBe(true);
    expect(isSplitPaymentEligible(isoDaysFromToday(30))).toBe(true);
  });
});

describe("calculateBalanceDueDate", () => {
  it("vence 7 días antes del check-in", () => {
    const checkIn = isoDaysFromToday(14);
    expect(calculateBalanceDueDate(checkIn)).toBe(isoDaysFromToday(7));
  });

  it("check-in a +7 días: saldo vence hoy", () => {
    const checkIn = isoDaysFromToday(7);
    const today = format(new Date(), "yyyy-MM-dd");
    expect(calculateBalanceDueDate(checkIn)).toBe(today);
  });
});

describe("calculateSplitSchedule", () => {
  it("divide 50/50 y calcula fecha de saldo", () => {
    const checkIn = isoDaysFromToday(14);
    const schedule = calculateSplitSchedule(1000, checkIn);
    expect(schedule.depositCents).toBe(500);
    expect(schedule.balanceCents).toBe(500);
    expect(schedule.balanceDueDate).toBe(isoDaysFromToday(7));
  });
});
