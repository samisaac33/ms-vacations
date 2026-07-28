import { desc, eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { bookings, properties } from "@/db/schema";
import type {
  BankTransferBooking,
  BankTransferBookingStatus,
  PendingVerificationBooking,
} from "@/lib/admin-payments-types";
import { getPropertyBySlug } from "@/lib/properties";

export type {
  BankTransferBooking,
  BankTransferBookingStatus,
  PendingVerificationBooking,
} from "@/lib/admin-payments-types";

export { BANK_TRANSFER_STATUS_LABELS } from "@/lib/admin-payments-types";

const HISTORY_DEFAULT_LIMIT = 100;

function mapBankTransferRow(
  row: {
    id: string;
    slug: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    guestEmail: string | null;
    totalCents: number;
    depositCents: number | null;
    status: BankTransferBookingStatus;
    paymentTiming: "full_now" | "split";
    paymentProofUrl: string | null;
    paymentProofUploadedAt: Date | null;
    createdAt: Date;
  },
): BankTransferBooking {
  return {
    ...row,
    propertyName: getPropertyBySlug(row.slug)?.name ?? row.slug,
    paymentProofUploadedAt: row.paymentProofUploadedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

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
      depositCents: bookings.depositCents,
      paymentTiming: bookings.paymentTiming,
      paymentProofUrl: bookings.paymentProofUrl,
      paymentProofUploadedAt: bookings.paymentProofUploadedAt,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(eq(bookings.status, "pending_verification"))
    .orderBy(desc(bookings.createdAt));

  return rows.map((row) => {
    const mapped = mapBankTransferRow({
      ...row,
      status: "pending_verification",
    });
    const { status: _status, ...pending } = mapped;
    return pending;
  });
}

export async function getBankTransferHistory(options?: {
  limit?: number;
}): Promise<BankTransferBooking[]> {
  if (!hasDatabase()) return [];
  const limit = options?.limit ?? HISTORY_DEFAULT_LIMIT;
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
      depositCents: bookings.depositCents,
      status: bookings.status,
      paymentTiming: bookings.paymentTiming,
      paymentProofUrl: bookings.paymentProofUrl,
      paymentProofUploadedAt: bookings.paymentProofUploadedAt,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(eq(bookings.paymentMethod, "bank_transfer"))
    .orderBy(desc(bookings.createdAt))
    .limit(limit);

  return rows.map((row) =>
    mapBankTransferRow({
      ...row,
      status: row.status as BankTransferBookingStatus,
    }),
  );
}
