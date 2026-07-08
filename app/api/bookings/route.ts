import { hasDatabase } from "@/db/index";
import { createPendingBookingAndCheckout } from "@/lib/booking-service";
import { isValidDateOrder } from "@/lib/dates";
import { isPaymentMethod } from "@/lib/payments/types";

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
  };
  if (
    !b.slug ||
    !b.checkIn ||
    !b.checkOut ||
    !b.guestEmail ||
    typeof b.guests !== "number" ||
    !b.paymentMethod
  ) {
    return Response.json({ error: "Datos incompletos" }, { status: 400 });
  }
  if (!isPaymentMethod(b.paymentMethod)) {
    return Response.json({ error: "Método de pago inválido" }, { status: 400 });
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
  const o = await createPendingBookingAndCheckout({
    slug: b.slug,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    guests: b.guests,
    guestEmail: b.guestEmail,
    paymentMethod: b.paymentMethod,
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
