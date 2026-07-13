import { confirmBookingAfterPayment } from "@/lib/booking-service";
import { capturePayPalOrder } from "@/lib/payments/paypal";
import { confirmPayPhonePayment } from "@/lib/payments/payphone";
import { hasDatabase } from "@/db/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  let body: {
    bookingId?: string;
    provider?: string;
    orderId?: string;
    payphoneId?: string | number;
    clientTransactionId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { bookingId, provider, orderId } = body;
  if (!bookingId || !provider) {
    return Response.json({ error: "Datos incompletos" }, { status: 400 });
  }

  if (provider === "paypal") {
    if (!orderId) {
      return Response.json({ error: "Falta orderId de PayPal" }, { status: 400 });
    }
    const captured = await capturePayPalOrder(orderId);
    if (!captured.captured) {
      return Response.json({ error: "Pago PayPal no completado" }, { status: 402 });
    }
    const result = await confirmBookingAfterPayment({
      bookingId,
      externalId: orderId,
      amountCents: captured.amountCents,
    });
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 409 });
    }
    return Response.json({ ok: true });
  }

  if (provider === "payphone") {
    const payphoneId = body.payphoneId != null ? Number(body.payphoneId) : NaN;
    if (!Number.isFinite(payphoneId) || payphoneId <= 0) {
      return Response.json({ error: "Falta id de transacción PayPhone" }, { status: 400 });
    }
    const status = await confirmPayPhonePayment({
      payphoneId,
      clientTransactionId: body.clientTransactionId ?? bookingId,
    });
    if (!status.approved) {
      return Response.json({ error: "Pago PayPhone no aprobado" }, { status: 402 });
    }
    const result = await confirmBookingAfterPayment({
      bookingId,
      externalId: status.transactionId,
      amountCents: status.amountCents,
    });
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 409 });
    }
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Proveedor desconocido" }, { status: 400 });
}
