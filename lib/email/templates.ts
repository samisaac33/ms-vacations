import { formatBookingDateRange } from "@/lib/booking-dates";
import type { BookingEmailContext } from "@/lib/email/booking-context";
import { buildAdminPendingVerificationHtml } from "@/lib/email/html/admin-pending-verification";
import { buildGuestBookingConfirmedHtml } from "@/lib/email/html/guest-booking-confirmed";
import { buildGuestBookingVoucherHtml } from "@/lib/email/html/guest-booking-voucher";
import { formatBalanceDueDate } from "@/lib/payment-schedule";
import type { PaymentMethod } from "@/lib/payments/types";
import { formatUsd } from "@/lib/pricing";
import { siteConfig } from "@/lib/site";

function centsToUsd(cents: number): string {
  return formatUsd(cents / 100);
}

function guestLabel(guests: number): string {
  return guests === 1 ? "1 huésped" : `${guests} huéspedes`;
}

function paymentMethodLabel(method: PaymentMethod): string {
  if (method === "bank_transfer") return "Transferencia bancaria";
  if (method === "paypal") return "PayPal";
  return "PayPhone";
}

function whatsappLine(): string {
  const wa = siteConfig.contact.whatsapp;
  if (!wa) return "";
  return `WhatsApp: +${wa.replace(/\D/g, "")}`;
}

function bookingSummaryLines(ctx: BookingEmailContext): string[] {
  const dates = formatBookingDateRange(ctx.checkIn, ctx.checkOut);
  return [
    `Alojamiento: ${ctx.propertyName}`,
    `Fechas: ${dates}`,
    `Huéspedes: ${guestLabel(ctx.guests)}`,
    `Total: $${centsToUsd(ctx.totalCents)} USD`,
    `Referencia: ${ctx.reference}`,
  ];
}

export function adminPendingVerificationEmail(
  ctx: BookingEmailContext,
  channel: "comprobante subido" | "WhatsApp",
): { subject: string; text: string; html: string } {
  const adminUrl = `${siteConfig.url}/admin/configuracion`;
  const lines = [
    "Nueva transferencia por verificar",
    "",
    ...bookingSummaryLines(ctx),
    `Correo huésped: ${ctx.guestEmail}`,
    `Canal: ${channel}`,
    `Método de pago: ${paymentMethodLabel(ctx.paymentMethod)}`,
  ];
  if (ctx.paymentProofUrl) {
    lines.push(`Comprobante: ${ctx.paymentProofUrl}`);
  }
  lines.push("", `Revisar en el panel: ${adminUrl}`);

  return {
    subject: `Transferencia pendiente — ${ctx.propertyName}`,
    text: lines.join("\n"),
    html: buildAdminPendingVerificationHtml(ctx, channel, adminUrl),
  };
}

export function guestBookingConfirmedEmail(ctx: BookingEmailContext): {
  subject: string;
  text: string;
  html: string;
} {
  const lines = [
    "Hola,",
    "",
    "Tu reserva en MS Vacations está confirmada.",
    "",
    ...bookingSummaryLines(ctx),
    `Método de pago: ${paymentMethodLabel(ctx.paymentMethod)}`,
    "",
    "La ubicación exacta y los detalles de acceso se coordinan antes del check-in.",
  ];
  if (ctx.googleMapsUrl) {
    lines.push(`Ubicación de referencia: ${ctx.googleMapsUrl}`);
  }
  const wa = whatsappLine();
  if (wa) lines.push(wa);
  lines.push("", "Gracias por reservar con MS Vacations.");

  return {
    subject: "Tu reserva en MS Vacations está confirmada",
    text: lines.join("\n"),
    html: buildGuestBookingConfirmedHtml(ctx),
  };
}

export function guestDepositReceivedEmail(ctx: BookingEmailContext): { subject: string; text: string } {
  const depositUsd = ctx.depositCents != null ? centsToUsd(ctx.depositCents) : "—";
  const balanceUsd = ctx.balanceCents != null ? centsToUsd(ctx.balanceCents) : "—";
  const dueLabel = ctx.balanceDueAt ? formatBalanceDueDate(ctx.balanceDueAt) : "antes del check-in";

  const lines = [
    "Hola,",
    "",
    "Recibimos el anticipo de tu reserva en MS Vacations.",
    "",
    ...bookingSummaryLines(ctx),
    `Anticipo pagado: $${depositUsd} USD`,
    `Saldo pendiente: $${balanceUsd} USD`,
    `Fecha límite del saldo: ${dueLabel}`,
    `Método de pago: ${paymentMethodLabel(ctx.paymentMethod)}`,
    "",
    "Te enviaremos la confirmación final cuando se liquide el saldo restante.",
  ];
  const wa = whatsappLine();
  if (wa) lines.push(wa);
  lines.push("", "Gracias por reservar con MS Vacations.");

  return {
    subject: "Anticipo recibido — saldo pendiente",
    text: lines.join("\n"),
  };
}

export function guestBookingVoucherEmail(ctx: BookingEmailContext): {
  subject: string;
  text: string;
  html: string;
} {
  const lines = [
    "Hola,",
    "",
    "Adjuntamos tu comprobante de reserva en PDF.",
    "",
    ...bookingSummaryLines(ctx),
    "",
    "Conserva este documento para tu referencia y facturación.",
    "La ubicación exacta y los detalles de acceso se coordinan antes del check-in.",
  ];
  const wa = whatsappLine();
  if (wa) lines.push(wa);
  lines.push("", "Gracias por reservar con MS Vacations.");

  return {
    subject: `Tu comprobante de reserva — ${ctx.propertyName}`,
    text: lines.join("\n"),
    html: buildGuestBookingVoucherHtml(ctx),
  };
}
