import { desc, eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { bookings, properties } from "@/db/schema";

export type PendingVerificationBooking = {
  id: string;
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestEmail: string | null;
  totalCents: number;
  paymentProofUrl: string | null;
  paymentProofUploadedAt: string | null;
  createdAt: string;
};

export async function getPendingVerificationBookings(): Promise<PendingVerificationBooking[]> {
  if (!hasDatabase()) return [];
  const db = getDb();
  const rows = await db
    .select({
      id: bookings.id,
      slug: properties.slug,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      guests: bookings.guests,
      guestEmail: bookings.guestEmail,
      totalCents: bookings.totalCents,
      paymentProofUrl: bookings.paymentProofUrl,
      paymentProofUploadedAt: bookings.paymentProofUploadedAt,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(eq(bookings.status, "pending_verification"))
    .orderBy(desc(bookings.createdAt));

  return rows.map((row) => ({
    ...row,
    paymentProofUploadedAt: row.paymentProofUploadedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}
