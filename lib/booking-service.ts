import { eq, sql } from "drizzle-orm";
import { addHours, addMinutes } from "date-fns";
import { getDb } from "@/db/index";
import { bookings, properties, syncLogs } from "@/db/schema";
import { assertRangeAvailable, AvailabilityError, expireStalePendingBookings } from "@/lib/availability";
import { nightsBetween } from "@/lib/dates";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/payments/paypal";
import { createPayPhoneSale, isPayPhoneConfigured } from "@/lib/payments/payphone";
import type { InitiatePaymentResult, PaymentMethod } from "@/lib/payments/types";
import { calculateStayDirectTotalCents } from "@/lib/pricing-query";
import { totalCentsForPaymentMethod } from "@/lib/pricing";

const ONLINE_PENDING_MINUTES = 30;
const BANK_TRANSFER_PENDING_HOURS = 72;

export type CreateBookingInput = {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestEmail: string;
  paymentMethod: PaymentMethod;
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

export async function createPendingBookingAndCheckout(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
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
      const pendingExpiresAt =
        input.paymentMethod === "bank_transfer"
          ? addHours(new Date(), BANK_TRANSFER_PENDING_HOURS)
          : addMinutes(new Date(), ONLINE_PENDING_MINUTES);

      const [booking] = await tx
        .insert(bookings)
        .values({
          propertyId: prop.id,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          guests: input.guests,
          status: "pending_payment",
          paymentMethod: input.paymentMethod,
          totalCents,
          currency: "USD",
          pendingExpiresAt,
          guestEmail: input.guestEmail,
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
    const cancelPath = `/reservar/${prop.slug}?cancelado=1`;
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const description = `${input.checkIn} → ${input.checkOut} · ${nights} noches`;

    if (input.paymentMethod === "bank_transfer") {
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
      try {
        const { approvalUrl, orderId } = await createPayPalOrder({
          bookingId,
          totalCents,
          description,
          cancelPath,
        });
        await db
          .update(bookings)
          .set({ paymentExternalId: orderId })
          .where(eq(bookings.id, bookingId));
        return {
          ok: true,
          bookingId,
          totalCents,
          paymentMethod: input.paymentMethod,
          next: "redirect",
          redirectUrl: approvalUrl,
        };
      } catch (e) {
        await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, bookingId));
        return {
          ok: false,
          code: "payment_error",
          message: e instanceof Error ? e.message : "Error al iniciar pago con PayPal.",
        };
      }
    }

    if (input.paymentMethod === "payphone") {
      if (!isPayPhoneConfigured()) {
        return {
          ok: false,
          code: "payment_error",
          message: "PayPhone no está configurado. Contacte al administrador.",
        };
      }
      try {
        const { redirectUrl, transactionId } = await createPayPhoneSale({
          bookingId,
          totalCents,
          guestEmail: input.guestEmail,
          cancelPath,
        });
        await db
          .update(bookings)
          .set({ paymentExternalId: transactionId })
          .where(eq(bookings.id, bookingId));
        return {
          ok: true,
          bookingId,
          totalCents,
          paymentMethod: input.paymentMethod,
          next: "redirect",
          redirectUrl,
        };
      } catch (e) {
        await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, bookingId));
        return {
          ok: false,
          code: "payment_error",
          message: e instanceof Error ? e.message : "Error al iniciar pago con PayPhone.",
        };
      }
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
    if (row.status !== "pending_payment") {
      return { ok: false, reason: "Estado de reserva no permite confirmación" };
    }
    if (row.pendingExpiresAt && row.pendingExpiresAt < new Date()) {
      await tx.update(bookings).set({ status: "expired" }).where(eq(bookings.id, params.bookingId));
      return { ok: false, reason: "La reserva expiró antes del pago" };
    }
    if (params.amountCents !== null && params.amountCents !== row.totalCents) {
      await tx.insert(syncLogs).values({
        propertyId: row.propertyId,
        level: "error",
        message: `Monto distinto al total de reserva ${params.bookingId}`,
      });
      return { ok: false, reason: "Monto del pago no coincide con la reserva" };
    }
    await tx
      .update(bookings)
      .set({
        status: "confirmed",
        paymentExternalId: params.externalId ?? row.paymentExternalId,
        pendingExpiresAt: null,
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
    if (row.status === "pending_verification") return { ok: true };
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
        pendingExpiresAt: null,
      })
      .where(eq(bookings.id, params.bookingId));
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
    if (row.status !== "pending_verification" || row.paymentMethod !== "bank_transfer") {
      return { ok: false, reason: "La reserva no está pendiente de verificación" };
    }
    await tx
      .update(bookings)
      .set({ status: "confirmed", pendingExpiresAt: null })
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
      totalCents: bookings.totalCents,
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
