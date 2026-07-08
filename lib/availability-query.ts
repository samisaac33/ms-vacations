import { and, eq, or, sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { bookings, externalBlocks, properties } from "@/db/schema";
import type { DateRange } from "@/lib/availability-utils";

export type AvailabilityBlock = DateRange & {
  source: "external" | "booking";
};

export type PropertyAvailability = {
  slug: string;
  lastIcalSyncAt: string | null;
  blocks: AvailabilityBlock[];
};

export async function getAvailabilityBySlug(slug: string): Promise<PropertyAvailability | null> {
  if (!hasDatabase()) return null;

  const db = getDb();
  const [prop] = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
  if (!prop) return null;

  const external = await db
    .select({
      start: externalBlocks.startDate,
      end: externalBlocks.endDate,
    })
    .from(externalBlocks)
    .where(eq(externalBlocks.propertyId, prop.id));

  const activeBookings = await db
    .select({
      start: bookings.checkIn,
      end: bookings.checkOut,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.propertyId, prop.id),
        or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "pending_verification"),
          and(eq(bookings.status, "pending_payment"), sql`${bookings.pendingExpiresAt} > now()`),
        ),
      ),
    );

  const blocks: AvailabilityBlock[] = [
    ...external.map((b) => ({
      start: b.start,
      end: b.end,
      source: "external" as const,
    })),
    ...activeBookings.map((b) => ({
      start: b.start,
      end: b.end,
      source: "booking" as const,
    })),
  ].sort((a, b) => a.start.localeCompare(b.start));

  return {
    slug,
    lastIcalSyncAt: prop.lastIcalSyncAt?.toISOString() ?? null,
    blocks,
  };
}
