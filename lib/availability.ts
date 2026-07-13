import { and, eq, gt, isNull, lt, or, sql } from "drizzle-orm";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";
import { bookings, externalBlocks } from "@/db/schema";

type Tx = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export const activeBookingStatus = or(
  eq(bookings.status, "confirmed"),
  eq(bookings.status, "pending_balance"),
  and(
    eq(bookings.status, "pending_verification"),
    or(isNull(bookings.pendingExpiresAt), sql`${bookings.pendingExpiresAt} > now()`),
  ),
  and(eq(bookings.status, "pending_payment"), sql`${bookings.pendingExpiresAt} > now()`),
);

export async function expireStalePendingBookings(tx: Tx): Promise<void> {
  await tx
    .update(bookings)
    .set({ status: "expired" })
    .where(
      or(
        and(eq(bookings.status, "pending_payment"), sql`${bookings.pendingExpiresAt} < now()`),
        and(eq(bookings.status, "pending_verification"), sql`${bookings.pendingExpiresAt} < now()`),
      ),
    );
}

async function hasExternalBlockOverlap(
  tx: Tx,
  propertyId: string,
  checkIn: string,
  checkOut: string,
): Promise<boolean> {
  const row = await tx
    .select({ id: externalBlocks.id })
    .from(externalBlocks)
    .where(
      and(
        eq(externalBlocks.propertyId, propertyId),
        lt(externalBlocks.startDate, checkOut),
        gt(externalBlocks.endDate, checkIn),
      ),
    )
    .limit(1);
  return row.length > 0;
}

async function hasBookingOverlap(
  tx: Tx,
  propertyId: string,
  checkIn: string,
  checkOut: string,
): Promise<boolean> {
  const row = await tx
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.propertyId, propertyId),
        activeBookingStatus,
        lt(bookings.checkIn, checkOut),
        gt(bookings.checkOut, checkIn),
      ),
    )
    .limit(1);
  return row.length > 0;
}

export async function assertRangeAvailable(
  tx: Tx,
  propertyId: string,
  checkIn: string,
  checkOut: string,
): Promise<void> {
  if (await hasExternalBlockOverlap(tx, propertyId, checkIn, checkOut)) {
    throw new AvailabilityError("Las fechas coinciden con un bloqueo externo (Airbnb u otro canal).");
  }
  if (await hasBookingOverlap(tx, propertyId, checkIn, checkOut)) {
    throw new AvailabilityError("Las fechas ya están reservadas o pendientes de pago.");
  }
}

export class AvailabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AvailabilityError";
  }
}

