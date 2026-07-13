import { and, eq, gte, inArray, lte, ne } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { properties, propertyNightlyRates } from "@/db/schema";
import type { AvailabilityBlock } from "@/lib/availability-query";
import { getAvailabilityBySlug } from "@/lib/availability-query";
import type { DateRange } from "@/lib/availability-utils";
import { eachDayIsoInclusive, eachNightIso } from "@/lib/dates";
import { directPricePerNightCents } from "@/lib/pricing";

type Db = ReturnType<typeof getDb>;

export type PricingDay = {
  date: string;
  referenceCents: number;
  directCents: number;
  isOverride: boolean;
  blocked: boolean;
  blockSource?: "external" | "booking";
};

export type StayQuote = {
  nights: number;
  totalDirectCents: number;
  nightly: { date: string; referenceCents: number; directCents: number; isOverride: boolean }[];
};

function blockSourceForNight(night: string, blocks: AvailabilityBlock[]): "external" | "booking" | undefined {
  for (const b of blocks) {
    if (b.start <= night && b.end > night) return b.source;
  }
  return undefined;
}

export async function getPropertyById(propertyId: string) {
  const db = getDb();
  const [row] = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  return row ?? null;
}

export async function getOverridesMapForDates(
  propertyId: string,
  dates: string[],
  db: Db = getDb(),
): Promise<Map<string, number>> {
  if (dates.length === 0) return new Map();
  const rows = await db
    .select({
      date: propertyNightlyRates.date,
      referencePriceCents: propertyNightlyRates.referencePriceCents,
    })
    .from(propertyNightlyRates)
    .where(
      and(eq(propertyNightlyRates.propertyId, propertyId), inArray(propertyNightlyRates.date, dates)),
    );
  return new Map(rows.map((r) => [r.date, r.referencePriceCents]));
}

export function referenceCentsForNight(
  night: string,
  baseReferenceCents: number,
  overrides: Map<string, number>,
): { referenceCents: number; isOverride: boolean } {
  const override = overrides.get(night);
  if (override !== undefined) {
    return { referenceCents: override, isOverride: true };
  }
  return { referenceCents: baseReferenceCents, isOverride: false };
}

export async function calculateStayDirectTotalCents(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  db: Db = getDb(),
): Promise<number> {
  const quote = await getStayQuoteByPropertyId(propertyId, checkIn, checkOut, db);
  return quote.totalDirectCents;
}

export async function getStayQuoteByPropertyId(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  db: Db = getDb(),
): Promise<StayQuote> {
  const [prop] = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  if (!prop) throw new Error("Propiedad no encontrada");

  const nights = eachNightIso(checkIn, checkOut);
  const overrides = await getOverridesMapForDates(propertyId, nights, db);

  const nightly = nights.map((date) => {
    const { referenceCents, isOverride } = referenceCentsForNight(date, prop.basePricePerNightCents, overrides);
    return {
      date,
      referenceCents,
      directCents: directPricePerNightCents(referenceCents),
      isOverride,
    };
  });

  const totalDirectCents = nightly.reduce((sum, n) => sum + n.directCents, 0);
  return { nights: nightly.length, totalDirectCents, nightly };
}

export async function getStayQuoteBySlug(
  slug: string,
  checkIn: string,
  checkOut: string,
): Promise<StayQuote | null> {
  if (!hasDatabase()) return null;
  const db = getDb();
  const [prop] = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
  if (!prop) return null;
  return getStayQuoteByPropertyId(prop.id, checkIn, checkOut, db);
}

export async function getAdminPricingDays(
  propertyId: string,
  from: string,
  to: string,
): Promise<{ baseReferenceCents: number; days: PricingDay[] } | null> {
  if (!hasDatabase()) return null;
  const prop = await getPropertyById(propertyId);
  if (!prop) return null;

  const availability = await getAvailabilityBySlug(prop.slug);
  const blocks: AvailabilityBlock[] = availability?.blocks ?? [];

  const db = getDb();
  const overrideRows = await db
    .select({
      date: propertyNightlyRates.date,
      referencePriceCents: propertyNightlyRates.referencePriceCents,
    })
    .from(propertyNightlyRates)
    .where(
      and(
        eq(propertyNightlyRates.propertyId, propertyId),
        gte(propertyNightlyRates.date, from),
        lte(propertyNightlyRates.date, to),
      ),
    );
  const overrides = new Map(overrideRows.map((r) => [r.date, r.referencePriceCents]));

  const days: PricingDay[] = eachDayIsoInclusive(from, to).map((date) => {
    const { referenceCents, isOverride } = referenceCentsForNight(date, prop.basePricePerNightCents, overrides);
    const blockSource = blockSourceForNight(date, blocks);
    return {
      date,
      referenceCents,
      directCents: directPricePerNightCents(referenceCents),
      isOverride,
      blocked: blockSource !== undefined,
      blockSource,
    };
  });

  return { baseReferenceCents: prop.basePricePerNightCents, days };
}

