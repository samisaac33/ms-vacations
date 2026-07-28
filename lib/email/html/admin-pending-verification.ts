import { formatBookingDateRange } from "@/lib/booking-dates";
import type { BookingEmailContext } from "@/lib/email/booking-context";
import {
  button,
  COLORS,
  detailRow,
  emailShell,
  escapeHtml,
  guestLabel,
  paymentMethodLabel,
} from "@/lib/email/html/shared";
import { formatUsd } from "@/lib/pricing";

type AdminChannel = "comprobante subido" | "WhatsApp";

function channelLabel(channel: AdminChannel): string {
  return channel === "comprobante subido" ? "Comprobante subido" : "Inicio por WhatsApp";
}

export function buildAdminPendingVerificationHtml(
  ctx: BookingEmailContext,
  channel: AdminChannel,
  adminUrl: string,
): string {
  const dates = formatBookingDateRange(ctx.checkIn, ctx.checkOut);
  const totalUsd = formatUsd(ctx.totalCents / 100);

  const proofButton = ctx.paymentProofUrl
    ? `
      <p style="margin:12px 0 0;text-align:center;">
        ${button(ctx.paymentProofUrl, "Ver comprobante", false)}
      </p>`
    : "";

  const bodyHtml = `
          <tr>
            <td style="padding:32px 28px 8px;">
              <p style="margin:0 0 8px;font-size:14px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:0.06em;">Acción requerida</p>
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${COLORS.ink};line-height:1.3;">Nueva transferencia por verificar</h1>
              <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:${COLORS.ocean};">${escapeHtml(ctx.propertyName)}</p>
              <p style="margin:0;display:inline-block;padding:6px 12px;background:${COLORS.amberLight};border-radius:999px;font-size:13px;font-weight:600;color:${COLORS.amber};">
                ${escapeHtml(channelLabel(channel))}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${detailRow("Fechas", dates)}
                ${detailRow("Huéspedes", guestLabel(ctx.guests))}
                ${detailRow("Referencia", ctx.reference)}
                ${detailRow("Total", `$${totalUsd} USD`)}
                ${detailRow("Correo del huésped", ctx.guestEmail)}
                ${detailRow("Método de pago", paymentMethodLabel(ctx.paymentMethod))}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <p style="margin:0;padding:16px;background:${COLORS.sand};border-radius:12px;font-size:14px;line-height:1.6;color:${COLORS.muted};">
                Revisa la transferencia y confirma o rechaza la reserva en el panel.
              </p>
              <p style="margin:24px 0 0;text-align:center;">
                ${button(adminUrl, "Revisar transferencias")}
              </p>
              ${proofButton}
            </td>
          </tr>`;

  return emailShell({
    pageTitle: "Transferencia pendiente",
    heroImageUrl: ctx.propertyImageUrl,
    heroAlt: ctx.propertyName,
    bodyHtml,
    footerText: "MS Vacations — Panel de administración",
  });
}
