import { hasDatabase } from "@/db/index";
import { createPendingBookingAndCheckout } from "@/lib/booking-service";
import { isValidDateOrder } from "@/lib/dates";
import { validateStayLength } from "@/lib/stay-rules";
import { isPaymentMethod } from "@/lib/payments/types";
import { isPaymentTiming } from "@/lib/payment-schedule";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(r: Request) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada" }, { status: 503 });
  }
  let d: unknown;
  try {
    d = await r.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }
  const b = d as {
    slug?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    guestEmail?: string;
    paymentMethod?: string;
    paymentTiming?: string;
    termsAccepted?: boolean;
    termsVersion?: string;
    bankTransferInit?: string;
    guestNotes?: string;
  };
  if (
    !b.slug ||
    !b.checkIn ||
    !b.checkOut ||
    !b.guestEmail ||
    typeof b.guests !== "number" ||
    !b.paymentMethod ||
    b.termsAccepted !== true ||
    !b.termsVersion?.trim()
  ) {
    return Response.json({ error: "Datos incompletos" }, { status: 400 });
  }
  if (!isPaymentMethod(b.paymentMethod)) {
    return Response.json({ error: "Método de pago inválido" }, { status: 400 });
  }
  const paymentTiming = b.paymentTiming ?? "full_now";
  if (!isPaymentTiming(paymentTiming)) {
    return Response.json({ error: "Plan de pago inválido" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(b.checkOut)) {
    return Response.json({ error: "Fechas inválidas" }, { status: 400 });
  }
  if (b.guests < 1 || b.guests > 30) {
    return Response.json({ error: "Huéspedes inválidos" }, { status: 400 });
  }
  if (!isValidDateOrder(b.checkIn, b.checkOut)) {
    return Response.json({ error: "Rango de fechas inválido" }, { status: 400 });
  }
  const stayLengthError = validateStayLength(b.checkIn, b.checkOut);
  if (stayLengthError) {
    return Response.json({ error: stayLengthError }, { status: 400 });
  }
  const bankTransferInit =
    b.bankTransferInit === "whatsapp" || b.bankTransferInit === "standard"
      ? b.bankTransferInit
      : undefined;
  if (b.bankTransferInit && !bankTransferInit) {
    return Response.json({ error: "Inicio de transferencia inválido" }, { status: 400 });
  }
  const guestNotes =
    typeof b.guestNotes === "string" && b.guestNotes.trim() ? b.guestNotes.trim().slice(0, 2000) : undefined;
  const o = await createPendingBookingAndCheckout({
    slug: b.slug,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    guests: b.guests,
    guestEmail: b.guestEmail,
    paymentMethod: b.paymentMethod,
    paymentTiming,
    termsAccepted: true,
    termsVersion: b.termsVersion.trim(),
    bankTransferInit,
    guestNotes,
  });
  if (!o.ok) {
    const st =
      o.code === "property_not_found" ? 404 : o.code === "payment_error" ? 502 : 409;
    return Response.json({ error: o.message }, { status: st });
  }
  return Response.json({
    bookingId: o.bookingId,
    totalCents: o.totalCents,
    paymentMethod: o.paymentMethod,
    next: o.next,
    redirectUrl: o.redirectUrl,
  });
}
