import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { bookings, properties, syncLogs } from "@/db/schema";
import { loadBookingEmailContext } from "@/lib/email/booking-context";
import { logEmailEvent } from "@/lib/email/log";
import { adminPendingVerificationEmail } from "@/lib/email/templates";
import { getAdminNotificationEmail, sendEmail } from "@/lib/email/resend";

export async function notifyAdminPendingVerification(bookingId: string): Promise<void> {
  if (!hasDatabase()) {
    console.info("[notifyAdminPendingVerification] bookingId=", bookingId);
    return;
  }

  const db = getDb();
  const [row] = await db
    .select({
      propertyId: bookings.propertyId,
      slug: properties.slug,
      guestEmail: bookings.guestEmail,
      paymentProofUrl: bookings.paymentProofUrl,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(eq(bookings.id, bookingId))
    .limit(1);

  const channel = row?.paymentProofUrl ? "comprobante subido" : "WhatsApp";
  const message = row
    ? `Verificar transferencia (${channel}): ${row.slug} · ${row.guestEmail ?? "sin correo"} · ${bookingId}`
    : `Verificar transferencia: ${bookingId}`;

  await db.insert(syncLogs).values({
    propertyId: row?.propertyId ?? null,
    level: "info",
    message,
  });

  const adminEmail = await getAdminNotificationEmail();
  if (!adminEmail) {
    console.info("[notifyAdminPendingVerification] Sin ADMIN_NOTIFICATION_EMAIL:", message);
    return;
  }

  const ctx = await loadBookingEmailContext(bookingId);
  if (!ctx) {
    console.info("[notifyAdminPendingVerification] Sin contexto de correo:", message);
    return;
  }

  const { subject, text, html } = adminPendingVerificationEmail(ctx, channel);
  try {
    const result = await sendEmail({ to: adminEmail, subject, text, html });
    if (!result.ok) {
      await logEmailEvent(
        row?.propertyId ?? null,
        "error",
        `Correo admin no enviado (${bookingId}): ${result.error}`,
      );
    }
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    await logEmailEvent(row?.propertyId ?? null, "error", `Correo admin falló (${bookingId}): ${err}`);
  }
}
