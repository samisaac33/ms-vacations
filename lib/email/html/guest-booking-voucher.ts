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
import { siteConfig } from "@/lib/site";

export function buildGuestBookingVoucherHtml(ctx: BookingEmailContext): string {
  const dates = formatBookingDateRange(ctx.checkIn, ctx.checkOut);
  const totalUsd = formatUsd(ctx.totalCents / 100);
  const wa = siteConfig.contact.whatsapp?.replace(/\D/g, "");
  const waLink = wa ? `https://wa.me/${wa}` : null;

  const mapLink = ctx.googleMapsUrl
    ? `
      <p style="margin:16px 0 0;text-align:center;">
        <a href="${escapeHtml(ctx.googleMapsUrl)}" style="color:${COLORS.ocean};font-size:14px;font-weight:600;text-decoration:underline;">
          Abrir ubicación en mapa
        </a>
      </p>`
    : "";

  const whatsappBlock = waLink
    ? `
      <p style="margin:24px 0 0;font-size:14px;color:${COLORS.muted};text-align:center;">
        ¿Necesitas ayuda?
        <a href="${waLink}" style="color:${COLORS.ocean};font-weight:600;text-decoration:none;">Escríbenos por WhatsApp</a>
      </p>`
    : "";

  const bodyHtml = `
          <tr>
            <td style="padding:32px 28px 8px;">
              <p style="margin:0 0 8px;font-size:14px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:0.06em;">Comprobante</p>
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${COLORS.ink};line-height:1.3;">Tu comprobante de reserva</h1>
              <p style="margin:0;font-size:18px;font-weight:600;color:${COLORS.ocean};">${escapeHtml(ctx.propertyName)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${detailRow("Fechas", dates)}
                ${detailRow("Huéspedes", guestLabel(ctx.guests))}
                ${detailRow("Referencia", ctx.reference)}
                ${detailRow("Total", `$${totalUsd} USD`)}
                ${detailRow("Método de pago", paymentMethodLabel(ctx.paymentMethod))}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <p style="margin:0;padding:16px;background:${COLORS.sand};border-radius:12px;font-size:14px;line-height:1.6;color:${COLORS.muted};">
                Adjuntamos el comprobante en PDF. Consérvalo para tu referencia y facturación.
                La ubicación exacta y los detalles de acceso se coordinan antes del check-in.
              </p>
              <p style="margin:24px 0 0;text-align:center;">
                ${button(ctx.propertyPageUrl, "Ver alojamiento")}
              </p>
              ${mapLink}
              ${whatsappBlock}
            </td>
          </tr>`;

  return emailShell({
    pageTitle: "Tu comprobante de reserva",
    heroImageUrl: ctx.propertyImageUrl,
    heroAlt: ctx.propertyName,
    bodyHtml,
    footerText: "Gracias por reservar con MS Vacations.",
  });
}
