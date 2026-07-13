import { and, eq, inArray } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { bookings, externalBlocks, properties } from "@/db/schema";
import { activeBookingStatus } from "@/lib/availability";
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

  // #region agent log
  fetch('http://127.0.0.1:7301/ingest/b7c4f0e2-1c6e-4803-8834-979f15ef881f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'729085'},body:JSON.stringify({sessionId:'729085',location:'availability-query.ts:beforeBookings',message:'external blocks loaded, querying active bookings',data:{slug,propertyId:prop.id,externalCount:external.length},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

  const activeBookings = await db
    .select({
      start: bookings.checkIn,
      end: bookings.checkOut,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.propertyId, prop.id),
        activeBookingStatus,
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

/** Bloqueos por slug (iCal + reservas activas) para varias propiedades en una consulta. */
export async function getBlocksByPropertySlugs(
  slugs: string[],
): Promise<Map<string, DateRange[]>> {
  const result = new Map<string, DateRange[]>();
  if (!hasDatabase() || slugs.length === 0) return result;

  const db = getDb();
  const rows = await db
    .select({ id: properties.id, slug: properties.slug })
    .from(properties)
    .where(inArray(properties.slug, slugs));

  if (rows.length === 0) return result;

  const idToSlug = new Map(rows.map((row) => [row.id, row.slug]));
  const propertyIds = rows.map((row) => row.id);

  for (const slug of slugs) {
    result.set(slug, []);
  }

  const external = await db
    .select({
      propertyId: externalBlocks.propertyId,
      start: externalBlocks.startDate,
      end: externalBlocks.endDate,
    })
    .from(externalBlocks)
    .where(inArray(externalBlocks.propertyId, propertyIds));

  for (const block of external) {
    const slug = idToSlug.get(block.propertyId);
    if (!slug) continue;
    result.get(slug)!.push({ start: block.start, end: block.end });
  }

  const activeBookings = await db
    .select({
      propertyId: bookings.propertyId,
      start: bookings.checkIn,
      end: bookings.checkOut,
    })
    .from(bookings)
    .where(
      and(
        inArray(bookings.propertyId, propertyIds),
        activeBookingStatus,
      ),
    );

  for (const block of activeBookings) {
    const slug = idToSlug.get(block.propertyId);
    if (!slug) continue;
    result.get(slug)!.push({ start: block.start, end: block.end });
  }

  return result;
}

