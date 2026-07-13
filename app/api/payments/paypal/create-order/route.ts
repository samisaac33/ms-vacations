import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { bookings, properties } from "@/db/schema";
import { chargeCentsForBooking, createPendingBookingAndCheckout } from "@/lib/booking-service";
import { isValidDateOrder, nightsBetween } from "@/lib/dates";
import { validateStayLength } from "@/lib/stay-rules";
import { isPaymentTiming } from "@/lib/payment-schedule";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/payments/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateOrderBody = {
  bookingId?: string;
  slug?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  guestEmail?: string;
  paymentTiming?: string;
  termsVersion?: string;
};

async function createOrderForBooking(bookingId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      booking: bookings,
      slug: properties.slug,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!row) {
    return Response.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const { booking, slug } = row;
  if (booking.paymentMethod !== "paypal") {
    return Response.json({ error: "La reserva no usa PayPal" }, { status: 409 });
  }
  if (booking.status !== "pending_payment") {
    return Response.json({ error: "La reserva ya no está pendiente de pago" }, { status: 409 });
  }
  if (booking.pendingExpiresAt && booking.pendingExpiresAt < new Date()) {
    return Response.json({ error: "La reserva expiró" }, { status: 409 });
  }

  const nights = nightsBetween(String(booking.checkIn), String(booking.checkOut));
  const description = `${booking.checkIn} → ${booking.checkOut} · ${nights} noches`;
  const chargeCents = chargeCentsForBooking(booking);

  try {
    const { orderId } = await createPayPalOrder({
      bookingId,
      totalCents: chargeCents,
      description,
      cancelPath: `/reservar/${slug}?cancelado=1`,
    });
    await db
      .update(bookings)
      .set({ paymentExternalId: orderId })
      .where(eq(bookings.id, bookingId));

    return Response.json({ orderId, bookingId });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Error al crear orden PayPal" },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada" }, { status: 503 });
  }
  if (!isPayPalConfigured()) {
    return Response.json({ error: "PayPal no configurado" }, { status: 503 });
  }

  let body: CreateOrderBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body.bookingId) {
    return createOrderForBooking(body.bookingId);
  }

  const {
    slug,
    checkIn,
    checkOut,
    guests,
    guestEmail,
    paymentTiming: paymentTimingRaw,
    termsVersion,
  } = body;

  if (
    !slug ||
    !checkIn ||
    !checkOut ||
    !guestEmail ||
    typeof guests !== "number" ||
    !termsVersion?.trim()
  ) {
    return Response.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const paymentTiming = paymentTimingRaw ?? "full_now";
  if (!isPaymentTiming(paymentTiming)) {
    return Response.json({ error: "Plan de pago inválido" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return Response.json({ error: "Fechas inválidas" }, { status: 400 });
  }
  if (guests < 1 || guests > 30) {
    return Response.json({ error: "Huéspedes inválidos" }, { status: 400 });
  }
  if (!isValidDateOrder(checkIn, checkOut)) {
    return Response.json({ error: "Rango de fechas inválido" }, { status: 400 });
  }
  const stayLengthError = validateStayLength(checkIn, checkOut);
  if (stayLengthError) {
    return Response.json({ error: stayLengthError }, { status: 400 });
  }

  const created = await createPendingBookingAndCheckout({
    slug,
    checkIn,
    checkOut,
    guests,
    guestEmail,
    paymentMethod: "paypal",
    paymentTiming,
    termsAccepted: true,
    termsVersion: termsVersion.trim(),
  });

  if (!created.ok) {
    const st =
      created.code === "property_not_found" ? 404 : created.code === "payment_error" ? 502 : 409;
    return Response.json({ error: created.message }, { status: st });
  }

  return createOrderForBooking(created.bookingId);
}
