import { desc, eq, inArray, sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { bookings, properties } from "@/db/schema";
import type { AdminBillingBooking, AdminBillingBookingStatus } from "@/lib/admin-billing-types";
import { formatBookingReference } from "@/lib/payments/bank-transfer";
import { getPropertyBySlug } from "@/lib/properties";

const BILLING_DEFAULT_LIMIT = 200;

export async function getBookingsForBillingAdmin(options?: {
  limit?: number;
}): Promise<AdminBillingBooking[]> {
  if (!hasDatabase()) return [];

  const limit = options?.limit ?? BILLING_DEFAULT_LIMIT;
  const db = getDb();

  const rows = await db
    .select({
      id: bookings.id,
      slug: properties.slug,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      guestEmail: bookings.guestEmail,
      totalCents: bookings.totalCents,
      depositCents: bookings.depositCents,
      balanceCents: bookings.balanceCents,
      paymentMethod: bookings.paymentMethod,
      status: bookings.status,
      billingName: bookings.billingName,
      billingIdType: bookings.billingIdType,
      billingIdNumber: bookings.billingIdNumber,
      billingCity: bookings.billingCity,
      billingCompletedAt: bookings.billingCompletedAt,
      voucherSentAt: bookings.voucherSentAt,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(inArray(bookings.status, ["confirmed", "pending_balance"]))
    .orderBy(sql`${bookings.billingCompletedAt} DESC NULLS LAST`, desc(bookings.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    reference: formatBookingReference(row.id),
    propertyName: getPropertyBySlug(row.slug)?.name ?? row.slug,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    guestEmail: row.guestEmail,
    totalCents: row.totalCents,
    depositCents: row.depositCents,
    balanceCents: row.balanceCents,
    paymentMethod: row.paymentMethod,
    status: row.status as AdminBillingBookingStatus,
    billingName: row.billingName,
    billingIdType: row.billingIdType,
    billingIdNumber: row.billingIdNumber,
    billingCity: row.billingCity,
    billingCompletedAt: row.billingCompletedAt?.toISOString() ?? null,
    voucherSentAt: row.voucherSentAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export function countBookingsMissingBilling(bookings: AdminBillingBooking[]): number {
  return bookings.filter((b) => !b.billingCompletedAt).length;
}
