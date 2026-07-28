import { getBillingStatus, submitBookingBilling } from "@/lib/booking-billing-service";
import { validateBillingInput } from "@/lib/billing-validation";
import { getBookingForGuest } from "@/lib/booking-service";
import { hasDatabase } from "@/db/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  const { id: bookingId } = await context.params;
  const booking = await getBookingForGuest(bookingId);
  if (!booking) {
    return Response.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const status = await getBillingStatus(bookingId);
  if (!status) {
    return Response.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  return Response.json(status);
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  const { id: bookingId } = await context.params;
  const booking = await getBookingForGuest(bookingId);
  if (!booking) {
    return Response.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON invalido" }, { status: 400 });
  }

  const validated = validateBillingInput(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const result = await submitBookingBilling(bookingId, validated.data);
  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: 409 });
  }

  return Response.json({
    ok: true,
    voucherSent: result.voucherSent,
    voucherPending: result.voucherPending,
  });
}