export async function upsertNightlyRates(
  propertyId: string,
  dates: string[],
  referencePriceCents: number,
): Promise<void> {
  if (dates.length === 0) return;
  const db = getDb();
  for (const date of dates) {
    await db
      .insert(propertyNightlyRates)
      .values({ propertyId, date, referencePriceCents })
      .onConflictDoUpdate({
        target: [propertyNightlyRates.propertyId, propertyNightlyRates.date],
        set: { referencePriceCents },
      });
  }
}

export async function clearNightlyRatesForDates(propertyId: string, dates: string[]): Promise<void> {
  if (dates.length === 0) return;
  const db = getDb();
  await db
    .delete(propertyNightlyRates)
    .where(
      and(eq(propertyNightlyRates.propertyId, propertyId), inArray(propertyNightlyRates.date, dates)),
    );
}

export type MismatchedNightlyRateOverride = {
  propertyId: string;
  propertySlug: string;
  date: string;
  overrideUsd: number;
  baseUsd: number;
};

export function isMismatchedNightlyRateOverride(
  referencePriceCents: number,
  basePricePerNightCents: number,
): boolean {
  return referencePriceCents !== basePricePerNightCents;
}

export async function findMismatchedNightlyRateOverrides(
  slug?: string,
  db: Db = getDb(),
): Promise<MismatchedNightlyRateOverride[]> {
  const conditions = [
    ne(propertyNightlyRates.referencePriceCents, properties.basePricePerNightCents),
  ];
  if (slug) {
    conditions.push(eq(properties.slug, slug));
  }

  const rows = await db
    .select({
      propertyId: properties.id,
      propertySlug: properties.slug,
      date: propertyNightlyRates.date,
      referencePriceCents: propertyNightlyRates.referencePriceCents,
      basePricePerNightCents: properties.basePricePerNightCents,
    })
    .from(propertyNightlyRates)
    .innerJoin(properties, eq(propertyNightlyRates.propertyId, properties.id))
    .where(and(...conditions))
    .orderBy(properties.slug, propertyNightlyRates.date);

  return rows.map((row) => ({
    propertyId: row.propertyId,
    propertySlug: row.propertySlug,
    date: row.date,
    overrideUsd: row.referencePriceCents / 100,
    baseUsd: row.basePricePerNightCents / 100,
  }));
}

export async function clearMismatchedNightlyRateOverrides(
  options?: { slug?: string; dryRun?: boolean },
  db: Db = getDb(),
): Promise<MismatchedNightlyRateOverride[]> {
  const mismatched = await findMismatchedNightlyRateOverrides(options?.slug, db);
  if (mismatched.length === 0 || options?.dryRun) {
    return mismatched;
  }

  for (const row of mismatched) {
    await db
      .delete(propertyNightlyRates)
      .where(
        and(
          eq(propertyNightlyRates.propertyId, row.propertyId),
          eq(propertyNightlyRates.date, row.date),
        ),
      );
  }

  return mismatched;
}

export function blockedNightsInRange(
  dates: string[],
  blocks: AvailabilityBlock[],
): { date: string; source: "external" | "booking" }[] {
  const blocked: { date: string; source: "external" | "booking" }[] = [];
  for (const date of dates) {
    const source = blockSourceForNight(date, blocks);
    if (source) blocked.push({ date, source });
  }
  return blocked;
}

export function parseReferenceUsd(raw: string): number | null {
  const referencePriceUsd = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(referencePriceUsd) || referencePriceUsd < 1 || referencePriceUsd > 10_000) {
    return null;
  }
  return referencePriceUsd;
}
