import { eq, sql } from "drizzle-orm";
import { addMinutes } from "date-fns";
import { getDb } from "@/db/index";
import { bookings, properties, syncLogs } from "@/db/schema";
import { assertRangeAvailable, AvailabilityError, expireStalePendingBookings } from "@/lib/availability";
import { notifyAdminPendingVerification } from "@/lib/notifications/admin";
import {
  calculateSplitSchedule,
  isSplitPaymentEligible,
  type PaymentTiming,
} from "@/lib/payment-schedule";
import { validateStayLength } from "@/lib/stay-rules";
import { isPayPalConfigured } from "@/lib/payments/paypal";
import { isPayPhoneConfigured } from "@/lib/payments/payphone";
import type { InitiatePaymentResult, PaymentMethod } from "@/lib/payments/types";
import { calculateStayDirectTotalCents } from "@/lib/pricing-query";
import { totalCentsForPaymentMethod } from "@/lib/pricing";

const ONLINE_PENDING_MINUTES = 30;
const BANK_TRANSFER_HOLD_MINUTES = 30;

export type BankTransferInit = "whatsapp" | "standard";

export type CreateBookingInput = {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestEmail: string;
  paymentMethod: PaymentMethod;
  paymentTiming: PaymentTiming;
  termsAccepted: boolean;
  termsVersion: string;
  bankTransferInit?: BankTransferInit;
  guestNotes?: string;
};

export type CreateBookingResult =
  | {
      ok: true;
      bookingId: string;
      totalCents: number;
      paymentMethod: PaymentMethod;
      next: InitiatePaymentResult["next"];
      redirectUrl: string;
    }
  | {
      ok: false;
      code: "unavailable" | "property_not_found" | "payment_error";
      message: string;
    };

type BookingChargeRow = {
  paymentTiming: string;
  depositCents: number | null;
  totalCents: number;
};

export function chargeCentsForBooking(row: BookingChargeRow): number {
  if (row.paymentTiming === "split" && row.depositCents != null) {
    return row.depositCents;
  }
  return row.totalCents;
}

