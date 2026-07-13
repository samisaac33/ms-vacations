import { getDb, hasDatabase } from "@/db/index";
import { bookings, properties, syncLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Stub hasta integrar Resend: registra aviso en sync_logs. */
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

  // TODO: Resend — enviar correo al administrador
  console.info("[notifyAdminPendingVerification]", message);
}
