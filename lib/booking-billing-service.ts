import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { bookings } from "@/db/schema";
import type { BillingInput } from "@/lib/billing-validation";
import { canSaveBilling, canSendVoucher } from "@/lib/billing-validation";
import { notifyGuestBookingVoucher } from "@/lib/notifications/guest";

export type SubmitBillingResult =
  | { ok: true; voucherSent: boolean; voucherPending: boolean }
  | { ok: false; reason: string };

export type BillingStatus = {
  billingCompleted: boolean;
  voucherSent: boolean;
  billingName: string | null;
  billingIdType: string | null;
  billingIdNumber: string | null;
  billingCity: string | null;
  guestEmail: string | null;
  status: string;
};

export async function getBillingStatus(bookingId: string): Promise<BillingStatus | null> {
  const db = getDb();
  const [row] = await db
    .select({
      status: bookings.status,
      guestEmail: bookings.guestEmail,
      billingName: bookings.billingName,
      billingIdType: bookings.billingIdType,
      billingIdNumber: bookings.billingIdNumber,
      billingCity: bookings.billingCity,
      billingCompletedAt: bookings.billingCompletedAt,
      voucherSentAt: bookings.voucherSentAt,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!row) return null;

  return {
    billingCompleted: Boolean(row.billingCompletedAt),
    voucherSent: Boolean(row.voucherSentAt),
    billingName: row.billingName,
    billingIdType: row.billingIdType,
    billingIdNumber: row.billingIdNumber,
    billingCity: row.billingCity,
    guestEmail: row.guestEmail,
    status: row.status,
  };
}

export async function submitBookingBilling(
  bookingId: string,
  input: BillingInput,
): Promise<SubmitBillingResult> {
  const db = getDb();
  const [row] = await db
    .select({
      status: bookings.status,
      voucherSentAt: bookings.voucherSentAt,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!row) return { ok: false, reason: "Reserva no encontrada." };
  if (!canSaveBilling(row.status)) {
    return { ok: false, reason: "Esta reserva no acepta datos de facturacion." };
  }

  await db
    .update(bookings)
    .set({
      guestEmail: input.guestEmail,
      billingName: input.billingName,
      billingIdType: input.billingIdType,
      billingIdNumber: input.billingIdNumber,
      billingCity: input.billingCity,
      billingCompletedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId));

  if (row.voucherSentAt) {
    return { ok: true, voucherSent: true, voucherPending: false };
  }

  if (canSendVoucher(row.status)) {
    const sent = await notifyGuestBookingVoucher(bookingId);
    return {
      ok: true,
      voucherSent: sent,
      voucherPending: !sent,
    };
  }

  return {
    ok: true,
    voucherSent: false,
    voucherPending: true,
  };
}

export async function trySendVoucherIfReady(bookingId: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({
      status: bookings.status,
      billingCompletedAt: bookings.billingCompletedAt,
      voucherSentAt: bookings.voucherSentAt,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!row) return false;
  if (!row.billingCompletedAt || row.voucherSentAt) return false;
  if (!canSendVoucher(row.status)) return false;

  return notifyGuestBookingVoucher(bookingId);
}
