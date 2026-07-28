import { and, eq, gte, inArray, lte, ne } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { properties, propertyNightlyRates } from "@/db/schema";
import type { AvailabilityBlock } from "@/lib/availability-query";
import { getAvailabilityBySlug } from "@/lib/availability-query";
import type { DateRange } from "@/lib/availability-utils";
import { eachDayIsoInclusive, eachNightIso, nightsBetween } from "@/lib/dates";
import type { VatPeriod } from "@/lib/legal/hospitality-vat";
import { directCentsForNight, isPromotionalVatDate } from "@/lib/legal/hospitality-vat";
import { applyNewYearsEveGuestDirectCents } from "@/lib/new-years-eve-pricing";
import {
  catalogReferencePriceUsd,
  guestDirectPriceUsd,
  cleaningFeeCents,
  guestDirectCentsFromReference,
} from "@/lib/property-pricing";
import { loadPromotionalVatPeriods } from "@/lib/vat-periods-query";
import { ensurePropertyRowBySlug } from "@/lib/property-db";

type Db = ReturnType<typeof getDb>;

export type PricingDay = {
  date: string;
  referenceCents: number;
  directCents: number;
  isOverride: boolean;
  blocked: boolean;
  blockSource?: "external" | "booking";
};

export type StayQuoteNightly = {
  date: string;
  referenceCents: number;
  /** Precio huésped a IVA 15 % (antes de tarifa promocional). */
  guestDirectCents: number;
  directCents: number;
  isPromotionalVat: boolean;
  isOverride: boolean;
  isNewYearsEve: boolean;
};

export type StayQuote = {
  slug: string;
  nights: number;
  nightly: StayQuoteNightly[];
  cleaningFeeCents: number;
  nightlyTotalDirectCents: number;
  /** Noches + limpieza (total transferencia). */
  totalDirectCents: number;
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

export function catalogReferenceCentsForSlug(slug: string): number {
  return Math.round(catalogReferencePriceUsd(slug) * 100);
}

/** Cotización de una noche (función pura, testeable sin DB). */
export function quoteNightlyForDate(params: {
  date: string;
  slug: string;
  catalogReferenceCents: number;
  overrides: Map<string, number>;
  vatPeriods?: VatPeriod[];
}): StayQuoteNightly {
  const { date, slug, catalogReferenceCents, overrides, vatPeriods = [] } = params;
  const { referenceCents, isOverride } = referenceCentsForNight(
    date,
    catalogReferenceCents,
    overrides,
  );
  const guestCents = guestDirectCentsFromReference(referenceCents, slug, catalogReferenceCents);
  const { guestDirectCents, isNewYearsEve } = applyNewYearsEveGuestDirectCents(
    date,
    guestCents,
    isOverride,
  );
  return {
    date,
    referenceCents,
    guestDirectCents,
    directCents: directCentsForNight(guestDirectCents, date, vatPeriods),
    isPromotionalVat: isPromotionalVatDate(date, vatPeriods),
    isOverride,
    isNewYearsEve,
  };
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
  const vatPeriods = await loadPromotionalVatPeriods();
  const catalogReferenceCents = catalogReferenceCentsForSlug(prop.slug);

  const nightly = nights.map((date) =>
    quoteNightlyForDate({
      date,
      slug: prop.slug,
      catalogReferenceCents,
      overrides,
      vatPeriods,
    }),
  );

  const nightlyTotalDirectCents = nightly.reduce((sum, n) => sum + n.directCents, 0);
  const cleaning = cleaningFeeCents(prop.slug);
  const totalDirectCents = nightlyTotalDirectCents + cleaning;
  return {
    slug: prop.slug,
    nights: nightly.length,
    nightly,
    cleaningFeeCents: cleaning,
    nightlyTotalDirectCents,
    totalDirectCents,
  };
}

export async function getStayQuoteBySlug(
  slug: string,
  checkIn: string,
  checkOut: string,
): Promise<StayQuote | null> {
  if (!hasDatabase()) return null;
  const prop = await ensurePropertyRowBySlug(slug);
  if (!prop) return null;
  return getStayQuoteByPropertyId(prop.id, checkIn, checkOut);
}

export type CatalogCardQuote = {
  nights: number;
  totalUsd: number;
};

export function toCatalogCardQuote(quote: StayQuote): CatalogCardQuote {
  return {
    nights: quote.nights,
    totalUsd: quote.totalDirectCents / 100,
  };
}

export function fallbackCatalogCardQuote(
  slug: string,
  checkIn: string,
  checkOut: string,
): CatalogCardQuote | null {
  const nights = eachNightIso(checkIn, checkOut);
  if (nights.length < 1) return null;
  const nightlyUsd = Math.round(guestDirectPriceUsd(slug));
  const nightlyCents = nightlyUsd * 100;
  let lodgingCents = 0;
  for (const date of nights) {
    const { guestDirectCents } = applyNewYearsEveGuestDirectCents(date, nightlyCents, false);
    lodgingCents += guestDirectCents;
  }
  const totalUsd = lodgingCents / 100 + cleaningFeeCents(slug) / 100;
  return { nights: nights.length, totalUsd };
}

export async function resolveCatalogCardQuote(
  slug: string,
  checkIn: string,
  checkOut: string,
): Promise<CatalogCardQuote | null> {
  const quote = await getStayQuoteBySlug(slug, checkIn, checkOut);
  if (quote) return toCatalogCardQuote(quote);
  return fallbackCatalogCardQuote(slug, checkIn, checkOut);
}

export async function getCatalogCardQuotesBySlug(
  slugs: string[],
  checkIn: string,
  checkOut: string,
): Promise<Map<string, CatalogCardQuote>> {
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const quote = await resolveCatalogCardQuote(slug, checkIn, checkOut);
      return [slug, quote] as const;
    }),
  );
  const map = new Map<string, CatalogCardQuote>();
  for (const [slug, quote] of entries) {
    if (quote) map.set(slug, quote);
  }
  return map;
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
  const vatPeriods = await loadPromotionalVatPeriods();
  const catalogReferenceCents = catalogReferenceCentsForSlug(prop.slug);

  const days: PricingDay[] = eachDayIsoInclusive(from, to).map((date) => {
    const { referenceCents, isOverride } = referenceCentsForNight(
      date,
      catalogReferenceCents,
      overrides,
    );
    const blockSource = blockSourceForNight(date, blocks);
    const guestCents = guestDirectCentsFromReference(
      referenceCents,
      prop.slug,
      catalogReferenceCents,
    );
    const { guestDirectCents } = applyNewYearsEveGuestDirectCents(
      date,
      guestCents,
      isOverride,
    );
    return {
      date,
      referenceCents,
      directCents: directCentsForNight(guestDirectCents, date, vatPeriods),
      isOverride,
      blocked: blockSource !== undefined,
      blockSource,
    };
  });

  return { baseReferenceCents: catalogReferenceCents, days };
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
