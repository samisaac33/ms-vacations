import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { properties } from "@/db/schema";
import { getImagesBySlugs } from "@/lib/property-images-query";
import {
  getPropertyBySlug,
  groupPropertiesByDestination,
  PROPERTIES,
  type Property,
} from "@/lib/properties";
import { upsertCatalogPropertyBySlug } from "@/lib/seed-properties-db";

export async function getPropertyRowBySlug(slug: string) {
  if (!hasDatabase()) return null;
  try {
    const db = getDb();
    const [row] = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function ensurePropertyRowBySlug(slug: string) {
  const existing = await getPropertyRowBySlug(slug);
  if (existing) return existing;

  const upserted = await upsertCatalogPropertyBySlug(slug);
  if (!upserted) return null;

  return getPropertyRowBySlug(slug);
}

export async function getPropertyRowById(id: string) {
  const db = getDb();
  const [row] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return row ?? null;
}

export async function getReferencePriceCentsBySlug(): Promise<Map<string, number>> {
  if (!hasDatabase()) return new Map();
  try {
    const db = getDb();
    const rows = await db
      .select({ slug: properties.slug, cents: properties.basePricePerNightCents })
      .from(properties);
    return new Map(rows.map((r) => [r.slug, r.cents]));
  } catch {
    return new Map();
  }
}

export function mergeCatalogWithDbPrices(
  catalog: Property[],
  centsBySlug: Map<string, number>,
  imagesBySlug?: Map<string, { src: string; alt: string }[]>,
): Property[] {
  return catalog.map((p) => {
    const cents = centsBySlug.get(p.slug);
    const dbImages = imagesBySlug?.get(p.slug);
    let next = p;
    if (cents !== undefined) {
      next = { ...next, basePricePerNightUsd: cents / 100 };
    }
    if (dbImages && dbImages.length > 0) {
      next = { ...next, images: dbImages };
    }
    return next;
  });
}

export async function getCatalogWithDbPrices(): Promise<Property[]> {
  const centsBySlug = await getReferencePriceCentsBySlug();
  const slugs = PROPERTIES.map((p) => p.slug);
  const imagesBySlug = await getImagesBySlugs(slugs);
  return mergeCatalogWithDbPrices(PROPERTIES, centsBySlug, imagesBySlug);
}

export async function getCatalogGroupedWithDbPrices(): Promise<{
  beach: Property[];
  city: Property[];
}> {
  const catalog = await getCatalogWithDbPrices();
  return groupPropertiesByDestination(catalog);
}

export async function getPropertyBySlugWithDbPrice(slug: string): Promise<Property | undefined> {
  const catalog = getPropertyBySlug(slug);
  if (!catalog) return undefined;
  const row = await getPropertyRowBySlug(slug);
  const dbImages = await getImagesBySlugs([slug]);
  const images = dbImages.get(slug);
  let next = catalog;
  if (row) {
    next = { ...next, basePricePerNightUsd: row.basePricePerNightCents / 100 };
  }
  if (images && images.length > 0) {
    next = { ...next, images };
  }
  return next;
}

export { getAllPropertySlugs } from "@/lib/properties";