export async function createPendingBookingAndCheckout(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const stayLengthError = validateStayLength(input.checkIn, input.checkOut);
  if (stayLengthError) {
    return { ok: false, code: "unavailable", message: stayLengthError };
  }

  const effectiveTiming: PaymentTiming =
    input.paymentTiming === "split" && isSplitPaymentEligible(input.checkIn)
      ? "split"
      : "full_now";

  if (input.paymentTiming === "split" && effectiveTiming !== "split") {
    return {
      ok: false,
      code: "unavailable",
      message: "El pago fraccionado requiere al menos 14 días antes del check-in.",
    };
  }

  const db = getDb();

  try {
    const created = await db.transaction(async (tx) => {
      await expireStalePendingBookings(tx);
      const [prop] = await tx
        .select()
        .from(properties)
        .where(eq(properties.slug, input.slug))
        .limit(1);
      if (!prop) {
        return { type: "not_found" as const };
      }

      await tx.execute(sql`SELECT 1 FROM properties WHERE id = ${prop.id}::uuid FOR UPDATE`);

      await assertRangeAvailable(tx, prop.id, input.checkIn, input.checkOut);
      const baseDirectTotalCents = await calculateStayDirectTotalCents(
        prop.id,
        input.checkIn,
        input.checkOut,
        tx,
      );
      const totalCents = totalCentsForPaymentMethod(baseDirectTotalCents, input.paymentMethod);
      const split =
        effectiveTiming === "split"
          ? calculateSplitSchedule(totalCents, input.checkIn)
          : null;
      const pendingExpiresAt =
        input.paymentMethod === "bank_transfer"
          ? addMinutes(new Date(), BANK_TRANSFER_HOLD_MINUTES)
          : addMinutes(new Date(), ONLINE_PENDING_MINUTES);

      const bankTransferViaWhatsApp =
        input.paymentMethod === "bank_transfer" && input.bankTransferInit === "whatsapp";

      const [booking] = await tx
        .insert(bookings)
        .values({
          propertyId: prop.id,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          guests: input.guests,
          status: bankTransferViaWhatsApp ? "pending_verification" : "pending_payment",
          paymentMethod: input.paymentMethod,
          paymentTiming: effectiveTiming,
          totalCents,
          depositCents: split?.depositCents ?? null,
          balanceCents: split?.balanceCents ?? null,
          balanceDueAt: split?.balanceDueDate ?? null,
          currency: "USD",
          pendingExpiresAt,
          guestEmail: input.guestEmail,
          termsAcceptedAt: new Date(),
          termsVersion: input.termsVersion,
        })
        .returning({ id: bookings.id });
      if (!booking) throw new Error("No se pudo crear la reserva");
      return { type: "created" as const, bookingId: booking.id, totalCents, prop };
    });

    if (created.type === "not_found") {
      return {
        ok: false,
        code: "property_not_found",
        message: "Propiedad no encontrada en la base de datos. Ejecute npm run db:seed tras db:push.",
      };
    }

    const { bookingId, totalCents, prop } = created;

    if (input.guestNotes?.trim()) {
      await db.insert(syncLogs).values({
        propertyId: prop.id,
        level: "info",
        message: `Notas huésped (${bookingId}): ${input.guestNotes.trim()}`,
      });
    }

    if (input.paymentMethod === "bank_transfer") {
      if (input.bankTransferInit === "whatsapp") {
        await notifyAdminPendingVerification(bookingId);
      }
      return {
        ok: true,
        bookingId,
        totalCents,
        paymentMethod: input.paymentMethod,
        next: "bank_instructions",
        redirectUrl: `/reserva/transferencia/${bookingId}`,
      };
    }

    if (input.paymentMethod === "paypal") {
      if (!isPayPalConfigured()) {
        return {
          ok: false,
          code: "payment_error",
          message: "PayPal no está configurado. Contacte al administrador.",
        };
      }
      return {
        ok: true,
        bookingId,
        totalCents,
        paymentMethod: input.paymentMethod,
        next: "paypal_buttons",
        redirectUrl: `/reservar/${prop.slug}?paypal=1&bookingId=${bookingId}`,
      };
    }

    if (input.paymentMethod === "payphone") {
      if (!isPayPhoneConfigured()) {
        return {
          ok: false,
          code: "payment_error",
          message: "PayPhone no está configurado. Contacte al administrador.",
        };
      }
      return {
        ok: true,
        bookingId,
        totalCents,
        paymentMethod: input.paymentMethod,
        next: "payphone_box",
        redirectUrl: `/reservar/${prop.slug}?payphone=1&bookingId=${bookingId}`,
      };
    }

    return {
      ok: false,
      code: "payment_error",
      message: "Método de pago no soportado.",
    };
  } catch (e) {
    if (e instanceof AvailabilityError) {
      return { ok: false, code: "unavailable", message: e.message };
    }
    throw e;
  }
}

