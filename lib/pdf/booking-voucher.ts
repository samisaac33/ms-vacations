import { formatUsd } from "@/lib/pricing";
import { getHeaderLogoJpeg, getWatermarkLogoJpeg } from "@/lib/pdf/logo-mark-image";
import { MinimalPdfDocument, PAGE_HEIGHT, PAGE_WIDTH } from "@/lib/pdf/minimal-pdf";
import {
  loadBookingVoucherContext,
  voucherBillingIdLabel,
  voucherDateRangeLabel,
  voucherSiteHost,
  type BookingVoucherContext,
} from "@/lib/pdf/voucher-context";
import { VOUCHER_COLORS } from "@/lib/pdf/voucher-theme";

const C = VOUCHER_COLORS;

const ROW_HEIGHT = 22;
const RULE_OFFSET = 8;
const GAP_BEFORE_TOTAL = 14;
const TOTAL_BAND_HEIGHT = 28;

function centsToUsd(cents: number): string {
  return formatUsd(cents / 100);
}

function formatVoucherDateRange(ctx: BookingVoucherContext): string {
  const range = voucherDateRangeLabel(ctx);
  const nightsLabel = `${ctx.nights} ${ctx.nights === 1 ? "noche" : "noches"}`;
  return `Del ${range} (${nightsLabel})`;
}

function addInfoBadge(
  doc: MinimalPdfDocument,
  x: number,
  y: number,
  label: string,
  value: string,
  width: number,
): void {
  doc.addStrokedRect(x, y, width, 52, C.border, 0.75, C.white);
  doc.addFilledRect(x + 10, y + 14, 24, 24, C.ocean);
  doc.addText(label.toUpperCase(), x + 42, y + 38, 7, true, C.muted);
  doc.addWrappedText(value, x + 42, y + 24, 28, 9, 11, C.ink);
}

