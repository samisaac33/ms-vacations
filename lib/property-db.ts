import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { properties } from "@/db/schema";
import {
  getPropertyBySlug,
  groupPropertiesByDestination,
  PROPERTIES,
  type Property,
} from "@/lib/properties";

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
): Property[] {
  return catalog.map((p) => {
    const cents = centsBySlug.get(p.slug);
    if (cents === undefined) return p;
    return { ...p, basePricePerNightUsd: cents / 100 };
  });
}

export async function getCatalogWithDbPrices(): Promise<Property[]> {
  const centsBySlug = await getReferencePriceCentsBySlug();
  return mergeCatalogWithDbPrices(PROPERTIES, centsBySlug);
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
  if (!row) return catalog;
  return { ...catalog, basePricePerNightUsd: row.basePricePerNightCents / 100 };
}

export { getAllPropertySlugs } from "@/lib/properties";
