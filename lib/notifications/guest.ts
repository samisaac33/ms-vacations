import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { bookings } from "@/db/schema";
import { loadBookingEmailContext } from "@/lib/email/booking-context";
import { logEmailEvent } from "@/lib/email/log";
import { sendEmail } from "@/lib/email/resend";
import {
  guestBookingConfirmedEmail,
  guestBookingVoucherEmail,
  guestDepositReceivedEmail,
} from "@/lib/email/templates";
import { generateBookingVoucherPdf } from "@/lib/pdf/booking-voucher";

async function sendGuestEmail(
  bookingId: string,
  build: (ctx: NonNullable<Awaited<ReturnType<typeof loadBookingEmailContext>>>) => {
    subject: string;
    text: string;
    html?: string;
  },
): Promise<boolean> {
  const ctx = await loadBookingEmailContext(bookingId);
  if (!ctx) {
    console.info("[guest-email] Sin contexto para bookingId=", bookingId);
    return false;
  }

  const { subject, text, html } = build(ctx);
  try {
    const result = await sendEmail({ to: ctx.guestEmail, subject, text, html });
    if (!result.ok) {
      await logEmailEvent(null, "error", `Correo huésped no enviado (${bookingId}): ${result.error}`);
      return false;
    }
    return true;
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    await logEmailEvent(null, "error", `Correo huésped falló (${bookingId}): ${err}`);
    return false;
  }
}

export async function notifyGuestBookingConfirmed(bookingId: string): Promise<boolean> {
  return sendGuestEmail(bookingId, guestBookingConfirmedEmail);
}

export async function notifyGuestDepositReceived(bookingId: string): Promise<boolean> {
  return sendGuestEmail(bookingId, guestDepositReceivedEmail);
}

export async function notifyGuestBookingVoucher(bookingId: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({ voucherSentAt: bookings.voucherSentAt })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!row || row.voucherSentAt) return false;

  const ctx = await loadBookingEmailContext(bookingId);
  if (!ctx) {
    console.info("[guest-voucher] Sin contexto para bookingId=", bookingId);
    return false;
  }

  const pdf = await generateBookingVoucherPdf(bookingId);
  if (!pdf.ok) {
    await logEmailEvent(null, "error", `PDF comprobante fallo (${bookingId}): ${pdf.reason}`);
    return false;
  }

  const { subject, text, html } = guestBookingVoucherEmail(ctx);
  try {
    const result = await sendEmail({
      to: ctx.guestEmail,
      subject,
      text,
      html,
      attachments: [{ filename: pdf.filename, content: pdf.buffer }],
    });
    if (!result.ok) {
      await logEmailEvent(null, "error", `Correo comprobante no enviado (${bookingId}): ${result.error}`);
      return false;
    }

    await db
      .update(bookings)
      .set({ voucherSentAt: new Date() })
      .where(eq(bookings.id, bookingId));

    return true;
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    await logEmailEvent(null, "error", `Correo comprobante fallo (${bookingId}): ${err}`);
    return false;
  }
}
