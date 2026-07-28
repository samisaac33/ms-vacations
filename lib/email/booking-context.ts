import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { bookings, properties } from "@/db/schema";
import { formatBookingReference } from "@/lib/payments/bank-transfer";
import type { PaymentMethod } from "@/lib/payments/types";
import type { PaymentTiming } from "@/lib/payment-schedule";
import { getPropertyBySlug } from "@/lib/properties";
import { siteConfig } from "@/lib/site";

export type BookingEmailContext = {
  bookingId: string;
  reference: string;
  propertySlug: string;
  propertyName: string;
  propertyImageUrl: string | undefined;
  propertyPageUrl: string;
  googleMapsUrl: string | undefined;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestEmail: string;
  totalCents: number;
  depositCents: number | null;
  balanceCents: number | null;
  balanceDueAt: string | null;
  paymentMethod: PaymentMethod;
  paymentTiming: PaymentTiming;
  paymentProofUrl: string | null;
};

export async function loadBookingEmailContext(
  bookingId: string,
): Promise<BookingEmailContext | null> {
  if (!hasDatabase()) return null;

  const db = getDb();
  const [row] = await db
    .select({
      propertySlug: properties.slug,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      guests: bookings.guests,
      guestEmail: bookings.guestEmail,
      totalCents: bookings.totalCents,
      depositCents: bookings.depositCents,
      balanceCents: bookings.balanceCents,
      balanceDueAt: bookings.balanceDueAt,
      paymentMethod: bookings.paymentMethod,
      paymentTiming: bookings.paymentTiming,
      paymentProofUrl: bookings.paymentProofUrl,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!row?.guestEmail) return null;

  const catalog = getPropertyBySlug(row.propertySlug);
  return {
    bookingId,
    reference: formatBookingReference(bookingId),
    propertySlug: row.propertySlug,
    propertyName: catalog?.name ?? row.propertySlug,
    propertyImageUrl: catalog?.images[0]?.src,
    propertyPageUrl: `${siteConfig.url}/propiedades/${row.propertySlug}`,
    googleMapsUrl: catalog?.location.googleMapsUrl,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    guests: row.guests,
    guestEmail: row.guestEmail,
    totalCents: row.totalCents,
    depositCents: row.depositCents,
    balanceCents: row.balanceCents,
    balanceDueAt: row.balanceDueAt,
    paymentMethod: row.paymentMethod,
    paymentTiming: row.paymentTiming,
    paymentProofUrl: row.paymentProofUrl,
  };
}
