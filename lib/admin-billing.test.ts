import { describe, expect, it } from "vitest";
import { countBookingsMissingBilling } from "@/lib/admin-billing";
import type { AdminBillingBooking } from "@/lib/admin-billing-types";

function sampleBooking(overrides: Partial<AdminBillingBooking> = {}): AdminBillingBooking {
  return {
    id: "bk-1",
    reference: "MS-ABC123",
    propertyName: "Casa de prueba",
    checkIn: "2026-08-01",
    checkOut: "2026-08-05",
    guestEmail: "guest@example.com",
    totalCents: 10000,
    depositCents: null,
    balanceCents: null,
    paymentMethod: "paypal",
    status: "confirmed",
    billingName: null,
    billingIdType: null,
    billingIdNumber: null,
    billingCity: null,
    billingCompletedAt: null,
    voucherSentAt: null,
    createdAt: "2026-07-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("countBookingsMissingBilling", () => {
  it("counts only bookings without billingCompletedAt", () => {
    const bookings = [
      sampleBooking({ id: "a", billingCompletedAt: "2026-07-02T10:00:00.000Z" }),
      sampleBooking({ id: "b" }),
      sampleBooking({ id: "c", billingCompletedAt: null }),
    ];
    expect(countBookingsMissingBilling(bookings)).toBe(2);
  });

  it("returns 0 when all bookings have billing data", () => {
    const bookings = [
      sampleBooking({ billingCompletedAt: "2026-07-02T10:00:00.000Z", voucherSentAt: "2026-07-02T10:05:00.000Z" }),
    ];
    expect(countBookingsMissingBilling(bookings)).toBe(0);
  });
});