async function renderVoucherPdf(ctx: BookingVoucherContext): Promise<Buffer> {
  const doc = new MinimalPdfDocument();
  const margin = 40;
  const right = PAGE_WIDTH - margin;
  const contentWidth = right - margin;

  const [headerLogo, watermarkLogo] = await Promise.all([
    getHeaderLogoJpeg(104),
    getWatermarkLogoJpeg(140),
  ]);

  doc.addImage(
    watermarkLogo.buffer,
    right - 130,
    margin - 10,
    120,
    120,
    watermarkLogo.width,
    watermarkLogo.height,
    "background",
  );

  const logoSize = 52;
  const headerTop = PAGE_HEIGHT - margin;
  const logoY = headerTop - logoSize;
  doc.addImage(
    headerLogo.buffer,
    margin,
    logoY,
    logoSize,
    logoSize,
    headerLogo.width,
    headerLogo.height,
    "foreground",
  );

  const brandX = margin + logoSize + 12;
  doc.addText("MS VACATIONS", brandX, headerTop - 14, 13, true, C.ink);
  doc.addText("Home & Apartments for Rent", brandX, headerTop - 28, 8, false, C.muted);

  const clientX = margin + 175;
  doc.addText(ctx.billingName, clientX, headerTop - 14, 10, true, C.ink);
  doc.addText(voucherBillingIdLabel(ctx), clientX, headerTop - 28, 9, false, C.muted);
  doc.addText(ctx.guestEmail, clientX, headerTop - 40, 9, false, C.muted);
  doc.addText(ctx.billingCity, clientX, headerTop - 52, 9, false, C.muted);

  const boxW = 118;
  const boxH = 34;
  const box1X = right - boxW;
  const box2X = right - boxW;
  doc.addStrokedRect(box1X, headerTop - boxH, boxW, boxH, C.ocean, 1, C.white);
  doc.addText("COMPROBANTE N.", box1X + 8, headerTop - 12, 7, true, C.ocean);
  doc.addText(ctx.reference, box1X + 8, headerTop - 24, 10, true, C.ink);

  doc.addStrokedRect(box2X, headerTop - boxH - 40, boxW, boxH, C.ocean, 1, C.white);
  doc.addText("FECHA DE EMISIÓN", box2X + 8, headerTop - 52, 7, true, C.ocean);
  doc.addText(ctx.issueDate, box2X + 8, headerTop - 64, 9, false, C.ink);

  let y = headerTop - 88;
  doc.addHorizontalRule(margin, y, right, C.border, 0.75);
  y -= 28;

  doc.addText("COMPROBANTE DE RESERVA", margin, y, 15, true, C.ocean);
  y -= 20;
  y = doc.addWrappedText(
    "Gracias por confiar en MS Vacations. A continuación, el detalle de su reserva.",
    margin,
    y,
    92,
    10,
    13,
    C.muted,
  );
  y -= 18;

  const cardW = (contentWidth - 12) / 2;
  const cardY = y - 52;
  addInfoBadge(doc, margin, cardY, "Fechas de reserva", formatVoucherDateRange(ctx), cardW);
  addInfoBadge(
    doc,
    margin + cardW + 12,
    cardY,
    "Detalle de la reserva",
    `${ctx.propertyName}. ${ctx.stayDetailLine}`,
    cardW,
  );
  y = cardY - 22;

  const tableHeaderY = y - 18;
  doc.addFilledRect(margin, tableHeaderY, contentWidth, 22, C.ocean);
  doc.addText("CONCEPTO", margin + 10, tableHeaderY + 15, 9, true, C.white);
  doc.addText("VALOR (USD)", right - 72, tableHeaderY + 15, 9, true, C.white);

  const rows: { label: string; cents: number }[] = [
    {
      label: `Estancia (${ctx.nights} ${ctx.nights === 1 ? "noche" : "noches"})`,
      cents: ctx.lodgingCents,
    },
  ];
  if (ctx.guaranteeCents > 0) {
    rows.push({ label: "Garantía reembolsable", cents: ctx.guaranteeCents });
  }
  if (ctx.cleaningFeeCents > 0) {
    rows.push({ label: "Limpieza final", cents: ctx.cleaningFeeCents });
  }

  y = tableHeaderY - 8;
  for (const row of rows) {
    y -= ROW_HEIGHT;
    doc.addText(row.label, margin + 10, y, 9, false, C.ink);
    doc.addText(`$${centsToUsd(row.cents)}`, right - 72, y, 9, false, C.ink);
    doc.addHorizontalRule(margin, y - RULE_OFFSET, right, C.border, 0.35);
  }

  const totalBandY = y - RULE_OFFSET - GAP_BEFORE_TOTAL - TOTAL_BAND_HEIGHT;
  doc.addFilledRect(margin, totalBandY, contentWidth, TOTAL_BAND_HEIGHT, C.rowGrey);
  doc.addText("TOTAL", margin + 10, totalBandY + 10, 11, true, C.ink);
  doc.addText(`$${centsToUsd(ctx.totalCents)}`, right - 72, totalBandY + 10, 11, true, C.ink);
  y = totalBandY - 12;

  if (ctx.depositCents != null && ctx.balanceCents != null) {
    const payCardW = (contentWidth - 12) / 2;
    const payY = y - 48;
    doc.addStrokedRect(margin, payY, payCardW, 48, C.border, 0.75, C.sand);
    doc.addFilledRect(margin + 10, payY + 14, 24, 24, C.ocean);
    doc.addText("$", margin + 18, payY + 30, 12, true, C.white);
    doc.addText("ABONO REALIZADO", margin + 42, payY + 36, 7, true, C.muted);
    doc.addText(`$${centsToUsd(ctx.depositCents)}`, margin + 42, payY + 22, 11, true, C.ink);
    doc.addText("(Pagado)", margin + 42, payY + 10, 8, false, C.muted);

    doc.addStrokedRect(margin + payCardW + 12, payY, payCardW, 48, C.border, 0.75, C.sand);
    doc.addFilledRect(margin + payCardW + 22, payY + 14, 24, 24, C.ocean);
    doc.addText("$", margin + payCardW + 30, payY + 30, 12, true, C.white);
    doc.addText("SALDO PENDIENTE", margin + payCardW + 54, payY + 36, 7, true, C.muted);
    doc.addText(`$${centsToUsd(ctx.balanceCents)}`, margin + payCardW + 54, payY + 22, 11, true, C.ink);
    doc.addText("(Pendiente de pago)", margin + payCardW + 54, payY + 10, 8, false, C.muted);
    y = payY - 18;
  }

  doc.addText("POLÍTICAS IMPORTANTES", margin, y, 10, true, C.ocean);
  y -= 16;
  const policies = [
    ...(ctx.guaranteeCents > 0
      ? ["Garantía reembolsable USD 300: devolución 24-48 h tras inspección post check-out."]
      : []),
    "Check-in 15:00 · Check-out 12:00.",
    "Prohibidas fiestas, eventos o huéspedes adicionales no registrados.",
    "Aplica política de cancelaciones y reglas de la casa publicadas en el sitio.",
  ];
  for (const policy of policies) {
    y = doc.addWrappedText(`- ${policy}`, margin, y, 95, 8.5, 11, C.muted);
    y -= 2;
  }

  y -= 8;
  doc.addHorizontalRule(margin, y, right, C.border, 0.5);
  y -= 16;
  doc.addWrappedText(
    "Gracias por elegirnos. Esperamos que disfrute de una excelente estadía.",
    margin,
    y,
    90,
    9,
    12,
    C.ink,
    true,
  );
  doc.addText(`www.${voucherSiteHost()}`, margin, margin + 22, 9, false, C.ocean);
  doc.addText("@msvacations", margin, margin + 10, 9, false, C.muted);

  return doc.toBuffer();
}

export async function generateBookingVoucherPdf(
  bookingId: string,
): Promise<{ ok: true; buffer: Buffer; filename: string } | { ok: false; reason: string }> {
  const ctx = await loadBookingVoucherContext(bookingId);
  if (!ctx) {
    return { ok: false, reason: "Datos insuficientes para generar el comprobante." };
  }

  const buffer = await renderVoucherPdf(ctx);
  return {
    ok: true,
    buffer,
    filename: `Comprobante-${ctx.reference}.pdf`,
  };
}

export { renderVoucherPdf };
