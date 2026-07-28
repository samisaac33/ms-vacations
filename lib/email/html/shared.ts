import { siteConfig } from "@/lib/site";
import type { PaymentMethod } from "@/lib/payments/types";

export const COLORS = {
  ocean: "#009dad",
  oceanDark: "#008a99",
  sand: "#faf8f4",
  ink: "#1a2b2b",
  muted: "#5c6b6b",
  border: "#efe6d8",
  white: "#ffffff",
  amber: "#b45309",
  amberLight: "#fffbeb",
} as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function guestLabel(guests: number): string {
  return guests === 1 ? "1 huésped" : `${guests} huéspedes`;
}

export function paymentMethodLabel(method: PaymentMethod): string {
  if (method === "bank_transfer") return "Transferencia bancaria";
  if (method === "paypal") return "PayPal";
  return "PayPhone";
}

export function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:12px 0;border-top:1px solid ${COLORS.border};vertical-align:top;">
        <p style="margin:0;font-size:13px;color:${COLORS.muted};">${escapeHtml(label)}</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:${COLORS.ink};">${escapeHtml(value)}</p>
      </td>
    </tr>`;
}

export function button(href: string, label: string, primary = true): string {
  const bg = primary ? COLORS.ocean : COLORS.white;
  const color = primary ? COLORS.white : COLORS.ocean;
  const border = primary ? "none" : `1px solid ${COLORS.ocean}`;
  return `
    <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;background:${bg};color:${color};text-decoration:none;font-size:15px;font-weight:600;border-radius:8px;border:${border};">
      ${escapeHtml(label)}
    </a>`;
}

export function heroBlock(imageUrl: string, alt: string): string {
  return `
      <tr>
        <td style="padding:0;">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
        </td>
      </tr>`;
}

export type EmailShellOptions = {
  pageTitle: string;
  heroImageUrl?: string;
  heroAlt?: string;
  bodyHtml: string;
  footerText: string;
};

export function emailShell({
  pageTitle,
  heroImageUrl,
  heroAlt = "",
  bodyHtml,
  footerText,
}: EmailShellOptions): string {
  const hero = heroImageUrl ? heroBlock(heroImageUrl, heroAlt) : "";
  const siteHost = siteConfig.url.replace(/^https?:\/\//, "");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pageTitle)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.sand};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.sand};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${COLORS.white};border-radius:16px;overflow:hidden;border:1px solid ${COLORS.border};">
          <tr>
            <td style="background:${COLORS.ocean};padding:20px 28px;text-align:center;">
              <p style="margin:0;font-size:20px;font-weight:700;color:${COLORS.white};letter-spacing:0.02em;">MS Vacations</p>
            </td>
          </tr>
          ${hero}
          ${bodyHtml}
          <tr>
            <td style="padding:24px 28px;background:${COLORS.sand};border-top:1px solid ${COLORS.border};text-align:center;">
              <p style="margin:0 0 8px;font-size:14px;color:${COLORS.muted};">${escapeHtml(footerText)}</p>
              <a href="${escapeHtml(siteConfig.url)}" style="font-size:13px;color:${COLORS.ocean};text-decoration:none;">${escapeHtml(siteHost)}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