export async function confirmBookingAfterPayment(params: {
  bookingId: string;
  externalId?: string | null;
  amountCents: number | null;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = getDb();
  return await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT 1 FROM bookings WHERE id = ${params.bookingId}::uuid FOR UPDATE`);
    const [row] = await tx
      .select()
      .from(bookings)
      .where(eq(bookings.id, params.bookingId))
      .limit(1);
    if (!row) return { ok: false, reason: "Reserva no encontrada" };
    if (row.status === "confirmed") return { ok: true };
    if (row.status === "pending_balance") return { ok: true };
    if (row.status !== "pending_payment") {
      return { ok: false, reason: "Estado de reserva no permite confirmación" };
    }
    if (row.pendingExpiresAt && row.pendingExpiresAt < new Date()) {
      await tx.update(bookings).set({ status: "expired" }).where(eq(bookings.id, params.bookingId));
      return { ok: false, reason: "La reserva expiró antes del pago" };
    }

    const expectedCents = chargeCentsForBooking(row);
    if (params.amountCents !== null && params.amountCents !== expectedCents) {
      await tx.insert(syncLogs).values({
        propertyId: row.propertyId,
        level: "error",
        message: `Monto distinto al esperado en reserva ${params.bookingId}`,
      });
      return { ok: false, reason: "Monto del pago no coincide con la reserva" };
    }

    const isSplitDeposit = row.paymentTiming === "split" && row.depositCents != null;

    await tx
      .update(bookings)
      .set({
        status: isSplitDeposit ? "pending_balance" : "confirmed",
        paymentExternalId: params.externalId ?? row.paymentExternalId,
        pendingExpiresAt: null,
        depositPaidAt: isSplitDeposit ? new Date() : row.depositPaidAt,
      })
      .where(eq(bookings.id, params.bookingId));
    return { ok: true };
  });
}

export async function submitBankTransferProof(params: {
  bookingId: string;
  proofUrl: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = getDb();
  return await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT 1 FROM bookings WHERE id = ${params.bookingId}::uuid FOR UPDATE`);
    const [row] = await tx
      .select()
      .from(bookings)
      .where(eq(bookings.id, params.bookingId))
      .limit(1);
    if (!row) return { ok: false, reason: "Reserva no encontrada" };
    if (row.paymentMethod !== "bank_transfer") {
      return { ok: false, reason: "Esta reserva no es por transferencia bancaria" };
    }
    if (row.status === "pending_verification") {
      if (row.paymentProofUrl) return { ok: true };
      await tx
        .update(bookings)
        .set({
          paymentProofUrl: params.proofUrl,
          paymentProofUploadedAt: new Date(),
        })
        .where(eq(bookings.id, params.bookingId));
      await notifyAdminPendingVerification(params.bookingId);
      return { ok: true };
    }
    if (row.status !== "pending_payment") {
      return { ok: false, reason: "La reserva ya no acepta comprobantes" };
    }
    if (row.pendingExpiresAt && row.pendingExpiresAt < new Date()) {
      await tx.update(bookings).set({ status: "expired" }).where(eq(bookings.id, params.bookingId));
      return { ok: false, reason: "La reserva expiró" };
    }
    await tx
      .update(bookings)
      .set({
        status: "pending_verification",
        paymentProofUrl: params.proofUrl,
        paymentProofUploadedAt: new Date(),
      })
      .where(eq(bookings.id, params.bookingId));
    await notifyAdminPendingVerification(params.bookingId);
    return { ok: true };
  });
}

export async function confirmBankTransferBooking(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = getDb();
  return await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT 1 FROM bookings WHERE id = ${bookingId}::uuid FOR UPDATE`);
    const [row] = await tx.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    if (!row) return { ok: false, reason: "Reserva no encontrada" };
    if (row.status === "confirmed") return { ok: true };
    if (row.status === "pending_balance") return { ok: true };
    if (row.status !== "pending_verification" || row.paymentMethod !== "bank_transfer") {
      return { ok: false, reason: "La reserva no está pendiente de verificación" };
    }

    const isSplitDeposit = row.paymentTiming === "split" && row.depositCents != null;

    await tx
      .update(bookings)
      .set({
        status: isSplitDeposit ? "pending_balance" : "confirmed",
        pendingExpiresAt: null,
        depositPaidAt: isSplitDeposit ? new Date() : row.depositPaidAt,
      })
      .where(eq(bookings.id, bookingId));
    return { ok: true };
  });
}

export async function rejectBankTransferBooking(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = getDb();
  return await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT 1 FROM bookings WHERE id = ${bookingId}::uuid FOR UPDATE`);
    const [row] = await tx.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    if (!row) return { ok: false, reason: "Reserva no encontrada" };
    if (row.status !== "pending_verification") {
      return { ok: false, reason: "Solo se pueden rechazar reservas en verificación" };
    }
    await tx
      .update(bookings)
      .set({ status: "cancelled", pendingExpiresAt: null })
      .where(eq(bookings.id, bookingId));
    return { ok: true };
  });
}

export async function getBookingForGuest(bookingId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      paymentMethod: bookings.paymentMethod,
      paymentTiming: bookings.paymentTiming,
      totalCents: bookings.totalCents,
      depositCents: bookings.depositCents,
      balanceCents: bookings.balanceCents,
      balanceDueAt: bookings.balanceDueAt,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      guests: bookings.guests,
      guestEmail: bookings.guestEmail,
      paymentProofUrl: bookings.paymentProofUrl,
      pendingExpiresAt: bookings.pendingExpiresAt,
      slug: properties.slug,
      propertyName: properties.slug,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(eq(bookings.id, bookingId))
    .limit(1);
  return row ?? null;
}
